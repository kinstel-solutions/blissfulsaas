import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService
  ) {
    const supabaseUrl = config.get<string>('SUPABASE_URL') || config.getOrThrow<string>('NEXT_PUBLIC_SUPABASE_URL');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['ES256'],
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    
    // Fetch the ground truth role from the database
    // This prevents "Forbidden resource" if the JWT claim is missing/stale
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub }
    });
    
    return {
      userId: payload.sub,
      email: payload.email,
      role: user?.role || payload.app_metadata?.role || 'PATIENT', 
    };
  }
}
