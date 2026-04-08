import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SUPABASE_JWT_SECRET || 'fallback-secret',
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    
    // Supabase JWT payload contains 'sub' (userId) and app_metadata
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.app_metadata?.role || 'PATIENT', 
    };
  }
}
