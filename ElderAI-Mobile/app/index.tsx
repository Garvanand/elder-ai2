import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, fontSize } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { WebViewWrapper } from '@/components/WebViewWrapper';
import * as SecureStore from 'expo-secure-store';

const USE_WEBVIEW_MODE = true;

export default function Index() {
  const { user, profile, loading, session } = useAuth();
  const router = useRouter();
  const [showWebView, setShowWebView] = useState(false);
  const [webViewPath, setWebViewPath] = useState('/');

  useEffect(() => {
    if (loading) return;

    if (USE_WEBVIEW_MODE) {
      if (user && profile) {
        let path = '/';
        switch (profile.role) {
          case 'elder':
            path = '/elder';
            break;
          case 'caregiver':
            path = '/caregiver';
            break;
          case 'clinician':
            path = '/clinician';
            break;
        }
        setWebViewPath(path);
        setShowWebView(true);
      } else {
        setWebViewPath('/auth');
        setShowWebView(true);
      }
      return;
    }

    if (!user) {
      router.replace('/auth');
      return;
    }

    if (profile) {
      switch (profile.role) {
        case 'elder':
          router.replace('/(elder)/home');
          break;
        case 'caregiver':
          router.replace('/(caregiver)/home');
          break;
        case 'clinician':
          router.replace('/(clinician)/home');
          break;
        default:
          router.replace('/auth');
      }
    }
  }, [user, profile, loading]);

  if (USE_WEBVIEW_MODE && showWebView) {
    return (
      <WebViewWrapper
        initialPath={webViewPath}
        userRole={profile?.role}
        authToken={session?.access_token}
        onNavigationChange={(url) => {
          console.log('Navigation:', url);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="heart" size={80} color={colors.primary} />
        </View>
        <Text style={styles.title}>Memory Friend</Text>
        <Text style={styles.subtitle}>Your AI Memory Companion</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  loader: {
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
