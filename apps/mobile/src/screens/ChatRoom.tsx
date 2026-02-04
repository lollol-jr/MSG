import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  TextInput,
  Button,
  StyleSheet,
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

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(i, idx) => i.id ?? String(idx)}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.msgBubble,
              item.senderType === "AGENT" && styles.agentBubble,
            ]}
          >
            <Text style={styles.msgSender}>
              {item.senderType === "AGENT" ? "AI Agent" : "You"}
            </Text>
            <Text>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholder="Type a message..."
        />
        <Button
          title="Send"
          onPress={async () => {
            if (!text.trim()) return;
            await sendMessage(roomId, text);
            setText("");
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  msgBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 6,
  },
  agentBubble: { backgroundColor: "#e8f0fe" },
  msgSender: { fontWeight: "600", fontSize: 12, marginBottom: 2 },
  inputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
  },
});
