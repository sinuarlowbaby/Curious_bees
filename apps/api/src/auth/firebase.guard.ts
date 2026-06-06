import { Injectable, CanActivate, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from './firebase-admin.service';

// Email-pattern detection removed in favor of explicit onboarding flow.
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

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

    const isBypass = process.env.AUTH_MODE === 'bypass' || process.env.DEVELOPMENT_MODE === 'true';
    if (isBypass) {
      this.logger.warn('Auth bypass active. Bypassing Firebase authentication.');
      
      // Determine role from token if present, otherwise default to DEV_ROLE or RESEARCH_SCHOLAR
      const defaultRole = process.env.DEV_ROLE || 'RESEARCH_SCHOLAR';
      let devRole = defaultRole;
      if (token.includes('admin')) devRole = 'INSTITUTION_ADMIN';
      else if (token.includes('faculty') || token.includes('supervisor')) devRole = 'RESEARCH_SUPERVISOR';

      request.user = {
        id: 'dev-user',
        name: 'Developer',
        email: 'developer@local.dev',
        role: devRole,
        approved: true,
        status: 'APPROVED',
        department: 'Development',
        firebaseUid: 'dev-uid',
        emailVerified: new Date(),
        interests: []
      };
      
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Authorization Bearer ID token is required.');
    }

    try {
      let decodedToken: any;

      if (process.env.NODE_ENV !== 'production' && token.startsWith('mock-bypass-token-')) {
        this.logger.warn('Using local mock Firebase auth bypass token.');
        const isAdmin = token.includes('admin');
        const isFaculty = token.includes('faculty');
        // Default to scholar if neither admin nor faculty
        decodedToken = {
          uid: isAdmin ? 'mock-bypass-uid-admin' : isFaculty ? 'mock-bypass-uid-faculty' : 'mock-bypass-uid-scholar',
          email: isAdmin ? 'admin.mock@srmist.edu.in' : isFaculty ? 'faculty.mock@srmist.edu.in' : 'scholar.mock@srmist.edu.in',
          name: isAdmin ? 'Admin User (Mock)' : isFaculty ? 'Dr. Priya (Mock Faculty)' : 'Karthik Kumar (Mock Scholar)',
          picture: isAdmin
            ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
            : isFaculty 
              ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        };
      } else {
        this.logger.debug(`Received Firebase bearer token for verification. tokenLength=${token.length}`);
        decodedToken = await this.firebaseAdmin.verifyToken(token);
      }

      const email = decodedToken.email || '';
      if (!email) {
        throw new Error('Firebase token is valid but does not contain an email claim.');
      }

      this.logger.log(`Authenticated Firebase user uid=${decodedToken.uid}, email=${email}`);
      const username = email.split('@')[0].toLowerCase();
      const normalizedEmail = email.toLowerCase();

      let roleSource = 'Database';
      let user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          interests: {
            include: {
              interest: true
            }
          }
        }
      });

      if (!user) {
        roleSource = 'Default / Main Admin Check';
        
        const mainAdminEmail = process.env.MAIN_ADMIN_EMAIL || 'curiousbees@srmist.edu.in';
        const isMainAdmin = normalizedEmail === mainAdminEmail.toLowerCase();
        const isMockAdmin = normalizedEmail === 'admin.mock@srmist.edu.in';
        const isMockFaculty = normalizedEmail === 'faculty.mock@srmist.edu.in';
        const isMockScholar = normalizedEmail === 'scholar.mock@srmist.edu.in';
        const isMockUser = isMockAdmin || isMockFaculty || isMockScholar;
        
        const role = (isMainAdmin || isMockAdmin) ? 'INSTITUTION_ADMIN' 
          : isMockFaculty ? 'RESEARCH_SUPERVISOR' 
          : 'RESEARCH_SCHOLAR';
        const approved = isMainAdmin || isMockUser;
        const status = (isMainAdmin || isMockUser) ? 'APPROVED' : 'ONBOARDING';

        this.logger.log(`Creating CuriousBees user for ${normalizedEmail}: Assigned role=${role}, status=${status}`);
        user = await this.prisma.user.create({
          data: {
            firebaseUid: decodedToken.uid,
            email: normalizedEmail,
            name: decodedToken.name || email.split('@')[0],
            image: decodedToken.picture || null,
            role: role as any,
            approved: approved,
            status: status,
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
      } else {
        this.logger.log(`Existing CuriousBees user found for ${normalizedEmail}; syncing profile fields.`);
        
        // For mock bypass users, also sync role/approved/status to match the bypass token
        const isMockUser = normalizedEmail.endsWith('.mock@srmist.edu.in');
        const mockUpdateData: any = {
          name: decodedToken.name || user.name,
          image: decodedToken.picture || user.image,
          emailVerified: user.emailVerified || new Date(),
        };
        if (isMockUser) {
          const isMockAdmin = normalizedEmail === 'admin.mock@srmist.edu.in';
          const isMockFaculty = normalizedEmail === 'faculty.mock@srmist.edu.in';
          mockUpdateData.role = isMockAdmin ? 'INSTITUTION_ADMIN' : isMockFaculty ? 'RESEARCH_SUPERVISOR' : 'RESEARCH_SCHOLAR';
          mockUpdateData.approved = true;
          mockUpdateData.status = 'APPROVED';
        }

        user = await this.prisma.user.update({
          where: { id: user.id },
          data: mockUpdateData,
          include: {
            interests: {
              include: {
                interest: true
              }
            }
          }
        });
      }

      this.logger.log(`CuriousBees user sync complete for ${normalizedEmail}: id=${user.id}, role=${user.role}, approved=${user.approved}`);
      
      // ── Structured [AUTH] audit logs ──────────────────────────────────────
      this.logger.log(`[AUTH] User Email: ${normalizedEmail}`);
      this.logger.log(`[AUTH] User UID: ${decodedToken.uid}`);
      this.logger.log(`[AUTH] Retrieved Role: ${user.role}`);
      this.logger.log(`[AUTH] Role Source: ${roleSource}`);
      
      const redirectRoute = 
        user.status === 'ONBOARDING' ? '/onboarding' :
        (!user.approved || user.status !== 'APPROVED') ? '/verification-pending' :
        user.role === 'INSTITUTION_ADMIN' ? '/admin/dashboard' : '/dashboard';
        
      this.logger.log(`[AUTH] Expected Redirect Target: ${redirectRoute}`);
      
      request.user = user;
      return true;
    } catch (e: any) {
      this.logger.error(`Authentication failed: ${e.message}`);
      throw new UnauthorizedException({
        message: e.message || 'Authentication failed.',
        code: 'FIREBASE_AUTH_SYNC_FAILED',
        details: this.firebaseAdmin.getMissingCredentials?.() || [],
      });
    }
  }
}
