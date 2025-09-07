# Hyper Plugin Integration

This website integrates with the Trem Hyper Plugin to provide seamless authentication and API access for terminal users.

## Overview

The integration allows Hyper terminal users to:
- Authenticate using OAuth 2.0/OIDC through the plugin
- Access protected API endpoints with Bearer tokens
- View their account information and manage settings
- Sync command history and team data

## Architecture

### Authentication Flow

1. **User clicks User Icon in Hyper** → Opens `http://localhost:3000/account`
2. **If not authenticated** → Plugin initiates OAuth flow in system browser
3. **After OAuth completion** → Plugin stores tokens and can make API calls
4. **API requests** → Include Bearer token automatically
5. **Token validation** → Server verifies JWT tokens against Supabase users

### Components

#### Frontend (React + TypeScript)
- **Account Page** (`/account`) - Main interface for terminal users
- **AuthProvider** - Manages authentication state and generates Hyper tokens
- **JWT Utilities** - Token generation and verification

#### Backend (Express + Supabase)
- **API Server** - Handles authenticated requests from Hyper plugin
- **JWT Middleware** - Validates Bearer tokens
- **Supabase Integration** - User management and data storage

## Setup

### 1. Environment Configuration

Copy `config.env.example` to `.env` and configure:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# JWT Secret for Hyper Plugin Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3001
API_BASE_URL=http://localhost:3001/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Servers

```bash
# Start both frontend and API server
npm run dev:full

# Or start separately:
npm run dev          # Frontend (port 3000)
npm run dev:server   # API server (port 3001)
```

### 4. Configure Hyper Plugin

In your Hyper plugin's `.env` file:

```bash
AUTH_WEBSITE_URL="http://localhost:3000/account"
API_BASE_URL="http://localhost:3001/api"
```

## API Endpoints

### Authentication Required
All endpoints require a valid Bearer token in the Authorization header.

#### User Profile
- `GET /api/user/profile` - Get user profile information
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update user settings

#### Team Management
- `GET /api/team` - Get team members and data

#### Command History (Trem Integration)
- `GET /api/commands` - Get command history
- `POST /api/commands` - Add command to history
- `GET /api/commands/search?q=<query>` - Search commands

#### Health Check
- `GET /api/health` - Server health status

## Database Schema

### Required Tables

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `user_settings`
```sql
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  theme TEXT DEFAULT 'system',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `command_history`
```sql
CREATE TABLE command_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  command TEXT NOT NULL,
  output TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `team_members`
```sql
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES auth.users(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Considerations

### JWT Token Security
- Tokens are signed with a secret key
- Tokens expire after 7 days
- Tokens contain user ID and basic profile info
- No sensitive data in tokens

### API Security
- All endpoints require Bearer token authentication
- CORS configured for localhost development
- Input validation on all endpoints
- Error handling without exposing sensitive information

### Token Management
- Tokens generated on user login
- Tokens can be regenerated from account page
- Tokens invalidated on logout
- No token storage in browser (plugin handles this)

## Development

### Adding New API Endpoints

1. Add route to `server/index.js`
2. Use `verifyHyperToken` middleware
3. Access user via `req.user`
4. Return JSON response

Example:
```javascript
app.get('/api/new-endpoint', verifyHyperToken, async (req, res) => {
  try {
    // Your logic here
    res.json({ data: 'success' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Frontend Integration

The `useAuth` hook provides:
- `hyperToken` - Current JWT token for API calls
- `generateNewHyperToken()` - Regenerate token
- `user` - Current user information
- `profile` - User profile data

### Testing

1. **Start servers**: `npm run dev:full`
2. **Open website**: `http://localhost:3000/account`
3. **Test Hyper plugin**: Click User Icon in Hyper
4. **Verify API calls**: Check network tab for authenticated requests

## Production Deployment

### Environment Variables
- Set `JWT_SECRET` to a strong, unique key
- Configure Supabase production URLs
- Set `PORT` for production server
- Update `API_BASE_URL` for production domain

### Security Checklist
- [ ] Strong JWT secret configured
- [ ] HTTPS enabled
- [ ] CORS configured for production domains
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Error logging configured
- [ ] Database backups configured

### Deployment Options
- **Vercel/Netlify** - Frontend deployment
- **Railway/Render** - Backend API deployment
- **Supabase** - Database and auth
- **Docker** - Containerized deployment

## Troubleshooting

### Common Issues

**"Token verification failed"**
- Check JWT_SECRET is consistent between frontend and backend
- Verify token format and expiration

**"CORS error"**
- Ensure CORS is configured for your domains
- Check API_BASE_URL configuration

**"User not found"**
- Verify Supabase user exists
- Check user_id mapping in database

**"API server not responding"**
- Check server is running on correct port
- Verify environment variables are set

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=app:*
```

## Support

For issues with:
- **Hyper Plugin**: Check plugin documentation
- **Website**: Check this README and React/TypeScript docs
- **API**: Check Express.js and Supabase documentation
- **Authentication**: Review OAuth 2.0/OIDC specifications

