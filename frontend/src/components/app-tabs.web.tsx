import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link, usePathname } from "expo-router";

const tabs = [
  {
    name: "dashboard",
    label: "Dashboard",
    href: "/dashboard" as const,
  },
  {
    name: "employee",
    label: "Employees",
    href: "/employee" as const,
  },
  {
    name: "contractor",
    label: "Contractors",
    href: "/contractor" as const,
  },
  {
    name: "vendors",
    label: "Vendors",
    href: "/vendors" as const,
  },
  {
    name: "reports",
    label: "Reports",
    href: "/reports" as const,
  },
];

export default function AppTabsWeb() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link key={tab.name} href={tab.href} asChild>
            <Pressable
              style={[
                styles.tab,
                active && styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  active && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "transparent",
  },

  activeTab: {
    backgroundColor: "#EAF6E8",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

  activeTabText: {
    color: "#4CAF50",
  },
});