import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {
  Baby,
  MessageCircle,
  Milk,
  Sparkles,
  ChevronRight,
  LogOut,
  Users,
  Shield,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { Group } from '../types';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getGroupIcon = (groupName: string) => {
    const name = groupName.toLowerCase();
    const iconSize = 28;
    const iconColor = '#667EEA';
    
    if (name.includes('pregnancy')) {
      return <Baby size={iconSize} color={iconColor} />;
    }
    if (name.includes('newborn') || name.includes('toddler')) {
      return <Baby size={iconSize} color={iconColor} />;
    }
    if (name.includes('breastfeeding') || name.includes('feeding')) {
      return <Milk size={iconSize} color={iconColor} />;
    }
    return <MessageCircle size={iconSize} color={iconColor} />;
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      // Check if already joined
      const { data: existing } = await supabase
        .from('user_groups')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .single();

      if (existing) {
        // Already joined - navigate to chat (to be implemented)
        console.log('Already in group, navigate to chat');
        return;
      }

      // Join the group
      const { error } = await supabase
        .from('user_groups')
        .insert({ user_id: user.id, group_id: groupId });

      if (error) throw error;

      // Navigate to chat (to be implemented)
      console.log('Joined group, navigate to chat');
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <LogOut size={16} color="#DC3545" style={{ marginRight: 4 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            Welcome, {user?.full_name}!
          </Text>
        </View>
        <Text style={styles.subtitle}>
          Connect with mothers who understand
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Find Your Community</Text>
        <Text style={styles.sectionSubtitle}>
          Join a group to start connecting and sharing
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading communities...</Text>
          </View>
        ) : (
          <View style={styles.groupsContainer}>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() => handleJoinGroup(group.id)}
                activeOpacity={0.7}
              >
                <View style={styles.groupIcon}>
                  {getGroupIcon(group.name)}
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupDescription}>
                    {group.description}
                  </Text>
                </View>
                <View style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Join</Text>
                  <ChevronRight size={16} color="#667EEA" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Shield size={20} color="#667EEA" style={{ marginRight: 8 }} />
            <Text style={styles.infoTitle}>Your Safe Space</Text>
          </View>
          <Text style={styles.infoText}>
            Share experiences, ask questions, and find support from a community
            of mothers. All conversations are private and respectful.
          </Text>
        </View>

        {user?.subscription_tier === 'free' && (
          <View style={styles.premiumCard}>
            <View style={styles.cardHeader}>
              <Sparkles size={20} color="#FFC107" style={{ marginRight: 8 }} />
              <Text style={styles.premiumTitle}>Go Premium</Text>
            </View>
            <Text style={styles.premiumText}>
              Unlock unlimited groups, remove message limits, and access
              exclusive content.
            </Text>
            <TouchableOpacity style={styles.premiumButton}>
              <Text style={styles.premiumButtonText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  signOutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutText: {
    color: '#DC3545',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6C757D',
  },
  groupsContainer: {
    gap: 15,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  groupIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  joinButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667EEA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#E7F5FF',
    borderRadius: 16,
    padding: 20,
    marginTop: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#667EEA',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 22,
  },
  premiumCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  premiumText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 15,
  },
  premiumButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#212529',
    fontSize: 16,
    fontWeight: '700',
  },
});
