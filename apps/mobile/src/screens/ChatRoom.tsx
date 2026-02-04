import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { listMessages, sendMessage } from "../api";
import { getToken } from "../storage";
import { API_BASE } from "../config";

export default function ChatRoom({ route }: any) {
  const { roomId } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const wsUrl = useMemo(() => API_BASE.replace("http", "ws") + "/ws", []);

  useEffect(() => {
    (async () => {
      const r = await listMessages(roomId);
      setMessages(r.messages ?? []);
    })();
  }, [roomId]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    (async () => {
      const token = await getToken();
      ws = new WebSocket(`${wsUrl}?token=${token}`);
      ws.onmessage = (evt: any) => {
        try {
          const payload = JSON.parse(evt.data);
          if (
            payload.event === "message.new" &&
            payload.data?.roomId === roomId
          ) {
            setMessages((prev) => [...prev, payload.data]);
          }
        } catch {}
      };
    })();

    return () => {
      ws?.close();
    };
  }, [roomId, wsUrl]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    try {
      await sendMessage(roomId, trimmed);
    } catch {}
  };

  const getSenderInfo = (item: any) => {
    if (item.senderType === "AGENT") {
      const name = item.agentInstance?.name ?? "AI Agent";
      return { name, isAgent: true, isSystem: false };
    }
    if (item.senderType === "SYSTEM" || item.kind === "SYSTEM") {
      return { name: "System", isAgent: false, isSystem: true };
    }
    const name = item.sender?.name ?? "User";
    return { name, isAgent: false, isSystem: false };
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(i, idx) => i.id ?? String(idx)}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            메시지가 없습니다.{"\n"}@agent를 포함하면 AI가 응답합니다.
          </Text>
        }
        renderItem={({ item }) => {
          const { name, isAgent, isSystem } = getSenderInfo(item);
          return (
            <View
              style={[
                styles.msgBubble,
                isAgent && styles.agentBubble,
                isSystem && styles.systemBubble,
              ]}
            >
              <Text
                style={[
                  styles.msgSender,
                  isAgent && styles.agentSender,
                  isSystem && styles.systemSender,
                ]}
              >
                {name}
              </Text>
              <Text style={isSystem ? styles.systemText : undefined}>
                {item.text}
              </Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholder="메시지 입력... (@agent로 AI 호출)"
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  msgBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 6,
    marginHorizontal: 16,
  },
  agentBubble: { backgroundColor: "#e8f0fe" },
  systemBubble: { backgroundColor: "#fff3cd", alignSelf: "center" },
  msgSender: { fontWeight: "600", fontSize: 12, marginBottom: 2, color: "#333" },
  agentSender: { color: "#4A6CF7" },
  systemSender: { color: "#856404" },
  systemText: { color: "#856404", fontStyle: "italic", fontSize: 13 },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 20,
    fontSize: 15,
    backgroundColor: "#f8f9fa",
  },
  sendBtn: {
    backgroundColor: "#4A6CF7",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendBtnText: { color: "#fff", fontWeight: "600" },
  empty: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 60,
    fontSize: 14,
    lineHeight: 22,
  },
});
