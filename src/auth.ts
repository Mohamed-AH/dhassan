import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Debug: Check if secret is loaded
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET);
console.log('AUTH_SECRET:', process.env.AUTH_SECRET);

const nextAuthConfig = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'dev-secret-min-32-chars-long-change-in-prod',
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
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

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@lecturesystem.local';
        const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

        if (
          credentials.email === adminEmail &&
          credentials.password === adminPassword
        ) {
          return {
            id: '1',
            email: adminEmail,
            name: 'Admin',
            role: 'admin',
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnLogin = nextUrl.pathname.startsWith('/admin/login');

      if (isOnAdmin && !isOnLogin) {
        if (!isLoggedIn) return false;
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});

// Debug logging
console.log('NextAuth config:', nextAuthConfig);
console.log('Handlers:', nextAuthConfig.handlers);

export const handlers = nextAuthConfig.handlers;
export const auth = nextAuthConfig.auth;
export const signIn = nextAuthConfig.signIn;
export const signOut = nextAuthConfig.signOut;
