import { StyleSheet, Text, View } from "react-native";

export default function MonitorTruck() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitor Truck</Text>
      <Text style={styles.subtitle}>
        Garbage truck monitoring will appear here.
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
  },
  subtitle: {
    marginTop: 8,
    color: "#777",
  },
});