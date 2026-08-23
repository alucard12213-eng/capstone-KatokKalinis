import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
  usePathname,
} from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { logoutUser } from "../services/auth";

type SidebarProps = {
  role?: string;
  name?: string;
};

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

export default function Sidebar({
  role: propRole,
  name: propName,
}: SidebarProps) {
  const pathname = usePathname();

  const params = useLocalSearchParams<{
    role?: string;
    name?: string;
  }>();

  const rawRole =
    propRole ||
    (typeof params.role === "string"
      ? params.role
      : "admin");
  const roleNames = rawRole
    .split(",")
    .map((value) => value.trim().toLowerCase());
  const role = roleNames.includes("super_admin")
    ? "super_admin"
    : "admin";

  const name =
    propName ||
    (typeof params.name === "string"
      ? params.name
      : "Administrator");

  const isSuperAdmin = role === "super_admin";

  /*
  |--------------------------------------------------------------------------
  | SUPER ADMIN MENU
  |--------------------------------------------------------------------------
  */

  const superAdminMenu: MenuItem[] = [
    {
      label: "Barangay Overview",
      icon: "grid-outline",
      route: "/dashboard",
    },
    {
      label: "Monitor Truck",
      icon: "car-outline",
      route: "/monitor-truck",
    },
    {
      label: "Employee",
      icon: "people-outline",
      route: "/employee",
    },
    {
      label: "Contractor",
      icon: "business-outline",
      route: "/contractor",
    },
    {
      label: "Reports",
      icon: "document-text-outline",
      route: "/reports",
    },
    {
      label: "Schedule",
      icon: "calendar-outline",
      route: "/schedule",
    },
    {
      label: "Vendors",
      icon: "storefront-outline",
      route: "/vendors",
    },
    {
      label: "Attendance",
      icon: "time-outline",
      route: "/attendance",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | ADMIN MENU
  |--------------------------------------------------------------------------
  */

  const adminMenu: MenuItem[] = [
    {
      label: "Barangay Overview",
      icon: "grid-outline",
      route: "/dashboard",
    },
    {
      label: "Monitor Truck",
      icon: "car-outline",
      route: "/monitor-truck",
    },
    {
      label: "Residents",
      icon: "people-outline",
      route: "/residents",
    },
    {
      label: "Collection Schedule",
      icon: "calendar-outline",
      route: "/schedule",
    },
    {
      label: "Reports & Issues",
      icon: "document-text-outline",
      route: "/reports",
    },
    {
      label: "Attendance",
      icon: "time-outline",
      route: "/attendance",
    },
  ];

  const menu = isSuperAdmin
    ? superAdminMenu
    : adminMenu;

  /*
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  */

  const navigate = (route: string) => {
    router.replace({
      pathname: route as any,
      params: {
        role,
        name,
      },
    });
  };

  /*
  |--------------------------------------------------------------------------
  | ACTIVE ROUTE
  |--------------------------------------------------------------------------
  */

  const isActive = (route: string) => {
    if (route === "/dashboard") {
      return (
        pathname === "/dashboard" ||
        pathname === "/"
      );
    }

    return pathname === route;
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const handleLogout = async () => {
    try {
      await logoutUser();

      router.replace("/login" as any);
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );

      router.replace("/login" as any);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SIDEBAR
  |--------------------------------------------------------------------------
  */

  return (
    <View style={styles.sidebar}>

      {/* ======================================================
          BRAND / USER HEADER
      ====================================================== */}

      <View style={styles.header}>

        <Text style={styles.logo}>
          KatokKalinis
        </Text>

        <Text style={styles.userName}>
          {name}
        </Text>

        <Text style={styles.userRole}>
          {isSuperAdmin
            ? "SUPER ADMIN"
            : "ADMIN"}
        </Text>

      </View>

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.menuContainer
        }
        showsVerticalScrollIndicator={false}
      >

        {menu.map((item) => {
          const active = isActive(
            item.route
          );

          return (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.menuItem,
                active &&
                  styles.activeItem,
              ]}
              onPress={() =>
                navigate(item.route)
              }
              activeOpacity={0.8}
            >

              <View
                style={[
                  styles.iconContainer,
                  active &&
                    styles.activeIconContainer,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={19}
                  color="#FFFFFF"
                />
              </View>

              <Text
                style={[
                  styles.menuText,
                  active &&
                    styles.activeMenuText,
                ]}
              >
                {item.label}
              </Text>

            </TouchableOpacity>
          );
        })}

        {/* ====================================================
            SPACING
        ==================================================== */}

        <View style={styles.bottomSpacer} />

        {/* ====================================================
            SEPARATOR
        ==================================================== */}

        <View style={styles.separator} />

        {/* ====================================================
            SETTINGS
        ==================================================== */}

        <TouchableOpacity
          style={[
            styles.menuItem,
            isActive("/settings") &&
              styles.activeItem,
          ]}
          onPress={() =>
            navigate("/settings")
          }
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.iconContainer,
              isActive("/settings") &&
                styles.activeIconContainer,
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={19}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={[
              styles.menuText,
              isActive("/settings") &&
                styles.activeMenuText,
            ]}
          >
            Settings
          </Text>

        </TouchableOpacity>

        {/* ====================================================
            LOGOUT
        ==================================================== */}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleLogout}
          activeOpacity={0.8}
        >

          <View
            style={styles.iconContainer}
          >
            <Ionicons
              name="log-out-outline"
              size={19}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.menuText}>
            Logout
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({

  /*
  |--------------------------------------------------------------------------
  | SIDEBAR
  |--------------------------------------------------------------------------
  */

  sidebar: {
    width: 260,
    height: "100vh" as any,
    minHeight: "100%" as any,
    backgroundColor: "#6BCB3C",
    paddingTop: 28,
    paddingHorizontal: 14,
    flexShrink: 0,
  },

  /*
  |--------------------------------------------------------------------------
  | HEADER
  |--------------------------------------------------------------------------
  */

  header: {
    paddingHorizontal: 10,
    marginBottom: 25,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  userName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 22,
  },

  userRole: {
    color: "#E8FFD9",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
    marginTop: 3,
  },

  /*
  |--------------------------------------------------------------------------
  | SCROLL
  |--------------------------------------------------------------------------
  */

  scroll: {
    flex: 1,
  },

  menuContainer: {
    paddingBottom: 25,
  },

  /*
  |--------------------------------------------------------------------------
  | MENU ITEM
  |--------------------------------------------------------------------------
  */

  menuItem: {
    width: "100%",
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
  },

  /*
  |--------------------------------------------------------------------------
  | ACTIVE MENU
  |--------------------------------------------------------------------------
  */

  activeItem: {
    backgroundColor: "#4CAF50",
  },

  /*
  |--------------------------------------------------------------------------
  | ICON
  |--------------------------------------------------------------------------
  */

  iconContainer: {
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  activeIconContainer: {
    width: 25,
    height: 25,
  },

  /*
  |--------------------------------------------------------------------------
  | TEXT
  |--------------------------------------------------------------------------
  */

  menuText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
    marginLeft: 9,
  },

  activeMenuText: {
    fontWeight: "800",
  },

  /*
  |--------------------------------------------------------------------------
  | SPACING
  |--------------------------------------------------------------------------
  */

  bottomSpacer: {
    height: 32,
  },

  /*
  |--------------------------------------------------------------------------
  | SEPARATOR
  |--------------------------------------------------------------------------
  */

  separator: {
    height: 1,
    backgroundColor:
      "rgba(255,255,255,0.30)",
    marginHorizontal: 9,
    marginBottom: 12,
  },

});