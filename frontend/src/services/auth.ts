import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole =
  | "resident"
  | "vendor"
  | "driver"
  | "inspector"
  | "barangay_admin"
  | "contractor"
  | "employee"
  | "super_admin"
  | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  roles: {
    name: UserRole;
  }[];
};

const USER_KEY = "katokkalinis_user";
const TOKEN_KEY = "katokkalinis_token";

/*
|--------------------------------------------------------------------------
| SAVE LOGIN
|--------------------------------------------------------------------------
*/

export async function saveLogin(
  token: string,
  user: User
): Promise<void> {
  if (!token) {
    throw new Error("No authentication token was returned by the server.");
  }

  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

  console.log("LOGIN SAVED SUCCESSFULLY");
}

/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
*/

export async function getCurrentUser(): Promise<User | null> {
  try {
    const userString = await AsyncStorage.getItem(USER_KEY);

    if (!userString) {
      return null;
    }

    return JSON.parse(userString) as User;
  } catch (error) {
    console.error("GET USER ERROR:", error);
    return null;
  }
}

/*
|--------------------------------------------------------------------------
| GET TOKEN
|--------------------------------------------------------------------------
*/

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("GET TOKEN ERROR:", error);
    return null;
  }
}

/*
|--------------------------------------------------------------------------
| CHECK LOGIN
|--------------------------------------------------------------------------
*/

export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken();

  return !!token;
}

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
  await AsyncStorage.removeItem(TOKEN_KEY);

  console.log("LOGOUT SUCCESSFUL");
}