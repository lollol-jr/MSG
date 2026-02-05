'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const handleSendMessage = async (message: string, files: File[]) => {
    if (!message.trim() || streaming) return;

    // 사용자 메시지 추가
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setStreaming(true);
    setCurrentStream('');

    try {
      // HTTP POST 요청
      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          message: message,
          files: []
        })
      });

      if (!response.ok) {
        throw new Error('채팅 요청 실패');
      }

      // 스트리밍 응답 처리
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullResponse += chunk;
          setCurrentStream(fullResponse);
        }
      }

      // 완료된 응답 메시지 추가
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fullResponse
      }]);
      setCurrentStream('');
      setStreaming(false);

    } catch (error) {
      console.error('Chat error:', error);
      alert('메시지 전송 중 오류가 발생했습니다.');
      setStreaming(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">MSG</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          로그아웃
        </button>
      </div>

      {/* 메시지 목록 */}
      <MessageList
        messages={messages}
        streaming={streaming}
        currentStream={currentStream}
      />

      {/* 입력창 */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={streaming}
      />
    </div>
  );
}
