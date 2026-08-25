import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiRequest } from "../../services/api";

export default function DriverProfile() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmation) {
      Alert.alert("Change password", "Complete all password fields.");
      return;
    }
    if (newPassword !== confirmation) {
      Alert.alert("Change password", "The new passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const result = await apiRequest("/change-password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmation,
        }),
      });
      Alert.alert("Password updated", result?.message || "Your password was changed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
    } catch (error) {
      Alert.alert("Unable to change password", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["katokkalinis_token", "authToken", "userId", "userName", "userEmail", "userRole"]);
    router.replace("/role");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Back</Text></TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.brand}>KatokKalinis</Text>
          <Text style={styles.heading}>Account security</Text>
          <Text style={styles.copy}>Update the password used to sign in to the Driver app.</Text>
          <TextInput style={styles.input} placeholder="Current password" placeholderTextColor="#829083" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
          <TextInput style={styles.input} placeholder="New password" placeholderTextColor="#829083" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          <TextInput style={styles.input} placeholder="Confirm new password" placeholderTextColor="#829083" secureTextEntry value={confirmation} onChangeText={setConfirmation} />
          <TouchableOpacity style={styles.primaryButton} onPress={changePassword} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Change password</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}><Text style={styles.logoutText}>Log out</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EDF6E8" },
  container: { flex: 1 },
  header: { backgroundColor: "#7ED957", padding: 18, flexDirection: "row", alignItems: "center", gap: 24 },
  back: { color: "#fff", fontSize: 14 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700" },
  content: { margin: 18, padding: 20, backgroundColor: "#fff", borderRadius: 14 },
  brand: { color: "#4CAF50", fontSize: 22, fontWeight: "800", marginBottom: 28 },
  heading: { color: "#2E7D32", fontSize: 22, fontWeight: "700" },
  copy: { color: "#66736A", fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 22 },
  input: { borderWidth: 1, borderColor: "#D9E7D5", borderRadius: 8, padding: 13, marginBottom: 12, color: "#1F2A24", backgroundColor: "#FAFDFA" },
  primaryButton: { backgroundColor: "#4CAF50", borderRadius: 22, minHeight: 46, justifyContent: "center", alignItems: "center", marginTop: 8 },
  primaryText: { color: "#fff", fontWeight: "700" },
  logoutButton: { alignItems: "center", padding: 15, marginTop: 8 },
  logoutText: { color: "#C0392B", fontWeight: "600" },
});
