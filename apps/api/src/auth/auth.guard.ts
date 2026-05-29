import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    let sessionToken = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    }

    if (!sessionToken) {
      // Development mode fallback: If running in development and no token is passed,
      // we can automatically assign Dr. Anand as the logged-in user for simplified testing.
      if (process.env.NODE_ENV !== 'production') {
        const devUser = await this.prisma.user.findFirst({
          where: { email: 'dr.anand@srmist.edu.in' }
        });
        if (devUser) {
          request.user = devUser;
          return true;
        }
      }
      throw new UnauthorizedException('Authorization session token is required.');
    }

    // Verify session in the database
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: {
            interests: {
              include: {
                interest: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session token.');
    }

    // Check if session has expired
    if (new Date() > new Date(session.expires)) {
      // Clean up expired session
      await this.prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      throw new UnauthorizedException('Session token has expired.');
    }

    // Attach user to request
    request.user = session.user;
    return true;
  }
}
