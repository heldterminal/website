import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:8083', 'http://127.0.0.1:8081', 'http://127.0.0.1:8083', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "https://utohufqdbpyompkxpusr.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// JWT verification middleware for Hyper plugin tokens
const verifyHyperToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No Bearer token provided' });
  }

  const token = authHeader.substring(7);
  
  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    
    // Get user from Supabase using the sub claim
    const { data: user, error } = await supabase.auth.admin.getUserById(decoded.sub);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate Hyper token endpoint
app.post('/api/auth/hyper-token', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user from Supabase
    const { data: user, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name,
      picture: user.user_metadata?.avatar_url,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-jwt-secret');
    
    res.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// User profile endpoint (requires authentication)
app.get('/api/user/profile', verifyHyperToken, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({
      id: req.user.id,
      email: req.user.email,
      profile: profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User settings endpoint
app.get('/api/user/settings', verifyHyperToken, async (req, res) => {
  try {
    // Get user settings from Supabase
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
    
    res.json({
      settings: settings || {},
      user_id: req.user.id
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user settings endpoint
app.put('/api/user/settings', verifyHyperToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: req.user.id,
        ...req.body
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Failed to update settings' });
    }
    
    res.json({ settings: data });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Team data endpoint
app.get('/api/team', verifyHyperToken, async (req, res) => {
  try {
    // Get team data for the authenticated user
    const { data: teamMembers, error } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles:user_id (*)
      `)
      .eq('team_id', req.user.id); // Assuming user_id is the team_id for simplicity
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch team data' });
    }
    
    res.json({ team: teamMembers || [] });
  } catch (error) {
    console.error('Team fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Command history endpoint (for Trem terminal integration)
app.get('/api/commands', verifyHyperToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const { data: commands, error } = await supabase
      .from('command_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch command history' });
    }
    
    res.json({ commands: commands || [] });
  } catch (error) {
    console.error('Commands fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add command to history endpoint
app.post('/api/commands', verifyHyperToken, async (req, res) => {
  try {
    const { command, output, session_id } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    const { data, error } = await supabase
      .from('command_history')
      .insert({
        user_id: req.user.id,
        command,
        output: output || null,
        session_id: session_id || null
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Failed to save command' });
    }
    
    res.json({ command: data });
  } catch (error) {
    console.error('Command save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search commands endpoint
app.get('/api/commands/search', verifyHyperToken, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const { data: commands, error } = await supabase
      .from('command_history')
      .select('*')
      .eq('user_id', req.user.id)
      .or(`command.ilike.%${q}%,output.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      return res.status(500).json({ error: 'Failed to search commands' });
    }
    
    res.json({ commands: commands || [] });
  } catch (error) {
    console.error('Command search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

