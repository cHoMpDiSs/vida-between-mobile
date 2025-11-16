import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, MessageCircle, User } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import { NavigationProvider } from './NavigationContext';

export default function TabNavigator() {
  const [activeTab, setActiveTab] = useState('home');
  const [chatScreen, setChatScreen] = useState<{ groupId: string; groupName: string } | null>(null);

  const navigateToChat = (groupId: string, groupName: string) => {
    setChatScreen({ groupId, groupName });
  };

  const goBack = () => {
    setChatScreen(null);
  };

  const renderScreen = () => {
    if (chatScreen) {
      return (
        <ChatScreen
          groupId={chatScreen.groupId}
          groupName={chatScreen.groupName}
          onBack={goBack}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'messages':
        return <MessagesScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <NavigationProvider value={{ navigateToChat, goBack }}>
      <View style={styles.container}>
        <View style={styles.content}>{renderScreen()}</View>
        {!chatScreen && (
          <SafeAreaView style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'home' && styles.activeTab]}
          onPress={() => setActiveTab('home')}
        >
          <Home
            size={24}
            color={activeTab === 'home' ? '#667EEA' : '#6C757D'}
            style={styles.icon}
          />
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => setActiveTab('messages')}
        >
          <MessageCircle
            size={24}
            color={activeTab === 'messages' ? '#667EEA' : '#6C757D'}
            style={styles.icon}
          />
          <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
            Messages
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <User
            size={24}
            color={activeTab === 'profile' ? '#667EEA' : '#6C757D'}
            style={styles.icon}
          />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            Profile
          </Text>
        </TouchableOpacity>
          </SafeAreaView>
        )}
      </View>
    </NavigationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingBottom: 8,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Active state styling
  },
  icon: {
    marginBottom: 6,
    marginTop: 6,
  },
  tabText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#667EEA',
  },
});

