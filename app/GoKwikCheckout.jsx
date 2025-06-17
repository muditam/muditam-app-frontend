import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  AppState,
  View,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { encode as b64Encode } from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GoKwikCheckout() {
  const { cartId } = useLocalSearchParams();
  const router = useRouter();
  const webViewRef = useRef();
  const [isCartValid, setIsCartValid] = useState(true);
  const [webViewUrl, setWebViewUrl] = useState(null);

  useEffect(() => {
    if (!cartId || cartId === 'undefined') {
      console.error('Invalid or missing cart ID');
      setIsCartValid(false);
      return;
    }

    const cleanCartId = cartId.split('?')[0];
    const storeInfo = {
      type: 'merchantInfo',
      source: 'app',
      appFlow: 'true',
      blockExternalEvents: true,
      mid: '19h6nos2bs9g',
      environment: 'production',
      storeId: '73471557942',
      storeData: {
        cartId: `gid://shopify/Cart/${cleanCartId}`,
        storefrontAccessToken: '49e405879524226e3fe4c245b444f752',
        shopDomain: 'muditam.myshopify.com',
      },
    };

    const storeInfoEncoded = b64Encode(JSON.stringify(storeInfo));
    const url = storeInfo.environment === 'production'
      ? `https://pdp.gokwik.co/app/appmaker-kwik-checkout.html?storeInfo=${storeInfoEncoded}`
      : `https://sandbox.pdp.gokwik.co/app/appmaker-kwik-checkout.html?storeInfo=${storeInfoEncoded}`;

    setWebViewUrl(url);
  }, [cartId]);

  const injectedJavaScript = `
    (function checkGoKwikSdk() {
      if (typeof gokwikSdk !== 'undefined') {
        gokwikSdk.on('orderSuccess', function(data) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'orderSuccess', data }));
        });
        gokwikSdk.on('modal_closed', function(data) {
          console.log('Modal closed', data);
        });
        gokwikSdk.on('openInBrowserTab', function(data) {
          console.log('Open in browser tab', data);
        });
      }
    })();
    true;
  `;

  const handleBackPress = useCallback(() => {
    Alert.alert('Exit Checkout?', 'Are you sure you want to leave the payment screen?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Exit', style: 'destructive', onPress: () => router.back() },
    ]);
    return true;
  }, [router]);

  useEffect(() => {
    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
      console.log('📱 App state changed:', nextAppState);
    });

    return () => {
      backHandlerListener.remove();
      appStateListener.remove();
    };
  }, [handleBackPress]);

  const handleWebViewMessage = async (event) => {
    try {
      const { event: evt, data } = JSON.parse(event.nativeEvent.data);
      if (evt === 'orderSuccess') {
        console.log('✅ Order success detected:', data);

        const userDetails = await AsyncStorage.getItem('userDetails');
        const phone = JSON.parse(userDetails || '{}')?.phone;

        if (phone) {
          await AsyncStorage.setItem('hasPurchased', 'true');

          // ✅ 1. Mark as purchased
          await fetch('http://192.168.1.32:3001/api/user/mark-purchased', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
          });

          // ✅ 2. Get current kit progress
          const progressRes = await fetch(`http://192.168.1.32:3001/api/user/kit-progress/${phone}`);
          const progressData = await progressRes.json();
          const currentKit = progressData?.currentKit || 1;
          const nextKit = currentKit + 1;
          const newKitNumber = nextKit > 5 ? 5 : nextKit; // cap at 5

          // ✅ 3. Update to new kit number
          await fetch('http://192.168.1.32:3001/api/user/kit-progress/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, newKitNumber }),
          });

          Alert.alert('Purchase Successful', 'Thank you for your order!');
        } else {
          console.warn('Phone number not found, not syncing purchase to backend.');
        }

        router.replace('/home');
      }
    } catch (error) {
      console.error('Error handling message from WebView:', error);
    }
  };

  if (!isCartValid) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#000', marginBottom: 10 }}>
          Error: Missing or invalid cart ID
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#9D57FF',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!webViewUrl) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#9D57FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <WebView
        ref={webViewRef}
        source={{ uri: webViewUrl }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        webviewDebuggingEnabled
        startInLoadingState
        injectedJavaScript={injectedJavaScript}
        onMessage={handleWebViewMessage}
        renderLoading={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#9D57FF" />
          </View>
        )}
        onLoadStart={() => console.log('🌐 WebView loading started')}
        onLoadEnd={() => console.log('✅ WebView loaded')}
        onError={(e) => console.error('❌ WebView error:', e.nativeEvent)}
        onHttpError={(e) => console.error('❌ WebView HTTP error:', e.nativeEvent)}
      />
    </SafeAreaView>
  );
}
