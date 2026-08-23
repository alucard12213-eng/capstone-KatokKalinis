import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

const THEME_KEY = "katokkalinis_theme";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] =
    useState<ThemeMode>("light");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme =
        await AsyncStorage.getItem(THEME_KEY);

      if (
        savedTheme === "light" ||
        savedTheme === "dark"
      ) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error("LOAD THEME ERROR:", error);
    }
  };

  const setTheme = async (
    newTheme: ThemeMode
  ) => {
    try {
      setThemeState(newTheme);

      await AsyncStorage.setItem(
        THEME_KEY,
        newTheme
      );
    } catch (error) {
      console.error("SAVE THEME ERROR:", error);
    }
  };

  const toggleTheme = async () => {
    const newTheme =
      theme === "light"
        ? "dark"
        : "light";

    await setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}