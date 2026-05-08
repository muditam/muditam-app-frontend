import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image as RNImage,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.48:3001';
const WS_BASE = (process.env.EXPO_PUBLIC_WS_BASE_URL || API_BASE.replace(/^http/, 'ws')).replace(/\/$/, '');
const HUMAN_CALL_REQUEST_URL = `${API_BASE}/api/voice/request-human-call`;
const MAX_ATTACHMENT_BYTES = 1.5 * 1024 * 1024;
const MAX_AUDIO_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const AGENT_PROFILE_URL = 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_26_1.png?v=1777293009';
const CALL_EVENT_PREFIXES = [
  'Internet call ended',
  'Declined internet call',
  'Missed internet call',
];

const normalizeMimeType = (asset, fallbackType = 'file') => {
  const rawType = asset.mimeType || asset.type || '';
  if (rawType.includes('/')) return rawType;
  if (rawType === 'image' || fallbackType === 'image') return 'image/jpeg';
  if (rawType === 'video') return 'video/mp4';
  if (rawType === 'audio') return 'audio/mpeg';
  return 'application/octet-stream';
};

const isImageAttachment = (attachment) =>
  attachment.type === 'image' ||
  attachment.mimeType?.startsWith('image/') ||
  attachment.dataUri?.startsWith('data:image/');

const isCallEventMessage = (item) =>
  item?.senderType === 'system' ||
  CALL_EVENT_PREFIXES.some((prefix) => String(item?.text || '').startsWith(prefix));

const attachmentUri = (attachment) => {
  if (attachment.url?.startsWith('http')) return attachment.url;
  if (attachment.url) return `${API_BASE}${attachment.url}`;
  return attachment.dataUri;
};

const formatTime = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const formatDuration = (durationMs = 0) => {
  const totalSeconds = Math.max(1, Math.round(durationMs / 1000));
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
};

const mimeTypeFromRecordingUri = (uri = '') => {
  const normalized = uri.toLowerCase();
  if (normalized.endsWith('.m4a') || normalized.endsWith('.aac')) return 'audio/mp4';
  if (normalized.endsWith('.caf')) return 'audio/x-caf';
  if (normalized.endsWith('.3gp')) return 'audio/3gpp';
  if (normalized.endsWith('.wav')) return 'audio/wav';
  return 'audio/mp4';
};

const extensionFromMimeType = (mimeType = '') => {
  if (mimeType === 'audio/mp4') return '.m4a';
  if (mimeType === 'audio/mpeg') return '.mp3';
  if (mimeType === 'audio/x-caf') return '.caf';
  if (mimeType === 'audio/3gpp') return '.3gp';
  if (mimeType === 'audio/wav') return '.wav';
  return '.m4a';
};

const imageBox = (width = 0, height = 0) => {
  const maxWidth = 210;
  const maxHeight = 280;
  const minWidth = 72;
  const minHeight = 72;
  const sourceWidth = width > 0 ? width : 4;
  const sourceHeight = height > 0 ? height : 3;

  const fitScale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  const fillScale = Math.max(minWidth / sourceWidth, minHeight / sourceHeight);
  const scale = Math.min(Math.max(fitScale, fillScale), fitScale);

  return {
    width: Math.round(sourceWidth * scale),
    height: Math.round(sourceHeight * scale),
  };
};

function ChatImage({ attachment }) {
  const uri = attachmentUri(attachment);
  const initialBox = imageBox(attachment.width, attachment.height);
  const [box, setBox] = useState(initialBox);

  useEffect(() => {
    if (!uri) return;
    if (attachment.width && attachment.height) {
      setBox(imageBox(attachment.width, attachment.height));
      return;
    }

    RNImage.getSize(
      uri,
      (width, height) => {
        if (width > 0 && height > 0) setBox(imageBox(width, height));
      },
      () => setBox(imageBox())
    );
  }, [attachment.height, attachment.width, uri]);

  return (
    <ExpoImage
      source={{ uri }}
      style={[styles.attachmentImage, box]}
      contentFit="contain"
      cachePolicy="memory-disk"
    />
  );
}

