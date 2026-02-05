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
  const [isSending, setIsSending] = useState(false);
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
    if (!message.trim() || isSending) return;

    // 사용자 메시지 즉시 추가
    const userMessage = { role: 'user', content: message, id: Date.now() };
    setMessages(prev => [...prev, userMessage]);

    // 전송 중 상태
    setIsSending(true);

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
        throw new Error(`HTTP ${response.status}: 서버 응답 실패`);
      }

      // 스트리밍 시작
      setStreaming(true);
      setCurrentStream('');

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
      if (fullResponse) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: fullResponse,
          id: Date.now()
        }]);
      }

      setCurrentStream('');
      setStreaming(false);

    } catch (error) {
      console.error('Chat error:', error);

      // 에러 메시지 표시
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n\n백엔드가 슬립 모드에서 깨어나는 중일 수 있습니다. 30초 후 다시 시도해주세요.`,
        id: Date.now(),
        isError: true
      }]);

      setStreaming(false);
    } finally {
      setIsSending(false);
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
      <div className="border-b p-4 flex justify-between items-center bg-white">
        <h1 className="text-xl font-bold">MSG</h1>
        <div className="flex items-center gap-4">
          {streaming && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-pulse">●</div>
              AI 응답 중...
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 메시지 목록 */}
      <MessageList
        messages={messages}
        streaming={streaming}
        currentStream={currentStream}
      />

      {/* 입력창 - 항상 활성화 */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={false}
        placeholder={streaming ? "AI 응답을 기다리는 중입니다..." : "메시지를 입력하세요"}
      />
    </div>
  );
}
