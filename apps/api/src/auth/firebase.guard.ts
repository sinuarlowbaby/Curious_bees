import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from './firebase-admin.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private firebaseAdmin: FirebaseAdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      throw new UnauthorizedException('Authorization Bearer ID token is required.');
    }

    try {
      let decodedToken: any;

      if (process.env.NODE_ENV !== 'production' && token.startsWith('mock-bypass-token-')) {
        const isFaculty = token.includes('faculty');
        decodedToken = {
          uid: isFaculty ? 'mock-bypass-uid-faculty' : 'mock-bypass-uid-scholar',
          email: isFaculty ? 'dr.priya.faculty@srmist.edu.in' : 'karthik.scholar@srmist.edu.in',
          name: isFaculty ? 'Dr. Priya (Mock Faculty)' : 'Karthik Kumar (Mock Scholar)',
          picture: isFaculty 
            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        };
      } else {
        // 1. Verify token signature using firebase-admin
        decodedToken = await this.firebaseAdmin.verifyToken(token);
      }
      const email = decodedToken.email || '';
      const username = email.split('@')[0].toLowerCase();

      // 4. Find or auto-register user in Supabase PostgreSQL
      let user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          interests: {
            include: {
              interest: true
            }
          }
        }
      });

      if (!user) {
        // Auto-determine default role
        const isFaculty = username.startsWith('dr.') || username.includes('faculty') || username.startsWith('hod.');
        const role = isFaculty ? 'FACULTY' : 'PHD_SCHOLAR';

        user = await this.prisma.user.create({
          data: {
            id: decodedToken.uid, // Map Firebase UID as primary key
            email: email.toLowerCase(),
            name: decodedToken.name || email.split('@')[0],
            image: decodedToken.picture || null,
            role: role as any,
            isApproved: isFaculty, // Faculty auto-approved, scholars require supervisor mapping
            emailVerified: new Date(),
          },
          include: {
            interests: {
              include: {
                interest: true
              }
            }
          }
        });
      }

      // 5. Attach the verified user database model to NestJS request
      request.user = user;
      return true;
    } catch (e: any) {
      throw new UnauthorizedException(e.message || 'Authentication failed.');
    }
  }
}
