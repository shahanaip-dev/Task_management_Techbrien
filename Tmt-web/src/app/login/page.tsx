'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState<{ email?: string; password?: string }>({});

    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
      const errs: typeof errors = {};
      if (!form.email)    errs.email    = 'Email is required';
      if (!form.password) errs.password = 'Password is required';
      setErrors(errs);
      return !Object.keys(errs).length;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      setLoading(true);
      try {
        await login(form);
        toast.success('Welcome back!');
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Login failed');
      } finally { setLoading(false); }
    };

    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-xl border border-[#E8DDD4] shadow-sm p-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-12 h-12 bg-[#7D1F1F] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-[#1C1A18]">Sign in to TMT</h1>
              <p className="text-sm text-[#8A8278] mt-1 font-light">Task Management Tool</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email address" type="email"
                placeholder="you@company.com"
                value={form.email} error={errors.email}
                autoComplete="email" required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="Password" type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password} error={errors.password}
                autoComplete="current-password" required
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-[#8A8278] hover:text-[#1C1A18]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.9 10.9a3 3 0 104.24 4.24M9.88 4.24A10.94 10.94 0 0112 4c5.05 0 9.27 3.11 11 7.5a12.98 12.98 0 01-4.25 5.4M6.62 6.62A12.98 12.98 0 001 11.5 11.18 11.18 0 005.3 17" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" strokeWidth={2} />
                      </svg>
                    )}
                  </button>
                }
              />
            <Button type="submit" size="lg" loading={loading} className="mt-2 w-full justify-center">
              Sign in
            </Button>
          </form>


        </div>
      </div>
    </main>
  );
}
