'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setMessage('');

    try {
      // 익명 로그인
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) throw error;

      setMessage('✅ 로그인 성공!');

      // 채팅 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error: any) {
      setMessage('❌ 오류: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            MSG
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            AI Messenger
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '시작하기'}
          </button>

          {message && (
            <p className={`text-sm text-center ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>

        <p className="text-xs text-center text-gray-500">
          클릭 한 번으로 바로 시작하세요
        </p>
      </div>
    </div>
  );
}
