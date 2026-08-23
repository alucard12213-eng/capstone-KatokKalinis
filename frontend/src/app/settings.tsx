import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "../components/ThemeContext";

export default function Settings() {
  const { width } = useWindowDimensions();

  const params = useLocalSearchParams<{
    role?: string;
    name?: string;
  }>();

  const role =
    typeof params.role === "string"
      ? params.role
      : "admin";

  const name =
    typeof params.name === "string" &&
    params.name.length > 0
      ? params.name
      : "Administrator";

  const isSuperAdmin = role === "super_admin";
  const isMobile = width < 700;

  const {
    isDark,
    toggleTheme,
  } = useTheme();

  const [notifications, setNotifications] =
    React.useState(true);

  const [showPassword, setShowPassword] =
    React.useState(false);

  const [currentPassword, setCurrentPassword] =
    React.useState("");

  const [newPassword, setNewPassword] =
    React.useState("");

  const [confirmPassword, setConfirmPassword] =
    React.useState("");

  const colors = {
    background: isDark
      ? "#121212"
      : "#F5F7F4",

    card: isDark
      ? "#1E1E1E"
      : "#FFFFFF",

    text: isDark
      ? "#FFFFFF"
      : "#333333",

    secondary: isDark
      ? "#AAAAAA"
      : "#777777",

    border: isDark
      ? "#333333"
      : "#EEEEEE",

    input: isDark
      ? "#292929"
      : "#F8F9F7",

    green: "#4CAF50",

    greenLight: isDark
      ? "#243A22"
      : "#EDF6E8",
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      Alert.alert(
        "Missing Information",
        "Please enter your current password."
      );
      return;
    }

    if (!newPassword) {
      Alert.alert(
        "Missing Information",
        "Please enter your new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        "Invalid Password",
        "Your new password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "The new passwords do not match."
      );
      return;
    }

    Alert.alert(
      "Password Change",
      "Password changing will be connected to the backend next."
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          isMobile &&
            styles.mobileContent,
        ]}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                },
              ]}
            >
              Settings
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.secondary,
                },
              ]}
            >
              Manage your KatokKalinis account
              and system preferences
            </Text>
          </View>

          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor:
                  colors.greenLight,
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={colors.green}
            />

            <Text
              style={[
                styles.roleBadgeText,
                {
                  color: colors.green,
                },
              ]}
            >
              {isSuperAdmin
                ? "SUPER ADMIN"
                : "ADMIN"}
            </Text>
          </View>
        </View>

        {/* =====================================================
            PROFILE
        ===================================================== */}

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.card,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                {
                  backgroundColor:
                    colors.greenLight,
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={21}
                color={colors.green}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Profile
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
                Your administrator account
              </Text>
            </View>
          </View>

          <View style={styles.profileRow}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor:
                    colors.greenLight,
                },
              ]}
            >
              <Ionicons
                name="person"
                size={28}
                color={colors.green}
              />
            </View>

            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.profileName,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {name}
              </Text>

              <Text
                style={[
                  styles.profileRole,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
                {isSuperAdmin
                  ? "Super Administrator"
                  : "Administrator"}
              </Text>
            </View>
          </View>
        </View>

        {/* =====================================================
            APPEARANCE
        ===================================================== */}

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.card,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                {
                  backgroundColor:
                    colors.greenLight,
                },
              ]}
            >
              <Ionicons
                name="color-palette-outline"
                size={21}
                color={colors.green}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Appearance
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
                Customize how KatokKalinis looks
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.settingRow,
              {
                borderBottomColor:
                  colors.border,
              },
            ]}
          >
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor:
                      colors.greenLight,
                  },
                ]}
              >
                <Ionicons
                  name={
                    isDark
                      ? "moon-outline"
                      : "sunny-outline"
                  }
                  size={19}
                  color={colors.green}
                />
              </View>

              <View style={styles.settingText}>
                <Text
                  style={[
                    styles.settingTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Dark Mode
                </Text>

                <Text
                  style={[
                    styles.settingDescription,
                    {
                      color:
                        colors.secondary,
                    },
                  ]}
                >
                  {isDark
                    ? "Dark appearance is enabled"
                    : "Use a darker appearance"}
                </Text>
              </View>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: "#D5D5D5",
                true: "#A9D99B",
              }}
              thumbColor={
                isDark
                  ? "#4CAF50"
                  : "#FFFFFF"
              }
            />
          </View>
        </View>

        {/* =====================================================
            NOTIFICATIONS
        ===================================================== */}

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.card,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                {
                  backgroundColor:
                    colors.greenLight,
                },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={21}
                color={colors.green}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Notifications
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
                Manage system notifications
              </Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor:
                      colors.greenLight,
                  },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={19}
                  color={colors.green}
                />
              </View>

              <View style={styles.settingText}>
                <Text
                  style={[
                    styles.settingTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  System Notifications
                </Text>

                <Text
                  style={[
                    styles.settingDescription,
                    {
                      color:
                        colors.secondary,
                    },
                  ]}
                >
                  Receive important system updates
                </Text>
              </View>
            </View>

            <Switch
              value={notifications}
              onValueChange={
                setNotifications
              }
              trackColor={{
                false: "#D5D5D5",
                true: "#A9D99B",
              }}
              thumbColor={
                notifications
                  ? "#4CAF50"
                  : "#FFFFFF"
              }
            />
          </View>
        </View>

        {/* =====================================================
            SECURITY
        ===================================================== */}

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.card,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                {
                  backgroundColor:
                    colors.greenLight,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={21}
                color={colors.green}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Security
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
                Manage your account security
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.passwordButton}
            onPress={() =>
              setShowPassword(
                !showPassword
              )
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="key-outline"
              size={19}
              color={colors.green}
            />

            <Text
              style={[
                styles.passwordButtonText,
                {
                  color: colors.text,
                },
              ]}
            >
              Change Password
            </Text>

            <Ionicons
              name={
                showPassword
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={19}
              color={colors.secondary}
            />
          </TouchableOpacity>

          {showPassword && (
            <View style={styles.passwordForm}>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Current Password
              </Text>

              <TextInput
                value={currentPassword}
                onChangeText={
                  setCurrentPassword
                }
                secureTextEntry
                placeholder="Enter current password"
                placeholderTextColor={
                  colors.secondary
                }
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,
                    color: colors.text,
                    borderColor:
                      colors.border,
                  },
                ]}
              />

              <Text
                style={[
                  styles.inputLabel,
                  {
                    color: colors.text,
                  },
                ]}
              >
                New Password
              </Text>

              <TextInput
                value={newPassword}
                onChangeText={
                  setNewPassword
                }
                secureTextEntry
                placeholder="Enter new password"
                placeholderTextColor={
                  colors.secondary
                }
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,
                    color: colors.text,
                    borderColor:
                      colors.border,
                  },
                ]}
              />

              <Text
                style={[
                  styles.inputLabel,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Confirm New Password
              </Text>

              <TextInput
                value={confirmPassword}
                onChangeText={
                  setConfirmPassword
                }
                secureTextEntry
                placeholder="Confirm new password"
                placeholderTextColor={
                  colors.secondary
                }
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,
                    color: colors.text,
                    borderColor:
                      colors.border,
                  },
                ]}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={
                  handleChangePassword
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="save-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Save Password
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* =====================================================
            ADMIN ACCESS
        ===================================================== */}

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.card,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                {
                  backgroundColor:
                    colors.greenLight,
                },
              ]}
            >
              <Ionicons
                name="shield-outline"
                size={21}
                color={colors.green}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Access Level
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
                Current account permissions
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.accessBox,
              {
                backgroundColor:
                  colors.greenLight,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={colors.green}
            />

            <View style={styles.accessText}>
              <Text
                style={[
                  styles.accessTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {isSuperAdmin
                  ? "Super Administrator Access"
                  : "Administrator Access"}
              </Text>

              <Text
                style={[
                  styles.accessDescription,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
                {isSuperAdmin
                  ? "Full system management permissions."
                  : "Administrative access to assigned system functions."}
              </Text>
            </View>
          </View>
        </View>

        {/* =====================================================
            SYSTEM INFORMATION
        ===================================================== */}

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.card,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                {
                  backgroundColor:
                    colors.greenLight,
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={21}
                color={colors.green}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                System Information
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
                KatokKalinis Administration
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text
              style={[
                styles.infoLabel,
                {
                  color:
                    colors.secondary,
                },
              ]}
            >
              System
            </Text>

            <Text
              style={[
                styles.infoValue,
                {
                  color: colors.text,
                },
              ]}
            >
              KatokKalinis
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text
              style={[
                styles.infoLabel,
                {
                  color:
                    colors.secondary,
                },
              ]}
            >
              Version
            </Text>

            <Text
              style={[
                styles.infoValue,
                {
                  color: colors.text,
                },
              ]}
            >
              1.0.0
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text
              style={[
                styles.infoLabel,
                {
                  color:
                    colors.secondary,
                },
              ]}
            >
              Account Type
            </Text>

            <Text
              style={[
                styles.infoValue,
                {
                  color: colors.green,
                },
              ]}
            >
              {isSuperAdmin
                ? "Super Admin"
                : "Admin"}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.footer,
            {
              color: colors.secondary,
            },
          ]}
        >
          KatokKalinis Administration System
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 32,
    paddingBottom: 60,
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },

  mobileContent: {
    padding: 18,
    paddingBottom: 45,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    fontSize: 29,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },

  roleBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },

  card: {
    borderRadius: 12,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  sectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
  },

  sectionSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },

  profileInfo: {
    marginLeft: 14,
  },

  profileName: {
    fontSize: 17,
    fontWeight: "800",
  },

  profileRole: {
    fontSize: 12,
    marginTop: 3,
  },

  settingRow: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },

  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  settingText: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  settingDescription: {
    fontSize: 11,
    marginTop: 3,
  },

  passwordButton: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  passwordButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },

  passwordForm: {
    paddingTop: 12,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 13,
    fontSize: 13,
  },

  saveButton: {
    height: 46,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  accessBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 15,
  },

  accessText: {
    flex: 1,
    marginLeft: 12,
  },

  accessTitle: {
    fontSize: 14,
    fontWeight: "800",
  },

  accessDescription: {
    fontSize: 11,
    marginTop: 4,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11,
  },

  infoLabel: {
    fontSize: 12,
  },

  infoValue: {
    fontSize: 12,
    fontWeight: "700",
  },

  footer: {
    textAlign: "center",
    fontSize: 10,
    marginTop: 5,
  },
});
