'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from './Button';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="metadata-text block mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
          placeholder="admin@lecturesystem.local"
        />
      </div>

      <div>
        <label htmlFor="password" className="metadata-text block mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      <div className="text-sm text-text-muted text-center">
        <p>Default credentials:</p>
        <p className="font-mono text-xs mt-1">
          admin@lecturesystem.local / changeme123
        </p>
      </div>
    </form>
  );
}
