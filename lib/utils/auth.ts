import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN = 'authToken';
const REFRESH_TOKEN = 'refreshToken';

export type AuthToken = {
  access: string;
  refresh: string;
};

export async function saveAuthTokens(tokens: AuthToken) {
  await AsyncStorage.setItem(ACCESS_TOKEN, tokens.access);
  await AsyncStorage.setItem(REFRESH_TOKEN, tokens.refresh);
}

export async function getAuthTokens() {
  const access = await AsyncStorage.getItem(ACCESS_TOKEN);
  const refresh = await AsyncStorage.getItem(REFRESH_TOKEN);
  if (!access || !refresh) {
    return null;
  }
  return { access, refresh } as AuthToken;
}

export async function clearAuthTokens() {
  await AsyncStorage.removeItem(ACCESS_TOKEN);
  await AsyncStorage.removeItem(REFRESH_TOKEN);
}
