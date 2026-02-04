import React, { useEffect, useState } from "react";
import {
  View,
  Button,
  FlatList,
  Pressable,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import {
  createRoom,
  listRooms,
  createAgent,
  createPairingCode,
} from "../api";

export default function Rooms({ navigation }: any) {
  const [rooms, setRooms] = useState<any[]>([]);

  async function refresh() {
    const r = await listRooms();
    setRooms(r.rooms ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Button
          title="New Room"
          onPress={async () => {
            await createRoom("GROUP", "New Room");
            await refresh();
          }}
        />
        <Button
          title="Add Claude Agent"
          onPress={async () => {
            const r = await createAgent("My Claude", "CLAUDE_CLI");
            Alert.alert("Agent Created", r.agent?.name ?? "Error");
          }}
        />
        <Button
          title="Pairing Code"
          onPress={async () => {
            const r = await createPairingCode();
            Alert.alert(
              "Pairing Code",
              `Code: ${r.code}\nExpires: ${r.expiresAt}`,
            );
          }}
        />
      </View>
      <FlatList
        data={rooms}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("ChatRoom", {
                roomId: item.id,
                title: item.title,
              })
            }
          >
            <View style={styles.roomItem}>
              <Text style={styles.roomTitle}>{item.title ?? item.id}</Text>
              <Text style={styles.roomType}>{item.type}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  actions: { gap: 8, marginBottom: 16 },
  roomItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  roomTitle: { fontSize: 16, fontWeight: "600" },
  roomType: { opacity: 0.6, fontSize: 12, marginTop: 4 },
});
