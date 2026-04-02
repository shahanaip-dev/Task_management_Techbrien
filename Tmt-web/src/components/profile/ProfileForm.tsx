'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/lib/api';

interface ProfileFormProps {
  showHeader?: boolean;
  onSuccess?: () => void;
}

export default function ProfileForm({ showHeader = true, onSuccess }: ProfileFormProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      return toast.error('Current and new password are required');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New password and confirm password do not match');
    }

    setLoading(true);
    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      {showHeader && (
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold text-[#1C1A18]">Profile</h1>
          <p className="text-sm text-[#8A8278] mt-1">Update your password</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E8DDD4] p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-sm text-[#8A8278]">Signed in as</p>
          <p className="text-sm font-medium text-[#1C1A18]">{user?.name} ({user?.email})</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Current password"
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="text-[#8A8278] hover:text-[#1C1A18]"
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? (
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

          <Input
            label="New password"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="text-[#8A8278] hover:text-[#1C1A18]"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? (
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

          <Input
            label="Confirm new password"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-[#8A8278] hover:text-[#1C1A18]"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? (
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

          <div className="flex justify-end">
            <Button type="submit" loading={loading}>Update Password</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
