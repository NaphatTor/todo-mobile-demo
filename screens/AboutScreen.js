// screens/AboutScreen.js
// EN code + TH comments

import { Text, View } from "react-native";

export default function AboutScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>About This App</Text>
      <Text style={{ marginTop: 10, textAlign: "center" }}>
        A simple React Native demo app (Expo + AsyncStorage) built in 1–2 days
        to demonstrate mobile skills for interview.
      </Text>

      <View style={{ height: 16 }} />

      <Text>Tech stack:</Text>
      <Text>- React Native (Expo)</Text>
      <Text>- React Navigation (Stack)</Text>
      <Text>- AsyncStorage (local persistence)</Text>

    </View>
  );
}
