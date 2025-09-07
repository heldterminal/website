import jwt from 'jsonwebtoken';
import { User } from '@supabase/supabase-js';

// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

export interface HyperTokenPayload {
  sub: string; // user ID
  email: string;
  name?: string;
  picture?: string;
  iat: number;
  exp: number;
}

/**
 * Generate a JWT token for Hyper plugin authentication
 */
export function generateHyperToken(user: User, profile?: any): string {
  const payload: HyperTokenPayload = {
    sub: user.id,
    email: user.email || '',
    name: profile?.full_name || user.user_metadata?.full_name,
    picture: profile?.avatar_url || user.user_metadata?.avatar_url,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  };

  return jwt.sign(payload, JWT_SECRET);
}

/**
 * Verify a JWT token from the Hyper plugin
 */
export function verifyHyperToken(token: string): HyperTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as HyperTokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as HyperTokenPayload;
    return decoded ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    return null;
  }
}

