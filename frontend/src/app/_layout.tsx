import { Stack, useLocalSearchParams, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Sidebar from "../components/Sidebar";
import { ThemeProvider } from "../components/ThemeContext";
import { getCurrentUser, User } from "../services/auth";

export default function RootLayout() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    role?: string;
    name?: string;
  }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
  }, [pathname]);

  const authRoutes = [
    "/",
    "/login",
    "/role",
    "/signup",
    "/forgot-password",
  ];
  const showSidebar =
    width >= 700 && !authRoutes.includes(pathname);

  return (
    <ThemeProvider>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {showSidebar && (
          <Sidebar
            role={params.role || user?.roles?.[0]?.name}
            name={params.name || user?.name}
          />
        )}

        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </View>
      </View>
    </ThemeProvider>
  );
}
