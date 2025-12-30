import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';

export default function CaregiverSettingsScreen() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [alertSounds, setAlertSounds] = useState(true);
  const [urgentAlerts, setUrgentAlerts] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const settingsGroups = [
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications',
          label: 'Push Notifications',
          description: 'Receive alerts and updates',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: 'volume-high',
          label: 'Alert Sounds',
          description: 'Play sound for new alerts',
          type: 'toggle',
          value: alertSounds,
          onToggle: setAlertSounds,
        },
        {
          icon: 'warning',
          label: 'Urgent Alerts Only',
          description: 'Only notify for high/critical alerts',
          type: 'toggle',
          value: urgentAlerts,
          onToggle: setUrgentAlerts,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          label: 'Edit Profile',
          description: 'Update your information',
          type: 'link',
          onPress: () => Alert.alert('Profile', 'Profile editor coming soon!'),
        },
        {
          icon: 'shield-checkmark',
          label: 'Privacy Settings',
          description: 'Manage your data',
          type: 'link',
          onPress: () => Alert.alert('Privacy', 'Privacy settings coming soon!'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle',
          label: 'Help Center',
          description: 'FAQs and guides',
          type: 'link',
          onPress: () => Alert.alert('Help', 'Help center coming soon!'),
        },
        {
          icon: 'chatbox',
          label: 'Contact Support',
          description: 'Get in touch with us',
          type: 'link',
          onPress: () => Alert.alert('Support', 'support@memoryfriend.ai'),
        },
        {
          icon: 'information-circle',
          label: 'About',
          description: 'App version and info',
          type: 'link',
          onPress: () => Alert.alert('Memory Friend', 'Version 1.0.0\n\nCaregiver Portal'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.full_name || 'Caregiver'}</Text>
          <Text style={styles.profileRole}>Caregiver Account</Text>
        </View>

        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.settingItem}
                onPress={item.type === 'link' ? item.onPress : undefined}
                activeOpacity={item.type === 'link' ? 0.7 : 1}
              >
                <View style={styles.settingIcon}>
                  <Ionicons name={item.icon as any} size={22} color={colors.secondary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                {item.type === 'toggle' ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: colors.border, true: colors.secondary }}
                    thumbColor={colors.text}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out" size={22} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profileRole: {
    fontSize: fontSize.md,
    color: colors.secondary,
  },
  settingsGroup: {
    marginBottom: spacing.xl,
  },
  groupTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  settingDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: spacing.md,
  },
  signOutText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.error,
  },
});
