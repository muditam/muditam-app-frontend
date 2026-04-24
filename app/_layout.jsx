// app/_layout.jsx
import { Slot } from 'expo-router';
import { CartProvider } from './contexts/CartContext';
import { Platform } from 'react-native';

// Register LiveKit WebRTC globals at app startup
// This MUST be done before any LiveKit components are used
if (Platform.OS !== 'web') {
  try {
    const { registerGlobals } = require('@livekit/react-native');
    registerGlobals();
    console.log('✅ LiveKit WebRTC globals registered at app startup');
  } catch (error) {
    console.warn('⚠️ Failed to register LiveKit globals. This requires a development build (not Expo Go):', error.message);
  }
}

export default function RootLayout() {
  return (
    <CartProvider>
      <Slot />
    </CartProvider>
  );
}
 