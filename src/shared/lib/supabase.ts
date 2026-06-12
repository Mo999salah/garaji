import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Web sessions use AsyncStorage (localStorage). Prefer native builds for SecureStore-backed sessions.
const expoSecureStoreAdapter = {
 getItem: (key: string) => {
 if (Platform.OS === 'web') {
 return AsyncStorage.getItem(key);
 }

 return SecureStore.getItemAsync(key);
 },
 setItem: (key: string, value: string) => {
 if (Platform.OS === 'web') {
 return AsyncStorage.setItem(key, value);
 }

 return SecureStore.setItemAsync(key, value);
 },
 removeItem: (key: string) => {
 if (Platform.OS === 'web') {
 return AsyncStorage.removeItem(key);
 }

 return SecureStore.deleteItemAsync(key);
 },
};

export const supabase = isSupabaseConfigured
 ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
 auth: {
 storage: expoSecureStoreAdapter,
 autoRefreshToken: true,
 persistSession: true,
 detectSessionInUrl: false,
 },
 })
 : null;
