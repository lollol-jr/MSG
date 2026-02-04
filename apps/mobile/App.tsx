import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./src/screens/Login";
import Rooms from "./src/screens/Rooms";
import ChatRoom from "./src/screens/ChatRoom";
import { getToken } from "./src/storage";

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      setAuthed(!!t);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!authed ? (
          <Stack.Screen name="Login" options={{ title: "MSG Login" }}>
            {(props) => (
              <Login {...props} onAuthed={() => setAuthed(true)} />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="Rooms"
              component={Rooms}
              options={{ title: "MSG Rooms" }}
            />
            <Stack.Screen
              name="ChatRoom"
              component={ChatRoom}
              options={({ route }: any) => ({
                title: route.params?.title ?? "Chat",
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
