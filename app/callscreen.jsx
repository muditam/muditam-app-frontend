import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Audio } from "expo-av";
import axios from "axios";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

const API_BASE = "http://192.168.1.8:3001";
const START_CALL_URL = `${API_BASE}/api/voice/start-call`;

export default function CallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const roomRef = useRef(null);
  const micTrackRef = useRef(null);
  const timerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState("Starting…");
  const [isMuted, setIsMuted] = useState(false);

  // ✅ Speaker ON by default for debugging (so you hear agent)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const [elapsed, setElapsed] = useState(0);
  const [roomName, setRoomName] = useState("");

  const [lk, setLk] = useState(null);

  const userId = typeof params.userId === "string" ? params.userId : "";
  const language =
    typeof params.language === "string" && params.language.trim()
      ? params.language.trim()
      : "hi-IN";

  // Load LiveKit after mount
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === "web") {
          setStatusText("LiveKit not supported on web");
          setLoading(false);
          return;
        }

        const mod = require("@livekit/react-native");

        try {
          mod.registerGlobals();
        } catch (e) {
          console.warn("registerGlobals warning:", e?.message || e);
        }

        setLk(mod);
      } catch (e) {
        console.error("LiveKit load failed:", e);
        setStatusText(
          "LiveKit native module missing. Use a Development Build (not Expo Go)."
        );
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Audio mode: speaker ON by default
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: !isSpeakerOn, // speaker ON => false
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    }).catch(console.error);
  }, [isSpeakerOn]);

  // Start call only after LiveKit module is ready
  useEffect(() => {
    if (!lk) return;

    let cancelled = false;

    const initCall = async () => {
      try {
        if (!userId) {
          setLoading(false);
          setStatusText("Missing userId. Please login again.");
          return;
        }

        setLoading(true);
        setStatusText("Requesting token…");

        const res = await axios.post(START_CALL_URL, { userId, language });
        console.log("✅ start-call response:", res.data);

        const { livekitUrl, accessToken, roomName: rn, agentTrigger } =
          res.data || {};

        if (agentTrigger) console.log("🤖 agentTrigger:", agentTrigger);

        if (!livekitUrl || !accessToken) throw new Error("Missing token/url");

        if (cancelled) return;
        setRoomName(rn || "");

        setStatusText("Connecting to room…");
        await connectToRoom(lk, livekitUrl, accessToken);

        if (cancelled) return;
        setLoading(false);
        setStatusText("Waiting for expert audio…");
      } catch (err) {
        console.error("Start call error:", err);
        if (!cancelled) {
          setLoading(false);
          setStatusText("Failed to connect");
        }
      }
    };

    initCall();

    return () => {
      cancelled = true;
      cleanup().catch(console.error);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lk, userId, language]);

  const connectToRoom = async (lkMod, url, token) => {
    await new Promise((r) => setTimeout(r, 100));

    const { Room, RoomEvent, Track, createLocalAudioTrack } = lkMod;

    const room = new Room();
    roomRef.current = room;

    room.on(RoomEvent.ParticipantConnected, (p) => {
      const id = String(p?.identity || "");
      console.log("ParticipantConnected:", id);
      if (id.startsWith("agent_")) setStatusText("Expert joined…");
    });

    room.on(RoomEvent.ParticipantDisconnected, (p) => {
      const id = String(p?.identity || "");
      console.log("ParticipantDisconnected:", id);
    });

    // ✅ log when any track is published (helps confirm agent is publishing audio)
    room.on(RoomEvent.TrackPublished, (pub, participant) => {
      console.log(
        "TrackPublished:",
        participant?.identity,
        "kind=",
        pub?.kind,
        "source=",
        pub?.source
      );
    });

    room.on(RoomEvent.TrackSubscribed, async (track, _pub, participant) => {
      try {
        if (track.kind === Track.Kind.Audio) {
          const pid = String(participant?.identity || "");
          console.log("✅ Audio TrackSubscribed from:", pid);

          // If this is the agent audio, mark on call
          if (pid.startsWith("agent_")) setStatusText("On Call");

          // Some builds support setVolume
          try {
            track.setVolume?.(1.0);
          } catch {}

          // Force speaker ON during playback (debug)
          try {
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              playsInSilentModeIOS: true,
              playThroughEarpieceAndroid: false,
              shouldDuckAndroid: true,
            });
          } catch {}

          const el = track.attach();
          const p = el.play?.();
          if (p?.catch) p.catch((e) => console.error("audio play error:", e));
        }
      } catch (e) {
        console.error("TrackSubscribed handler error:", e);
      }
    });

    room.on(RoomEvent.Disconnected, () => {
      console.log("Room disconnected");
      setStatusText("Call Ended");
    });

    // ✅ IMPORTANT: autoSubscribe true
    await room.connect(url, token, { autoSubscribe: true });
    console.log("✅ connected to room:", room.name);

    // publish mic
    const mic = await createLocalAudioTrack({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    micTrackRef.current = mic;

    await room.localParticipant.publishTrack(mic, {
      source: Track.Source.Microphone,
    });

    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  };

  const cleanup = async () => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;

      const room = roomRef.current;
      if (!room) return;

      if (micTrackRef.current) {
        try {
          await room.localParticipant.unpublishTrack(micTrackRef.current);
        } catch {}
        try {
          micTrackRef.current.stop();
        } catch {}
        micTrackRef.current = null;
      }

      try {
        await room.disconnect();
      } catch {}
      roomRef.current = null;
    } catch (e) {
      console.error("cleanup error:", e);
    }
  };

  const hangupCall = async () => {
    await cleanup();
    if (router.canGoBack()) router.back();
    else router.push("/(tabs)/me");
  };

  const toggleMute = async () => {
    const room = roomRef.current;
    if (!room) return;

    const next = !isMuted;
    setIsMuted(next);

    try {
      await room.localParticipant.setMicrophoneEnabled(!next);
    } catch (e) {
      console.error("mute toggle error:", e);
    }
  };

  const toggleSpeaker = async () => {
    const next = !isSpeakerOn;
    setIsSpeakerOn(next);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>

          <Text style={styles.name}>Muditam Expert</Text>
          <Text style={styles.status}>{statusText}</Text>

          {!loading && <Text style={styles.timer}>{formatTime(elapsed)}</Text>}
          {!!roomName && <Text style={styles.roomName}>Room: {roomName}</Text>}
        </View>

        <View style={styles.middle}>
          {loading ? (
            <ActivityIndicator size="large" color="#22c55e" />
          ) : (
            <Text style={styles.tip}>If you don’t hear audio, check logs.</Text>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.btn, isMuted && styles.btnActive]}
            onPress={toggleMute}
            disabled={loading}
          >
            <Ionicons
              name={isMuted ? "mic-off" : "mic"}
              size={30}
              color="#fff"
            />
            <Text style={styles.label}>{isMuted ? "Unmute" : "Mute"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.hangup]}
            onPress={hangupCall}
          >
            <MaterialCommunityIcons
              name="phone-hangup"
              size={35}
              color="#fff"
            />
            <Text style={styles.label}>Hang Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, isSpeakerOn && styles.btnActive]}
            onPress={toggleSpeaker}
            disabled={loading}
          >
            <Ionicons
              name={isSpeakerOn ? "volume-high" : "volume-mute"}
              size={30}
              color="#fff"
            />
            <Text style={styles.label}>{isSpeakerOn ? "Speaker" : "Earpiece"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  container: { flex: 1, padding: 20, justifyContent: "space-between" },
  header: { alignItems: "center", marginTop: 20 },
  avatar: {
    width: 110,
    height: 110,
    backgroundColor: "#0f172a",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#22c55e",
    borderWidth: 2,
  },
  avatarText: { fontSize: 40, color: "#e5e7eb", fontWeight: "700" },
  name: { fontSize: 22, color: "#fff", marginTop: 10, fontWeight: "600" },
  status: { marginTop: 5, color: "#9ca3af", textAlign: "center" },
  timer: { marginTop: 10, color: "#22c55e", fontSize: 18 },
  roomName: { marginTop: 6, color: "#64748b", fontSize: 12 },
  middle: { flex: 1, justifyContent: "center", alignItems: "center" },
  tip: { color: "#e5e7eb", fontSize: 14 },
  controls: { flexDirection: "row", justifyContent: "space-between" },
  btn: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  btnActive: { backgroundColor: "#16a34a" },
  hangup: { backgroundColor: "#dc2626" },
  label: { marginTop: 5, color: "#fff", fontSize: 12 },
});