export default function ChatWidget({ bottomOffset = 78 }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMs, setRecordingMs] = useState(0);
  const [playingAudioKey, setPlayingAudioKey] = useState('');
  const [loadingAudioKey, setLoadingAudioKey] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [startingCall, setStartingCall] = useState(false);
  const [threadReady, setThreadReady] = useState(false);
  const wsRef = useRef(null);
  const listRef = useRef(null);
  const listContentHeightRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const recordingRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const soundRef = useRef(null);
  const audioCacheRef = useRef({});
  const lastReadSignatureRef = useRef('');
  const previousMessageCountRef = useRef(0);
  const previousOpenRef = useRef(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const unreadCount = useMemo(
    () => conversation?.unreadForUser || 0,
    [conversation?.unreadForUser]
  );

  const buildAttachment = async (asset, fallbackType = 'file') => {
    const mimeType = normalizeMimeType(asset, fallbackType);
    const size = asset.fileSize || asset.size || 0;

    const limit = fallbackType === 'audio' ? MAX_AUDIO_ATTACHMENT_BYTES : MAX_ATTACHMENT_BYTES;
    if (size > limit) {
      throw new Error(fallbackType === 'audio' ? 'Voice note must be under 8 MB' : 'Attachment must be under 1.5 MB');
    }

    const base64 = asset.base64 || await FileSystem.readAsStringAsync(asset.uri, {
      encoding: 'base64',
    });

    return {
      type: mimeType.startsWith('image/') ? 'image' : mimeType.startsWith('video/') ? 'video' : fallbackType,
      name: asset.fileName || asset.name || `attachment-${Date.now()}`,
      mimeType,
      size,
      width: asset.width || 0,
      height: asset.height || 0,
      durationMs: asset.durationMs || 0,
      dataUri: `data:${mimeType};base64,${base64}`,
    };
  };

  const pickMedia = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Media permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.65,
        base64: true,
      });

      if (result.canceled || !result.assets?.length) return;
      const next = await buildAttachment(result.assets[0], 'image');
      setAttachments((current) => [...current, next].slice(0, 4));
    } catch (err) {
      setError(err.message || 'Could not attach media');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) return;
      const next = await buildAttachment(result.assets[0], 'file');
      setAttachments((current) => [...current, next].slice(0, 4));
    } catch (err) {
      setError(err.message || 'Could not attach file');
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem('userDetails');
      if (!stored) return;
      setUser(JSON.parse(stored));
    };

    loadUser();
  }, []);

  useEffect(() => {
    return () => {
      clearInterval(recordingTimerRef.current);
      recordingRef.current?.stopAndUnloadAsync?.().catch(() => {});
      soundRef.current?.unloadAsync?.().catch(() => {});
    };
  }, []);

  const fetchConversation = useCallback(async (phone, options = {}) => {
    if (!phone) return;
    const showLoading = options.showLoading ?? false;
    const silent = options.silent ?? false;

    try {
      if (showLoading) setLoading(true);
      if (!silent) setError('');
      const res = await fetch(`${API_BASE}/api/chat/conversations/${phone}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load chat');
      setConversation(data.conversation);
    } catch (err) {
      if (!silent) setError(err.message || 'Could not load chat');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const scrollThreadToBottom = useCallback((animated = false) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false });
        setThreadReady(true);
      }, 0);
    });
  }, []);

  useEffect(() => {
    const phone = user?.phone;
    if (!phone) return;

    let active = true;
    fetchConversation(phone, { showLoading: true });

    const connect = () => {
      if (!active) return;
      const ws = new WebSocket(`${WS_BASE}/ws/chat?role=user&phone=${encodeURIComponent(phone)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError('');
      };
      ws.onclose = () => {
        if (!active) return;
        setConnected(false);
        reconnectTimerRef.current = setTimeout(connect, 2500);
      };
      ws.onerror = () => {
        setConnected(false);
      };
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'conversation:update') {
            setConversation(payload.conversation);
          }
        } catch (_err) {
          setError('Chat update failed');
        }
      };
    };

    connect();

    return () => {
      active = false;
      clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [fetchConversation, user?.phone]);

  useEffect(() => {
    if (!user?.phone) return;
    if (connected) return;

    const interval = setInterval(() => {
      fetchConversation(user.phone, { silent: true });
    }, open ? 5000 : 12000);

    return () => clearInterval(interval);
  }, [connected, fetchConversation, open, user?.phone]);

  useEffect(() => {
    if (open && user?.phone && !conversation) {
      setThreadReady(false);
      fetchConversation(user.phone, { silent: true });
    }
  }, [conversation, fetchConversation, open, user?.phone]);

  useEffect(() => {
    const becameOpen = open && !previousOpenRef.current;
    previousOpenRef.current = open;
    if (!open) return;

    const nextMessageCount = conversation?.messages?.length || 0;
    const shouldAnimate = nextMessageCount > previousMessageCountRef.current && !becameOpen;
    previousMessageCountRef.current = nextMessageCount;
    if (becameOpen || nextMessageCount <= 1) setThreadReady(false);
    scrollThreadToBottom(shouldAnimate);
  }, [conversation?.messages?.length, open]);

  useEffect(() => {
    if (!open || !user?.phone) return;
    const unreadAgentMessages = (conversation?.messages || []).filter(
      (message) => message.senderType === 'agent' && !message.readByUser
    );
    if (!unreadAgentMessages.length) return;

    const latestUnread = unreadAgentMessages[unreadAgentMessages.length - 1];
    const signature = `${latestUnread._id || latestUnread.createdAt || latestUnread.text || unreadAgentMessages.length}`;
    if (lastReadSignatureRef.current === signature) return;
    lastReadSignatureRef.current = signature;

    fetch(`${API_BASE}/api/chat/conversations/${user.phone}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readerType: 'user' }),
    }).catch(() => {});
  }, [conversation?.messages, open, user?.phone]);

  const sendPayload = async (text, outgoingAttachments) => {
    if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message:send',
        phone: user.phone,
        text,
        attachments: outgoingAttachments,
        userName: user.name || '',
      }));
      return true;
    }

    const res = await fetch(`${API_BASE}/api/chat/conversations/${user.phone}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        attachments: outgoingAttachments,
        senderType: 'user',
        userName: user.name || '',
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not send message');
    setConversation(data.conversation);
    return true;
  };

  const sendMessage = async (customText, customAttachments) => {
    const clean = typeof customText === 'string' ? customText.trim() : message.trim();
    const outgoingAttachments = customAttachments || attachments;
    if ((!clean && !outgoingAttachments.length) || !user?.phone) return;

    setMessage('');
    setAttachments([]);
    setError('');

    try {
      await sendPayload(clean, outgoingAttachments);
    } catch (err) {
      setMessage(clean);
      setAttachments(outgoingAttachments);
      setError(err.message || 'Could not send message');
    }
  };

  const resetRecordingState = useCallback(() => {
    clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;
    recordingRef.current = null;
    setIsRecording(false);
    setRecordingMs(0);
  }, []);

  const startVoiceRecording = async () => {
    try {
      if (isRecording) return;
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission is required');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      const recording = new Audio.Recording();
      recording.setProgressUpdateInterval(200);
      recording.setOnRecordingStatusUpdate((status) => {
        setRecordingMs(status?.durationMillis || 0);
      });
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.LOW_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setRecordingMs(0);
      setIsRecording(true);
      setError('');
    } catch (err) {
      resetRecordingState();
      setError(err.message || 'Unable to start voice note');
    }
  };

  const stopVoiceRecording = async ({ shouldSend = true } = {}) => {
    try {
      const recording = recordingRef.current;
      if (!recording) return;

      clearInterval(recordingTimerRef.current);
      await recording.stopAndUnloadAsync();
      const status = await recording.getStatusAsync();
      const uri = recording.getURI();
      resetRecordingState();
      if (!uri) return;
      if (!shouldSend) return;

      const info = await FileSystem.getInfoAsync(uri);
      if (Number(info.size || 0) > MAX_AUDIO_ATTACHMENT_BYTES) {
        setError('Voice note must be under 8 MB');
        return;
      }
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const mimeType = mimeTypeFromRecordingUri(uri);
      const audioAttachment = {
        type: 'audio',
        name: `voice-note-${Date.now()}${uri.includes('.') ? uri.slice(uri.lastIndexOf('.')) : '.m4a'}`,
        mimeType,
        size: Number(info.size || 0),
        durationMs: Number(status?.durationMillis || 0),
        dataUri: `data:${mimeType};base64,${base64}`,
      };

      await sendMessage('', [audioAttachment]);
    } catch (err) {
      resetRecordingState();
      setError(err.message || 'Unable to send voice note');
    } finally {
      clearInterval(recordingTimerRef.current);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      }).catch(() => {});
    }
  };

  const cancelVoiceRecording = async () => stopVoiceRecording({ shouldSend: false });

  const resolvePlayableAudioUri = useCallback(async (attachment, key) => {
    const directUri = attachmentUri(attachment);
    if (!directUri?.startsWith('data:')) return directUri;

    if (audioCacheRef.current[key]) {
      return audioCacheRef.current[key];
    }

    const match = directUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      throw new Error('Voice note format is invalid');
    }

    const fileUri = `${FileSystem.cacheDirectory}chat-audio-${Date.now()}-${Math.random().toString(16).slice(2)}${extensionFromMimeType(attachment.mimeType || match[1])}`;
    await FileSystem.writeAsStringAsync(fileUri, match[2], { encoding: 'base64' });
    audioCacheRef.current[key] = fileUri;
    return fileUri;
  }, []);

  const playAudioAttachment = async (attachment, key) => {
    try {
      if (soundRef.current && playingAudioKey === key) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setPlayingAudioKey('');
          return;
        }
        if (status.isLoaded) {
          await soundRef.current.playAsync();
          setPlayingAudioKey(key);
          return;
        }
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      setLoadingAudioKey(key);
      const source = { uri: await resolvePlayableAudioUri(attachment, key) };
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        progressUpdateIntervalMillis: 250,
      });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setPlayingAudioKey('');
          sound.setPositionAsync(0).catch(() => {});
        }
      });
      await sound.playAsync();
      setPlayingAudioKey(key);
    } catch (err) {
      setPlayingAudioKey('');
      setError(err.message || 'Unable to play voice note');
    } finally {
      setLoadingAudioKey('');
    }
  };

  if (!user?.phone) return null;

  const messages = conversation?.messages || [];
  const renderTicks = (item, mine) => {
    if (!mine) return null;
    const seen = item.readByAgent;
    return (
      <Ionicons
        name={seen ? 'checkmark-done' : 'checkmark'}
        size={15}
        color={seen ? '#6fb7ff' : 'rgba(255,255,255,0.72)'}
        style={styles.tickIcon}
      />
    );
  };

  const renderAttachment = (attachment, mine) => {
    if (isImageAttachment(attachment)) {
      return <ChatImage attachment={attachment} />;
    }

    if (attachment.type === 'audio' || attachment.mimeType?.startsWith('audio/')) {
      const audioKey = `${attachment.url || attachment.dataUri || attachment.name}-${attachment.createdAt || ''}`;
      const isPlaying = playingAudioKey === audioKey;
      const isLoading = loadingAudioKey === audioKey;
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.audioAttachment, mine ? styles.mineFileAttachment : styles.agentFileAttachment]}
          onPress={() => playAudioAttachment(attachment, audioKey)}
        >
          <View style={[styles.audioPlay, mine ? styles.audioPlayMine : styles.audioPlayAgent]}>
            {isLoading ? (
              <ActivityIndicator size="small" color={mine ? '#fff' : '#543287'} />
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color={mine ? '#fff' : '#543287'} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fileName, mine ? styles.mineText : styles.agentText]} numberOfLines={1}>
              Voice note
            </Text>
            <View style={styles.audioWaveRow}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((bar) => (
                <View
                  key={bar}
                  style={[
                    styles.audioWaveBar,
                    mine ? styles.audioWaveBarMine : styles.audioWaveBarAgent,
                    { height: 6 + ((bar % 4) * 4) },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.audioDuration, mine ? styles.mineTime : styles.agentTime]}>
              {formatDuration(attachment.durationMs)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.fileAttachment, mine ? styles.mineFileAttachment : styles.agentFileAttachment]}>
        <Ionicons name="document-attach-outline" size={20} color={mine ? '#fff' : '#543287'} />
        <Text
          style={[styles.fileName, mine ? styles.mineText : styles.agentText]}
          numberOfLines={1}
        >
          {attachment.name || 'Attachment'}
        </Text>
      </View>
    );
  };

  const closeWidget = () => {
    if (isRecording) cancelVoiceRecording().catch(() => {});
    setOpen(false);
  };

  const openCallScreen = async () => {
    if (!user?.phone) {
      setError('Phone number is required to start a call');
      Alert.alert('Call unavailable', 'Phone number is required to start a call.');
      return;
    }
    if (startingCall) return;
    try {
      setError('');
      setStartingCall(true);
      const payload = {
        userId: String(user?._id || user?.id || user?.phone || ''),
        phone: String(user.phone || ''),
        userName: String(user?.name || ''),
        language: 'hi-IN',
      };
      const res = await fetch(HUMAN_CALL_REQUEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start call');

      closeWidget();
      router.push({
        pathname: '/callscreen',
        params: {
          mode: 'human',
          userId: payload.userId,
          phone: payload.phone,
          userName: payload.userName,
          language: payload.language,
          appId: String(data.appId || ''),
          token: String(data.token || ''),
          channelName: String(data.channelName || ''),
          uid: String(data.uid || ''),
          callId: String(data.call?.callId || ''),
        },
      });
    } catch (err) {
      const message = err.message || 'Could not start call';
      setError(message);
      Alert.alert('Call failed', message);
    } finally {
      setStartingCall(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.fab, { bottom: bottomOffset + insets.bottom }]}
        onPress={() => setOpen(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
        {unreadCount > 0 && !open ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <Modal visible={open} transparent={false} animationType="slide" onRequestClose={closeWidget}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <View style={styles.screen}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top - 6, 2) }]}>
              <View style={styles.headerIdentity}>
                <RNImage source={{ uri: AGENT_PROFILE_URL }} style={styles.expertAvatarImage} />
                <View>
                  <Text style={styles.title}>Health Expert</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, connected ? styles.statusDotOnline : styles.statusDotOffline]} />
                    <Text style={styles.status}>{connected ? 'Online' : 'Connecting...'}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={[styles.callButton, startingCall && styles.callButtonDisabled]}
                  onPress={openCallScreen}
                  disabled={startingCall}
                >
                  {startingCall ? (
                    <ActivityIndicator size="small" color="#1f2937" />
                  ) : (
                    <Ionicons name="call-outline" size={22} color="#1f2937" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={closeWidget}>
                  <Ionicons name="close" size={22} color="#1f2937" />
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.messagesWrap}>
              {loading ? (
                <View style={styles.loading}>
                  <ActivityIndicator color="#543287" />
                </View>
              ) : (
                <>
                  {!threadReady ? (
                    <View style={styles.loading}>
                      <ActivityIndicator color="#543287" />
                    </View>
                  ) : null}
                  <ScrollView
                    ref={listRef}
                    contentContainerStyle={styles.messages}
                    onContentSizeChange={(_, contentHeight) => {
                      if (!open || contentHeight === listContentHeightRef.current) return;
                      listContentHeightRef.current = contentHeight;
                      scrollThreadToBottom(previousMessageCountRef.current > 0);
                    }}
                    style={!threadReady ? { opacity: 0, position: 'absolute', inset: 0 } : null}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {messages.length === 0 ? (
                      <View style={styles.empty}>
                        <Text style={styles.emptyTitle}>Ask us anything</Text>
                        <Text style={styles.emptyText}>A diabetes expert will reply here.</Text>
                      </View>
                    ) : (
                      messages.map((item, messageIndex) => {
                      if (isCallEventMessage(item)) {
                        const missed =
                          String(item.text || '').startsWith('Missed') ||
                          String(item.text || '').startsWith('Declined');
                        return (
                          <View
                            key={item._id || `${item.createdAt}-${messageIndex}`}
                            style={styles.callEventRow}
                          >
                            <View style={styles.callEventBubble}>
                              <Ionicons
                                name={missed ? 'call' : 'call-outline'}
                                size={15}
                                color={missed ? '#b42318' : '#027a48'}
                              />
                              <Text
                                style={[
                                  styles.callEventText,
                                  missed ? styles.callEventMissed : styles.callEventCompleted,
                                ]}
                              >
                                {item.text}
                              </Text>
                              <Text style={styles.callEventTime}>{formatTime(item.createdAt)}</Text>
                            </View>
                          </View>
                        );
                      }
                      const mine = item.senderType === 'user';
                      const imageOnlyMessage =
                        !!item.attachments?.length &&
                        item.attachments.every(isImageAttachment) &&
                        !item.text;
                      return (
                        <View
                          key={item._id || `${item.createdAt}-${messageIndex}`}
                          style={[styles.messageRow, mine ? styles.mineRow : styles.agentRow]}
                        >
                          <View
                            style={[
                              styles.bubble,
                              mine ? styles.mineBubble : styles.agentBubble,
                              imageOnlyMessage && styles.imageOnlyBubble,
                              imageOnlyMessage && mine && styles.imageOnlyBubbleMine,
                              imageOnlyMessage && !mine && styles.imageOnlyBubbleAgent,
                            ]}
                          >
                            {(item.attachments || []).map((attachment, index) => (
                              <View key={`${attachment.name}-${index}`} style={styles.attachmentBlock}>
                                {renderAttachment(attachment, mine)}
                              </View>
                            ))}
                            {item.text ? (
                              <Text style={[styles.messageText, mine ? styles.mineText : styles.agentText]}>
                                {item.text}
                              </Text>
                            ) : null}
                            <View style={styles.metaRow}>
                              <Text style={[styles.time, mine ? styles.mineTime : styles.agentTime]}>
                                {formatTime(item.createdAt)}
                              </Text>
                              {renderTicks(item, mine)}
                            </View>
                          </View>
                        </View>
                      );
                    })
                    )}
                  </ScrollView>
                </>
              )}
            </View>

            {attachments.length > 0 && (
              <View style={[styles.previewStrip, { paddingBottom: Math.max(insets.bottom * 0.35, 8) }]}>
                {attachments.map((attachment, index) => (
                  <View key={`${attachment.name}-${index}`} style={styles.previewItem}>
                    {isImageAttachment(attachment) ? (
                      <RNImage source={{ uri: attachmentUri(attachment) }} style={styles.previewImage} />
                    ) : (
                      <Ionicons name="document-outline" size={22} color="#543287" />
                    )}
                    <Text style={styles.previewName} numberOfLines={1}>{attachment.name}</Text>
                    <TouchableOpacity
                      style={styles.removePreview}
                      onPress={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      <Ionicons name="close" size={14} color="#111827" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {isRecording ? (
              <View style={[styles.recordingComposer, { paddingBottom: Math.max(insets.bottom - 4, 2) }]}>
                <TouchableOpacity style={styles.recordingDeleteButton} onPress={cancelVoiceRecording}>
                  <Ionicons name="trash-outline" size={20} color="#dc2626" />
                </TouchableOpacity>
                <View style={styles.recordingCard}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingLabel}>Recording voice note</Text>
                  <View style={styles.waveRow}>
                    {[0, 1, 2, 3, 4, 5].map((bar) => (
                      <View
                        key={bar}
                        style={[
                          styles.waveBar,
                          { height: 10 + ((bar % 3) * 6) },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.recordingTime}>{formatDuration(recordingMs)}</Text>
                </View>
                <TouchableOpacity style={styles.recordingSendButton} onPress={() => stopVoiceRecording({ shouldSend: true })}>
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom - 4, 2) }]}>
                <TouchableOpacity style={styles.attachButton} onPress={pickMedia}>
                  <Ionicons name="image-outline" size={22} color="#543287" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
                  <Ionicons name="attach" size={22} color="#543287" />
                </TouchableOpacity>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type your message"
                  placeholderTextColor="#8b95a1"
                  multiline
                  style={styles.input}
                />
                {message.trim() || attachments.length ? (
                  <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Ionicons name="send" size={19} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.micButton} onPress={startVoiceRecording}>
                    <Ionicons name="mic-outline" size={22} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#5b35a0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 8,
    zIndex: 50,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -3,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  modalRoot: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#fbfcff',
    overflow: 'hidden',
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  headerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expertAvatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f4f5f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonDisabled: {
    opacity: 0.65,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  status: {
    fontSize: 12,
    color: '#667085',
    fontWeight: '600',
  },
  statusRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusDotOnline: {
    backgroundColor: '#16a34a',
  },
  statusDotOffline: {
    backgroundColor: '#f59e0b',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f4f5f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginHorizontal: 14,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    color: '#991b1b',
    backgroundColor: '#fee2e2',
    fontSize: 13,
  },
  messagesWrap: {
    flex: 1,
    backgroundColor: '#f3f6fb',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  callEventRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  callEventBubble: {
    maxWidth: '92%',
    minHeight: 32,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e7ec',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callEventText: {
    fontSize: 12,
    fontWeight: '800',
    flexShrink: 1,
  },
  callEventCompleted: {
    color: '#027a48',
  },
  callEventMissed: {
    color: '#b42318',
  },
  callEventTime: {
    fontSize: 10,
    color: '#667085',
    fontWeight: '700',
  },
  mineRow: {
    justifyContent: 'flex-end',
  },
  agentRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#101828',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  mineBubble: {
    backgroundColor: '#5b35a0',
    borderTopRightRadius: 6,
  },
  agentBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#eef0f4',
  },
  imageOnlyBubble: {
    maxWidth: 'none',
    width: 'auto',
  },
  imageOnlyBubbleMine: {
    alignSelf: 'flex-end',
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 4,
    borderTopRightRadius: 6,
  },
  imageOnlyBubbleAgent: {
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
    paddingTop: 2,
    paddingBottom: 3,
    borderTopLeftRadius: 6,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 3,
  },
  mineText: {
    color: '#fff',
  },
  agentText: {
    color: '#111827',
  },
  time: {
    fontSize: 10,
    marginTop: 2,
  },
  mineTime: {
    color: 'rgba(255,255,255,0.72)',
  },
  agentTime: {
    color: '#6b7280',
  },
  tickIcon: {
    marginLeft: 1,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 1,
  },
  attachmentBlock: {
    marginBottom: 6,
  },
  attachmentImage: {
    width: 210,
    maxHeight: 280,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  fileAttachment: {
    width: 210,
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioAttachment: {
    width: 210,
    minHeight: 54,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  audioPlay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPlayMine: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  audioPlayAgent: {
    backgroundColor: '#e9e5f4',
  },
  audioDuration: {
    fontSize: 11,
    marginTop: 1,
  },
  audioWaveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginTop: 4,
    marginBottom: 2,
  },
  audioWaveBar: {
    width: 3,
    borderRadius: 3,
  },
  audioWaveBarMine: {
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  audioWaveBarAgent: {
    backgroundColor: '#9d8bbb',
  },
  mineFileAttachment: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  agentFileAttachment: {
    backgroundColor: '#f3f4f6',
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  composer: {
    paddingHorizontal: 12,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#e8eaf0',
    backgroundColor: '#fff',
  },
  attachButton: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#d8dce5',
    paddingHorizontal: 15,
    paddingTop: 11,
    paddingBottom: 11,
    color: '#111827',
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5b35a0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5b35a0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingComposer: {
    paddingHorizontal: 12,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e8eaf0',
    backgroundColor: '#fff',
  },
  recordingDeleteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingCard: {
    flex: 1,
    minHeight: 50,
    borderRadius: 24,
    backgroundColor: '#f7f3fd',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordingDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  recordingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#543287',
  },
  waveRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  waveBar: {
    width: 3,
    borderRadius: 3,
    backgroundColor: '#8b6bc8',
  },
  recordingTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5b6472',
  },
  recordingSendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5b35a0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewStrip: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingTop: 8,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#fff',
  },
  previewItem: {
    width: 92,
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    position: 'relative',
  },
  previewImage: {
    width: 46,
    height: 38,
    borderRadius: 6,
    marginBottom: 3,
  },
  previewName: {
    fontSize: 10,
    color: '#374151',
    maxWidth: 74,
  },
  removePreview: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
