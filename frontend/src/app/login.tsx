import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../services/api";
import { saveLogin } from "../services/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      Alert.alert(
        "Login",
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const loginUrl = `${API_URL}/login`;

      console.log("=================================");
      console.log("LOGIN START");
      console.log("LOGIN URL:", loginUrl);
      console.log("EMAIL:", cleanEmail);
      console.log("=================================");

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password,
        }),
      });

      console.log("LOGIN HTTP STATUS:", response.status);

      const responseText = await response.text();

      console.log("LOGIN RAW RESPONSE:", responseText);

      let data: any = null;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "LOGIN JSON PARSE ERROR:",
          parseError
        );

        Alert.alert(
          "Login Error",
          "Laravel returned an invalid response."
        );

        return;
      }

      console.log("LOGIN DATA:", data);

      if (!response.ok) {
        console.error(
          "LOGIN FAILED:",
          response.status,
          data
        );

        Alert.alert(
          "Login Failed",
          data?.message ||
            `Login failed. HTTP ${response.status}`
        );

        return;
      }

      if (!data?.success) {
        Alert.alert(
          "Login Failed",
          data?.message || "Login was unsuccessful."
        );

        return;
      }

      const token = data?.token;

      const user = data?.user;

      if (!token) {
        console.error(
          "LOGIN ERROR: Token missing",
          data
        );

        Alert.alert(
          "Login Error",
          "Login succeeded, but no authentication token was returned."
        );

        return;
      }

      if (!user) {
        console.error(
          "LOGIN ERROR: User missing",
          data
        );

        Alert.alert(
          "Login Error",
          "Login succeeded, but no user information was returned."
        );

        return;
      }

      const roles = Array.isArray(user.roles)
        ? user.roles
        : [];

      const roleNames = roles
        .map((role: any) => {
          if (typeof role === "string") {
            return role;
          }

          return role?.name;
        })
        .filter(
          (roleName: any): roleName is string =>
            Boolean(roleName)
        );

      console.log("LOGIN SUCCESS");
      console.log("USER ID:", user.id);
      console.log("USER NAME:", user.name);
      console.log("USER EMAIL:", user.email);
      console.log("USER ROLES:", roleNames);
      console.log("TOKEN EXISTS:", Boolean(token));

      await saveLogin(token, {
        id: Number(user.id),
        name: user.name || "",
        email: user.email || "",
        roles: roles.map((role: any) => ({
          name:
            typeof role === "string"
              ? role
              : role?.name || "",
        })),
      });

      console.log("LOGIN SAVED SUCCESSFULLY");

      /*
       * SUPER ADMIN
       */
      if (roleNames.includes("super_admin")) {
        console.log(
          "REDIRECTING: SUPER ADMIN -> /dashboard"
        );

        router.replace({
          pathname: "/dashboard",
          params: {
            role: "super_admin",
            name: user.name || "Super Admin",
          },
        } as any);

        return;
      }

      /*
       * ADMIN
       */
      if (roleNames.includes("admin")) {
        console.log(
          "REDIRECTING: ADMIN -> /dashboard"
        );

        router.replace({
          pathname: "/dashboard",
          params: {
            role: "admin",
            name: user.name || "Admin",
          },
        } as any);

        return;
      }

      /*
       * OTHER ADMIN ROLES
       */
      if (
        roleNames.includes("employee") ||
        roleNames.includes("contractor") ||
        roleNames.includes("barangay_admin")
      ) {
        console.log(
          "REDIRECTING: ADMIN ROLE -> /dashboard"
        );

        router.replace({
          pathname: "/dashboard",
          params: {
            role: roleNames.join(","),
            name: user.name || "",
          },
        } as any);

        return;
      }

      /*
       * NO VALID ROLE
       */
      Alert.alert(
        "Login Successful",
        `Welcome, ${user.name || "User"}!\n\nRole: ${
          roleNames.join(", ") ||
          "No role assigned"
        }`
      );
    } catch (error: any) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to reach the Laravel API.";

      console.warn("LOGIN FETCH ERROR:", message);

      Alert.alert(
        "Connection Error",
        `The web app could not connect to the Laravel API.\n\n${message}\n\nMake sure Laravel is running at:\n${API_URL}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.logo}>
          KatokKalinis
        </Text>

        <Text style={styles.logoSub}>
          ADMIN SYSTEM
        </Text>

        <Text style={styles.title}>
          Welcome Back
        </Text>

        <Text style={styles.subtitle}>
          Login to your administrator account
        </Text>

        <Text style={styles.label}>
          Email
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          editable={!loading}
        />

        <Text style={styles.label}>
          Password
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#999999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity
          style={[
            styles.loginButton,
            loading && styles.loginButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
              size="small"
            />
          ) : (
            <Text style={styles.loginText}>
              LOGIN
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          Administrator accounts are created by the
          system administrator.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDF6E8",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  loginBox: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 32,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  logo: {
    textAlign: "center",
    color: "#4CAF50",
    fontSize: 34,
    fontWeight: "900",
  },

  logoSub: {
    textAlign: "center",
    color: "#888888",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 3,
  },

  title: {
    textAlign: "center",
    color: "#333333",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 35,
  },

  subtitle: {
    textAlign: "center",
    color: "#888888",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 28,
  },

  label: {
    color: "#444444",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },

  input: {
    width: "100%",
    height: 52,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#333333",
    marginBottom: 18,
  },

  loginButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  infoText: {
    textAlign: "center",
    color: "#999999",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 22,
  },
});