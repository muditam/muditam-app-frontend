import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Image,
  NativeModules,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Audio } from "expo-av";
import Constants from "expo-constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { io } from "socket.io-client";

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://muditam-app-backend-ca1c8b03db09.herokuapp.com";
const SOCKET_BASE = (process.env.EXPO_PUBLIC_SOCKET_BASE_URL || API_BASE).replace(/\/$/, "");
const END_HUMAN_CALL_URL = `${API_BASE}/api/voice/human-calls`;
const EXPERT_IMAGE_URL = "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_26_1.png?v=1777293009";

export default function CallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const engineRef = useRef(null);
  const timerRef = useRef(null);
  const socketRef = useRef(null);
  const proximitySubscriptionRef = useRef(null);
  const inCallManagerRef = useRef(null);
  const audioQualityModeRef = useRef("high");
  const weakNetworkStreakRef = useRef(0);
  const strongNetworkStreakRef = useRef(0);
  const endedRef = useRef(false);
  const callAcceptedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState("Starting call...");
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isProximityNear, setIsProximityNear] = useState(false);

  const mode = typeof params.mode === "string" ? params.mode : "human";
  const phone = typeof params.phone === "string" ? params.phone : "";
  const callId = typeof params.callId === "string" ? params.callId : "";
  const appId = typeof params.appId === "string" ? params.appId : "";
  const token = typeof params.token === "string" ? params.token : "";
  const channelName = typeof params.channelName === "string" ? params.channelName : "";
  const uid = Number(params.uid || 0);

  useEffect(() => {
    if (!phone) return;
    const socket = io(SOCKET_BASE, {
      auth: { role: "user", phone },
      transports: ["polling"],
      upgrade: false,
    });
    socketRef.current = socket;

    socket.on("call:accepted", (payload = {}) => {
      if (!payload.call?.callId || payload.call.callId === callId) {
        callAcceptedRef.current = true;
        setStatusText("Expert joined");
        startTimer();
      }
    });
    socket.on("call:ended", (payload = {}) => {
      if (payload.call?.callId && payload.call.callId !== callId) return;
      finishRemoteCall("Call ended");
    });
    socket.on("call:declined", (payload = {}) => {
      if (payload.call?.callId && payload.call.callId !== callId) return;
      finishRemoteCall("Call declined");
    });
    socket.on("call:missed", (payload = {}) => {
      if (payload.call?.callId && payload.call.callId !== callId) return;
      finishRemoteCall("Call missed");
    });

    return () => socket.disconnect();
  // finishRemoteCall is intentionally kept stable through refs/router for socket callbacks.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId, phone]);

  const getInCallManager = () => {
    if (Platform.OS === "web" || !NativeModules?.InCallManager) return null;
    try {
      // Native-only module for routing call audio and handling proximity.
      return require("react-native-incall-manager").default;
    } catch {
      return null;
    }
  };

  const applySpeakerRoute = (speakerOn) => {
    const inCallManager = inCallManagerRef.current;
    if (Platform.OS === "ios") {
      try {
        Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: false,
        }).catch(() => {});
      } catch {}
    }
    if (!inCallManager) return;
    try {
      inCallManager.setForceSpeakerphoneOn(speakerOn);
      inCallManager.setSpeakerphoneOn(speakerOn);
    } catch {}
  };

  const startNativeCallAudio = () => {
    const inCallManager = getInCallManager();
    inCallManagerRef.current = inCallManager;
    if (!inCallManager) {
      return;
    }

    try {
      inCallManager.start({ media: "audio", auto: true, ringback: "" });
      inCallManager.setMicrophoneMute(false);
      inCallManager.setForceSpeakerphoneOn(false);
      inCallManager.setSpeakerphoneOn(false);
      inCallManager.startProximitySensor();
    } catch {}

    proximitySubscriptionRef.current?.remove?.();
    proximitySubscriptionRef.current = DeviceEventEmitter.addListener("Proximity", (payload = {}) => {
      setIsProximityNear(Boolean(payload.isNear));
    });
    applySpeakerRoute(false);
  };

  const stopNativeCallAudio = () => {
    proximitySubscriptionRef.current?.remove?.();
    proximitySubscriptionRef.current = null;
    setIsProximityNear(false);

    const inCallManager = inCallManagerRef.current;
    if (inCallManager) {
      try {
        inCallManager.setForceSpeakerphoneOn(null);
      } catch {}
      try {
        inCallManager.stopProximitySensor();
      } catch {}
      try {
        inCallManager.stop();
      } catch {}
    }
    inCallManagerRef.current = null;
  };

  const updateMobileAudioQuality = (nextMode, agoraConstants) => {
    if (audioQualityModeRef.current === nextMode) return;
    const engine = engineRef.current;
    if (!engine || !agoraConstants) return;

    const { AudioProfileType, AudioScenarioType } = agoraConstants;
    const nextProfile =
      nextMode === "standard"
        ? AudioProfileType.AudioProfileMusicStandard
        : AudioProfileType.AudioProfileMusicHighQuality;

    try {
      engine.setAudioProfile(nextProfile, AudioScenarioType.AudioScenarioMeeting);
      audioQualityModeRef.current = nextMode;
      console.log("Agora mobile audio quality ->", nextMode);
    } catch (error) {
      console.warn("Failed to switch mobile audio quality", error);
    }
  };

  const handleMobileNetworkQuality = (txQuality, rxQuality, agoraConstants) => {
    const localWorst = Math.max(Number(txQuality || 0), Number(rxQuality || 0));
    const weak = localWorst >= 4;
    const strong = localWorst > 0 && localWorst <= 2;

    weakNetworkStreakRef.current = weak ? weakNetworkStreakRef.current + 1 : 0;
    strongNetworkStreakRef.current = strong ? strongNetworkStreakRef.current + 1 : 0;

    if (weakNetworkStreakRef.current >= 2) {
      strongNetworkStreakRef.current = 0;
      updateMobileAudioQuality("standard", agoraConstants);
      return;
    }

    if (strongNetworkStreakRef.current >= 3) {
      weakNetworkStreakRef.current = 0;
      updateMobileAudioQuality("high", agoraConstants);
    }
  };

  useEffect(() => {
    applySpeakerRoute(isSpeakerOn);
  }, [isSpeakerOn]);

  useEffect(() => {
    let cancelled = false;

    const joinAgora = async () => {
      try {
        if (Platform.OS === "web") {
          setStatusText("Calling is not supported on web.");
          setLoading(false);
          return;
        }
        if (Constants.appOwnership === "expo") {
          setStatusText("Install a development build to use in-app calling.");
          setLoading(false);
          return;
        }
        if (!appId || !token || !channelName || !uid) {
          setStatusText("Missing call details. Please try again.");
          setLoading(false);
          return;
        }

        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== "granted") {
          setStatusText("Microphone permission is required for calls.");
          setLoading(false);
          return;
        }

        const { getAgoraModule } = require("../utils/agoraClient");
        const agora = getAgoraModule();
        const {
          AudioProfileType,
          AudioScenarioType,
          ChannelMediaOptions,
          ChannelProfileType,
          ClientRoleType,
          QualityType,
          createAgoraRtcEngine,
        } = agora;

        const agoraConstants = {
          AudioProfileType,
          AudioScenarioType,
        };

        startNativeCallAudio();
        audioQualityModeRef.current = "high";
        weakNetworkStreakRef.current = 0;
        strongNetworkStreakRef.current = 0;

        const engine = createAgoraRtcEngine();
        engineRef.current = engine;
        engine.initialize({
          appId,
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          audioScenario: AudioScenarioType.AudioScenarioMeeting,
        });
        engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
        engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
        engine.registerEventHandler({
          onJoinChannelSuccess: () => {
            if (cancelled) return;
            setLoading(false);
            setStatusText("Waiting for expert to accept...");
          },
          onUserJoined: () => {
            callAcceptedRef.current = true;
            setStatusText("On call");
            startTimer();
          },
          onUserOffline: () => {
            setStatusText("Expert left");
          },
          onLeaveChannel: () => {
            setStatusText("Call ended");
          },
          onError: (_err, msg) => {
            setStatusText(msg || "Call connection failed");
          },
          onFirstLocalAudioFramePublished: () => {
            console.log("Agora first local audio frame published");
          },
          onLocalAudioStateChanged: (_connection, state, reason) => {
            console.log("Agora local audio state:", state, reason);
          },
          onAudioPublishStateChanged: (_channel, oldState, newState) => {
            console.log("Agora audio publish state:", oldState, newState);
          },
          onAudioVolumeIndication: (_connection, speakers, _speakerNumber, totalVolume) => {
            const localSpeaker = Array.isArray(speakers)
              ? speakers.find((speaker) => Number(speaker.uid || 0) === 0)
              : null;
            if (localSpeaker?.volume || totalVolume) {
              console.log("Agora volume indication:", {
                localVolume: localSpeaker?.volume || 0,
                totalVolume,
              });
            }
          },
          onRemoteAudioStateChanged: (_connection, remoteUid, state, reason) => {
            console.log("Agora remote audio state:", remoteUid, state, reason);
          },
          onNetworkQuality: (_connection, remoteUid, txQuality, rxQuality) => {
            if (Number(remoteUid || 0) !== 0) return;
            if (
              txQuality === QualityType.QualityUnsupported ||
              rxQuality === QualityType.QualityUnsupported
            ) {
              return;
            }
            handleMobileNetworkQuality(txQuality, rxQuality, agoraConstants);
          },
        });

        engine.enableAudio();
        engine.enableLocalAudio(true);
        engine.muteLocalAudioStream(false);
        engine.muteAllRemoteAudioStreams(false);
        engine.enableAudioVolumeIndication(400, 3, true);
        engine.setAudioProfile(AudioProfileType.AudioProfileMusicHighQuality, AudioScenarioType.AudioScenarioMeeting);
        engine.adjustPlaybackSignalVolume(100);
        engine.setDefaultAudioRouteToSpeakerphone(false);
        engine.setEnableSpeakerphone(false);
        const joinOptions = new ChannelMediaOptions();
        joinOptions.channelProfile = ChannelProfileType.ChannelProfileCommunication;
        joinOptions.clientRoleType = ClientRoleType.ClientRoleBroadcaster;
        joinOptions.publishMicrophoneTrack = true;
        joinOptions.enableAudioRecordingOrPlayout = true;
        joinOptions.autoSubscribeAudio = true;
        joinOptions.autoSubscribeVideo = false;
        const joinResult = engine.joinChannel(token, channelName, uid, joinOptions);
        if (typeof joinResult === "number" && joinResult < 0) {
          throw new Error(`Agora join failed (${joinResult})`);
        }
        engine.muteLocalAudioStream(false);
      } catch (err) {
        setStatusText(err.message || "Call connection failed");
        setLoading(false);
        stopNativeCallAudio();
      }
    };

    joinAgora();

    return () => {
      cancelled = true;
      cleanupAgora();
    };
  // Joining should run once per issued token/channel. Speaker route is handled by its own effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, channelName, token, uid]);

  const startTimer = () => {
    if (!callAcceptedRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((current) => current + 1), 1000);
  };

  const cleanupAgora = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    stopNativeCallAudio();
    try {
      engineRef.current?.leaveChannel();
    } catch {}
    try {
      engineRef.current?.release();
    } catch {}
    engineRef.current = null;
  };

  const finishRemoteCall = (message) => {
    if (endedRef.current) return;
    endedRef.current = true;
    setStatusText(message);
    cleanupAgora();
    setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.push("/(tabs)/me");
    }, 900);
  };

  const hangupCall = async () => {
    if (!endedRef.current && mode === "human" && callId) {
      endedRef.current = true;
      fetch(`${END_HUMAN_CALL_URL}/${callId}/end`, { method: "POST" }).catch(() => {});
    }
    cleanupAgora();
    if (router.canGoBack()) router.back();
    else router.push("/(tabs)/me");
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    try {
      engineRef.current?.muteLocalAudioStream(next);
    } catch {}
    try {
      inCallManagerRef.current?.setMicrophoneMute(next);
    } catch {}
  };

  const toggleSpeaker = () => {
    const next = !isSpeakerOn;
    setIsSpeakerOn(next);
    try {
      engineRef.current?.setEnableSpeakerphone(next);
    } catch {}
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarRing}>
            <Image source={{ uri: EXPERT_IMAGE_URL }} style={styles.avatarImage} />
          </View>
          <Text style={styles.name}>Muditam Expert</Text>
          <Text style={styles.status}>{statusText}</Text>
          {!loading && <Text style={styles.timer}>{formatTime(elapsed)}</Text>}
        </View>

        <View style={styles.middle}>
          {loading ? (
            <View style={styles.connectingCard}>
              <ActivityIndicator size="small" color="#543287" />
              <Text style={styles.connectingText}>Connecting securely</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={[styles.btn, isMuted && styles.btnActive]} onPress={toggleMute} disabled={loading}>
            <Ionicons name={isMuted ? "mic-off" : "mic"} size={28} color="#fff" />
            <Text style={styles.label}>{isMuted ? "Unmute" : "Mute"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.hangup]} onPress={hangupCall}>
            <MaterialCommunityIcons name="phone-hangup" size={34} color="#fff" />
            <Text style={styles.label}>End</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, isSpeakerOn && styles.btnActive]} onPress={toggleSpeaker} disabled={loading}>
            <Ionicons name={isSpeakerOn ? "volume-high" : "volume-mute"} size={28} color="#fff" />
            <Text style={styles.label}>{isSpeakerOn ? "Speaker" : "Earpiece"}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {isProximityNear && !isSpeakerOn ? <View pointerEvents="none" style={styles.proximityOverlay} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#111827" },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 28,
    justifyContent: "space-between",
  },
  header: { alignItems: "center", marginTop: 18 },
  avatarRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "#f7f3ff",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.72)",
    borderWidth: 5,
  },
  avatarImage: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: "#fff",
  },
  name: { fontSize: 24, color: "#fff", marginTop: 18, fontWeight: "800" },
  status: { marginTop: 7, color: "#d1d5db", textAlign: "center", fontSize: 15, fontWeight: "600" },
  timer: { marginTop: 18, color: "#fff", fontSize: 34, fontWeight: "800" },
  middle: { flex: 1, justifyContent: "center", alignItems: "center" },
  connectingCard: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  connectingText: { color: "#344054", fontSize: 13, fontWeight: "800" },
  controls: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 22 },
  btn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  btnActive: { backgroundColor: "#543287", borderColor: "#7c3aed" },
  hangup: { width: 82, height: 82, borderRadius: 41, backgroundColor: "#dc2626", borderColor: "#ef4444" },
  label: { marginTop: 5, color: "#fff", fontSize: 11, fontWeight: "700" },
  proximityOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 99,
  },
});
