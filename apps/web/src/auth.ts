import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Only use Prisma adapter if database URL is configured
  adapter: process.env.DATABASE_URL ? PrismaAdapter(prisma) : undefined,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/auth/denied', // Custom access denied page
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const email = user.email || '';
      
      // Strict email checking: ONLY allow @srmist.edu.in domain
      if (email.toLowerCase().endsWith('@srmist.edu.in')) {
        return true;
      }
      
      // Return false to reject and redirect to error page
      return false;
    },
    async session({ session, token, user }) {
      if (session.user) {
        // If Prisma is used, attach the custom fields (role, department, bio)
        // For local mock purposes, we will default it
        (session.user as any).role = (user as any)?.role || 'PHD_SCHOLAR';
        (session.user as any).id = user?.id;
        (session.user as any).department = (user as any)?.department || null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'srm-recollab-super-secret-key-12345',
});
