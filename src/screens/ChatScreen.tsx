import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Send, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { Message, Group } from '../types';

interface MessageWithUser extends Message {
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ChatScreenProps {
  groupId: string;
  groupName: string;
  onBack: () => void;
}

export default function ChatScreen({ groupId, groupName, onBack }: ChatScreenProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    loadMessages();
    const unsubscribe = subscribeToMessages();

    return () => {
      // Cleanup subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [groupId]);

  const loadMessages = async () => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch user info for each message
      const messagesWithUsers = await Promise.all(
        (messagesData || []).map(async (message) => {
          const { data: userData } = await supabase
            .from('users')
            .select('full_name, avatar_url')
            .eq('id', message.user_id)
            .single();

          return {
            ...message,
            user: userData || { full_name: 'Unknown', avatar_url: null },
          };
        })
      );

      setMessages(messagesWithUsers);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    // Remove any existing channel for this group
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`group:${groupId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          console.log('New message received:', payload.new);
          
          // Fetch the new message with user info
          const { data: messageData, error: messageError } = await supabase
            .from('messages')
            .select('*')
            .eq('id', payload.new.id)
            .maybeSingle();

          if (messageError || !messageData) {
            console.error('Error fetching message:', messageError);
            return;
          }

          // Fetch user info
          const { data: userData } = await supabase
            .from('users')
            .select('full_name, avatar_url')
            .eq('id', messageData.user_id)
            .maybeSingle();

          const newMessageWithUser: MessageWithUser = {
            ...messageData,
            user: userData || { full_name: 'Unknown', avatar_url: null },
          };

          setMessages((prev) => {
            // Check if message already exists to avoid duplicates
            if (prev.some((msg) => msg.id === newMessageWithUser.id)) {
              return prev;
            }
            return [...prev, newMessageWithUser];
          });
          
          // Scroll to bottom after a short delay
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to messages');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: messageContent,
          is_anonymous: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Optimistically add the message immediately
      const optimisticMessage: MessageWithUser = {
        ...data,
        user: {
          full_name: user.full_name,
          avatar_url: user.avatar_url,
        },
      };
      
      setMessages((prev) => {
        // Check if already exists
        if (prev.some((msg) => msg.id === optimisticMessage.id)) {
          return prev;
        }
        return [...prev, optimisticMessage];
      });
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const Avatar = ({ avatarUrl, displayInitial }: { avatarUrl?: string; displayInitial: string }) => {
    const [imageError, setImageError] = useState(false);

    if (!avatarUrl || imageError) {
      return (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayInitial}</Text>
        </View>
      );
    }

    return (
      <Image
        source={{ uri: avatarUrl }}
        style={styles.avatarImage}
        onError={() => setImageError(true)}
      />
    );
  };

  const renderMessage = ({ item }: { item: MessageWithUser }) => {
    const isOwnMessage = item.user_id === user?.id;
    const fullName = item.is_anonymous ? 'Anonymous' : item.user?.full_name || 'Unknown';
    const firstName = fullName.split(' ')[0];
    const avatarUrl = item.user?.avatar_url;
    const displayInitial = fullName.charAt(0).toUpperCase();

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {isOwnMessage ? (
          <>
            <View style={styles.messageContent}>
              <View style={[styles.nameTag, styles.ownNameTag]}>
                <Text style={styles.nameTagText}>{firstName}</Text>
              </View>
              <View
                style={[
                  styles.messageBubble,
                  styles.ownMessageBubble,
                ]}
              >
                <Text style={styles.ownMessageText}>
                  {item.content}
                </Text>
                <Text style={styles.ownMessageTime}>
                  {new Date(item.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.avatarContainer}>
              <Avatar avatarUrl={user?.avatar_url} displayInitial={displayInitial} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.avatarContainer}>
              <Avatar avatarUrl={avatarUrl} displayInitial={displayInitial} />
            </View>
            <View style={styles.messageContent}>
              <View style={styles.nameTag}>
                <Text style={styles.nameTagText}>{firstName}</Text>
              </View>
              <View
                style={[
                  styles.messageBubble,
                  styles.otherMessageBubble,
                ]}
              >
                <Text style={styles.otherMessageText}>
                  {item.content}
                </Text>
                <Text style={styles.otherMessageTime}>
                  {new Date(item.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#212529" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{groupName}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{groupName}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#6C757D"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginLeft: 8,
    marginTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E9ECEF',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageContent: {
    flex: 1,
    maxWidth: '75%',
  },
  nameTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#667EEA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  ownNameTag: {
    alignSelf: 'flex-end',
  },
  nameTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownMessageBubble: {
    backgroundColor: '#667EEA',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#212529',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#6C757D',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: '#212529',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E9ECEF',
  },
});

