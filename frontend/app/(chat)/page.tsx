'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
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

    // WebSocket 연결
    connectWebSocket(user.id);
  };

  const connectWebSocket = (userId: string) => {
    const wsUrl = `ws://localhost:8000/api/chat/ws?user_id=${userId}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'stream') {
        setCurrentStream(prev => prev + data.content);
        setStreaming(true);
      } else if (data.type === 'done') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content,
          id: data.message_id
        }]);
        setCurrentStream('');
        setStreaming(false);
      } else if (data.type === 'error') {
        alert('오류: ' + data.message);
        setStreaming(false);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setWs(websocket);
  };

  const handleSendMessage = (message: string, files: File[]) => {
    if (!ws || !message.trim()) return;

    // 사용자 메시지 추가
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    // 서버로 전송
    ws.send(JSON.stringify({
      type: 'message',
      content: message,
      files: []  // TODO: 파일 업로드 구현
    }));
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
