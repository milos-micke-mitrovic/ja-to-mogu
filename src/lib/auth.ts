import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { loginSchema } from '@/lib/validations/auth';

// Define UserRole type locally (matches Prisma enum)
type UserRole = 'CLIENT' | 'OWNER' | 'GUIDE' | 'ADMIN';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: UserRole;
      emailVerified: Date | null;
    };
  }

  interface User {
    role: UserRole;
    emailVerified: Date | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // @ts-expect-error - PrismaAdapter version mismatch with next-auth
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify-email',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role as UserRole,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') {
        return true;
      }

      // For credentials, check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      return !!existingUser;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.email = session.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.emailVerified = token.emailVerified as Date | null;
      }

      return session;
    },
  },
  events: {
    async linkAccount({ user }) {
      // When a user links their account (OAuth), mark email as verified
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
});
