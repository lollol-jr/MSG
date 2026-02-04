import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  Text,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import {
  createRoom,
  listRooms,
  createAgent,
  listAgents,
  createPairingCode,
  inviteAgentToRoom,
} from "../api";

export default function Rooms({ navigation }: any) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [rr, ar] = await Promise.all([listRooms(), listAgents()]);
      setRooms(rr.rooms ?? []);
      setAgents(ar.agents ?? []);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreateAgent = async () => {
    try {
      const r = await createAgent("My Claude", "CLAUDE_CLI");
      if (r.agent) {
        Alert.alert(
          "Agent 등록 완료",
          `${r.agent.name} (${r.agent.provider})\n\n다음 단계: Pairing Code를 생성하여 Mac의 Agent Gateway에 입력하세요.`,
        );
        await refresh();
      } else {
        Alert.alert("Error", JSON.stringify(r));
      }
    } catch (e: any) {
      Alert.alert("Agent 등록 실패", e.message);
    }
  };

  const handlePairingCode = async () => {
    try {
      const r = await createPairingCode();
      if (r.code) {
        Alert.alert(
          "Pairing Code",
          `코드: ${r.code}\n유효시간: 10분\n\nMac 터미널에서 실행:\ncd apps/agent-gateway && npx tsx src/index.ts\n\n위 코드를 입력하면 Agent가 연결됩니다.`,
        );
      } else {
        Alert.alert("Error", JSON.stringify(r));
      }
    } catch (e: any) {
      Alert.alert("Pairing 실패", e.message);
    }
  };

  const handleNewRoom = async () => {
    try {
      const r = await createRoom("GROUP", "New Room");
      if (r.room) {
        // If agents exist, ask to invite
        if (agents.length > 0) {
          Alert.alert(
            "방 생성 완료",
            "Agent를 이 방에 초대할까요?",
            [
              { text: "나중에", style: "cancel", onPress: refresh },
              {
                text: "초대",
                onPress: async () => {
                  for (const a of agents) {
                    await inviteAgentToRoom(r.room.id, a.id);
                  }
                  Alert.alert("완료", `${agents.length}개 Agent 초대됨`);
                  await refresh();
                },
              },
            ],
          );
        } else {
          await refresh();
        }
      }
    } catch (e: any) {
      Alert.alert("방 생성 실패", e.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Agent Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Agents</Text>
        {agents.length === 0 ? (
          <Pressable style={styles.btnPrimary} onPress={handleCreateAgent}>
            <Text style={styles.btnPrimaryText}>+ Claude Agent 등록</Text>
          </Pressable>
        ) : (
          <View style={styles.agentList}>
            {agents.map((a) => (
              <View key={a.id} style={styles.agentItem}>
                <Text style={styles.agentName}>{a.name}</Text>
                <Text style={styles.agentProvider}>{a.provider}</Text>
              </View>
            ))}
            <View style={styles.row}>
              <Pressable style={styles.btnSmall} onPress={handleCreateAgent}>
                <Text style={styles.btnSmallText}>+ Agent 추가</Text>
              </Pressable>
              <Pressable
                style={[styles.btnSmall, styles.btnPairing]}
                onPress={handlePairingCode}
              >
                <Text style={styles.btnSmallText}>Pairing Code</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Rooms Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Rooms</Text>
        <Pressable style={styles.btnNew} onPress={handleNewRoom}>
          <Text style={styles.btnNewText}>+ New Room</Text>
        </Pressable>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>방이 없습니다. New Room을 눌러 생성하세요.</Text>
        }
        renderItem={({ item }) => {
          const agentNames = (item.agents ?? [])
            .map((a: any) => a.agentInstance?.name)
            .filter(Boolean);
          const memberCount = item.members?.length ?? 0;

          return (
            <Pressable
              onPress={() =>
                navigation.navigate("ChatRoom", {
                  roomId: item.id,
                  title: item.title,
                })
              }
            >
              <View style={styles.roomItem}>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomTitle}>
                    {item.title ?? "Untitled"}
                  </Text>
                  <Text style={styles.roomType}>{item.type}</Text>
                </View>
                <Text style={styles.roomMeta}>
                  {memberCount} members
                  {agentNames.length > 0 && ` · Agents: ${agentNames.join(", ")}`}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
  agentList: { marginTop: 8, gap: 8 },
  agentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  agentName: { fontSize: 14, fontWeight: "600" },
  agentProvider: { fontSize: 12, color: "#666", marginTop: 2 },
  row: { flexDirection: "row", gap: 8 },
  btnPrimary: {
    marginTop: 8,
    backgroundColor: "#4A6CF7",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnPrimaryText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  btnSmall: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    alignItems: "center",
  },
  btnPairing: { backgroundColor: "#d4edda" },
  btnSmallText: { fontSize: 13, fontWeight: "600", color: "#333" },
  btnNew: {
    backgroundColor: "#4A6CF7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnNewText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  roomItem: {
    padding: 14,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 8,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomTitle: { fontSize: 15, fontWeight: "600" },
  roomType: {
    fontSize: 11,
    color: "#666",
    backgroundColor: "#e9ecef",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  roomMeta: { fontSize: 12, color: "#888", marginTop: 4 },
  empty: { textAlign: "center", color: "#aaa", marginTop: 40, fontSize: 14 },
});
