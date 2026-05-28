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
import { checkPurchaseStatus } from '../utils/checkPurchaseStatus';

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://muditam-app-backend-ca1c8b03db09.herokuapp.com';

export default function GoKwikCheckout() {
  const { cartId, bookingId, products: productsString } = useLocalSearchParams();
  const router = useRouter();
  const webViewRef = useRef();
  const purchaseCompletionRef = useRef(false);
  const purchaseSyncRef = useRef(false);
  const bookingConfirmRef = useRef(false);
  const [isCartValid, setIsCartValid] = useState(true);
  const [webViewUrl, setWebViewUrl] = useState(null);

  const products = useRef([]);

  useEffect(() => {
    try {
      products.current = productsString ? JSON.parse(productsString) : [];
    } catch (error) {
      console.error('Failed to parse checkout products:', error);
      products.current = [];
    }
  }, [productsString]);

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
          window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'modal_closed', data }));
        });
        gokwikSdk.on('openInBrowserTab', function(data) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'openInBrowserTab', data }));
        });
      }
    })();
    true;
  `;

  const handleBackPress = useCallback(() => {
    if (purchaseCompletionRef.current) {
      router.replace('/home');
      return true;
    }

    Alert.alert('Exit Checkout?', 'Are you sure you want to leave the payment screen?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Exit', style: 'destructive', onPress: () => router.back() },
    ]);
    return true;
  }, [router]);

  const syncPurchaseState = useCallback(async () => {
    if (purchaseSyncRef.current) return true;

    purchaseSyncRef.current = true;
    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      const phone = JSON.parse(userDetails || '{}')?.phone;
      const purchasedProductIds = (products.current || [])
        .map((item) => item?.id)
        .filter(Boolean);

      await AsyncStorage.setItem('hasPurchased', 'true');
      purchaseCompletionRef.current = true;

      if (phone) {
        await fetch('https://muditam-app-backend-ca1c8b03db09.herokuapp.com/api/user/mark-purchased', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            purchasedProductIds,
          }),
        });

        const progressRes = await fetch(`https://muditam-app-backend-ca1c8b03db09.herokuapp.com/api/user/kit-progress/${phone}`);
        const progressData = await progressRes.json();
        const currentKit = progressData?.currentKit || 1;
        const nextKit = currentKit + 1;
        const newKitNumber = nextKit > 5 ? 5 : nextKit;

        await fetch('https://muditam-app-backend-ca1c8b03db09.herokuapp.com/api/user/kit-progress/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, newKitNumber }),
        });
      } else {
        console.warn('Phone number not found, purchase synced locally only.');
      }

      return true;
    } catch (error) {
      console.error('Error syncing purchase state:', error);
      return false;
    } finally {
      purchaseSyncRef.current = false;
    }
  }, []);

  const completePurchaseFlow = useCallback(async () => {
    const synced = await syncPurchaseState();
    if (!synced) {
      Alert.alert('Purchase Recorded', 'Your order was placed, but app sync is still catching up. Please reopen Home.');
    }

    router.replace('/home');
  }, [router, syncPurchaseState]);

  const confirmPendingBooking = useCallback(async () => {
    if (!bookingId || bookingConfirmRef.current) return true;

    bookingConfirmRef.current = true;
    try {
      const response = await fetch(`${API_BASE}/api/redcliffe/bookings/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          isConfirmed: true,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Could not confirm the lab booking.');
      }

      return true;
    } catch (error) {
      console.error('Error confirming lab booking after payment:', error);
      Alert.alert('Payment successful', error.message || 'Lab booking confirmation is still pending. Please contact support.');
      return false;
    } finally {
      bookingConfirmRef.current = false;
    }
  }, [bookingId]);

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
        const confirmed = await confirmPendingBooking();
        if (!confirmed) return;
        await completePurchaseFlow();
      }

      if (evt === 'modal_closed') {
        const purchased = purchaseCompletionRef.current || (await checkPurchaseStatus());
        if (purchased) {
          router.replace('/home');
        } else {
          router.back();
        }
      }

      if (evt === 'openInBrowserTab') {
        console.log('GoKwik requested browser tab open:', data);
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
        onNavigationStateChange={(navState) => {
          if (purchaseCompletionRef.current && navState?.url === 'about:blank') {
            router.replace('/home');
          }
        }}
        onLoadStart={() => console.log('🌐 WebView loading started')}
        onLoadEnd={() => console.log('✅ WebView loaded')}
        onError={(e) => console.error('❌ WebView error:', e.nativeEvent)}
        onHttpError={(e) => console.error('❌ WebView HTTP error:', e.nativeEvent)}
      />
    </SafeAreaView>
  );
}
