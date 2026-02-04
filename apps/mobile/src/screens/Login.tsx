import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { devLogin } from "../api";
import { setToken } from "../storage";

export default function Login({ onAuthed }: { onAuthed: () => void }) {
  const [email, setEmail] = useState("u1@a.com");

  return (
    <View style={styles.container}>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        placeholder="Email"
      />
      <Button
        title="Dev Login"
        onPress={async () => {
          const r = await devLogin(email);
          if (r.accessToken) {
            await setToken(r.accessToken);
            onAuthed();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center", gap: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 },
});
