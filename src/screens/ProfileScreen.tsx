import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import {
  User,
  Mail,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Edit3,
  CreditCard,
  Moon,
  Globe,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: Edit3,
          label: 'Edit Profile',
          onPress: () => console.log('Edit Profile'),
        },
        {
          icon: Mail,
          label: 'Email Settings',
          onPress: () => console.log('Email Settings'),
        },
        {
          icon: CreditCard,
          label: 'Subscription',
          value: user?.subscription_tier === 'premium' ? 'Premium' : 'Free',
          onPress: () => console.log('Subscription'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          rightComponent: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E9ECEF', true: '#667EEA' }}
              thumbColor="#fff"
            />
          ),
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          rightComponent: (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E9ECEF', true: '#667EEA' }}
              thumbColor="#fff"
            />
          ),
        },
        {
          icon: Globe,
          label: 'Language',
          value: 'English',
          onPress: () => console.log('Language'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          onPress: () => console.log('Help & Support'),
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          onPress: () => console.log('Privacy Policy'),
        },
        {
          icon: Settings,
          label: 'Terms of Service',
          onPress: () => console.log('Terms of Service'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{user?.full_name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.subscription_tier === 'premium' && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => {
                const hasRightComponent = 'rightComponent' in item && !!item.rightComponent;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.settingItem,
                      itemIndex === section.items.length - 1 && styles.lastItem,
                    ]}
                    onPress={item.onPress}
                    disabled={hasRightComponent}
                  >
                    <View style={styles.settingLeft}>
                      <item.icon size={20} color="#667EEA" style={styles.settingIcon} />
                      <Text style={styles.settingLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.settingRight}>
                      {hasRightComponent ? (
                        item.rightComponent
                      ) : (
                        <>
                          {'value' in item && item.value && (
                            <Text style={styles.settingValue}>{item.value}</Text>
                          )}
                          <Text style={styles.chevron}>›</Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <LogOut size={20} color="#DC3545" style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Vida Between v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 12,
  },
  premiumBadge: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#212529',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#212529',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#6C757D',
    marginRight: 8,
  },
  chevron: {
    fontSize: 24,
    color: '#6C757D',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC3545',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#6C757D',
  },
});
