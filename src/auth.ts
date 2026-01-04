import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For now, use environment variables for admin credentials
        // In production, you'd want to store this in the database
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@lecturesystem.local';
        const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

        if (credentials.email !== adminEmail) {
          return null;
        }

        // In production, the password would be hashed in the database
        // For now, we'll compare directly (will add hashing when we add user model)
        const isValid = credentials.password === adminPassword;

        if (!isValid) {
          return null;
        }

        // Return user object (will be stored in session)
        return {
          id: '1',
          email: adminEmail,
          name: 'Admin',
          role: 'admin',
        };
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
