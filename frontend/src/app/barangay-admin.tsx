import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function BarangayAdmin() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Barangay Admin</Text>
      <Text style={styles.subtitle}>
        Barangay administration
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F4",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4CAF50",
  },

  subtitle: {
    marginTop: 8,
    color: "#777",
  },
});
