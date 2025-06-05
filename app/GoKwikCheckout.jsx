import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, BackHandler, AppState, View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { encode as b64Encode } from 'base-64';

export default function GoKwikCheckout() {
  const { cartId } = useLocalSearchParams();
  const webViewRef = useRef();
 
  const cleanCartId = cartId?.split('?')[0];
  console.log('Raw cartId:', cartId);
  console.log('Clean cartId:', cleanCartId);

  if (!cleanCartId) {
    console.error('No valid cart ID received');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: Missing or invalid cart ID</Text>
      </View>
    );
  }

  const storeInfo = {
    type: 'merchantInfo',
    source: 'app',
    appFlow: 'true',
    blockExternalEvents: true,
    mid: '19gyaysdtx9g',
    environment: 'sandbox',  
    storeId: '73471557942',
    fbpixel: '',
    gaTrackingID: '',
    webEngageID: '',
    moEngageID: '',
    utmParams: {
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'spring_sale',
      utm_term: 'running_shoes',
      utm_content: 'ad_banner_1',
      landing_page: '/cart',
      orig_referrer: 'https://gokwikproduction.myshopify.com/',
    },
    storeData: {
      cartId: `gid://shopify/Cart/${cleanCartId}`,  
      storefrontAccessToken: '49e405879524226e3fe4c245b444f752',
      shopDomain: 'muditam.myshopify.com',
    },
  };

  const storeInfoEncoded = b64Encode(JSON.stringify(storeInfo));
  const webViewUrl =
    storeInfo.environment === 'production'
      ? `https://pdp.gokwik.co/app/appmaker-kwik-checkout.html?storeInfo=${storeInfoEncoded}`
      : `https://sandbox.pdp.gokwik.co/app/appmaker-kwik-checkout.html?storeInfo=${storeInfoEncoded}`;


  const injectedJavaScript = `
    console.log('Injected JS running');
    (function checkGoKwikSdk() {
      if (typeof gokwikSdk !== 'undefined') {
        console.log('GoKwik SDK available');
        gokwikSdk.on('modal_closed', (data) => {
          console.log('Modal closed', data);
        });
        gokwikSdk.on('orderSuccess', (data) => {
          console.log('Order success', data);
        });
        gokwikSdk.on('openInBrowserTab', (data) => {
          console.log('Open in browser tab', data);
        });
      } else {
        setTimeout(checkGoKwikSdk, 500);
        console.log('GoKwik SDK not available yet, retrying...');
      }
    })();
    document.addEventListener("gk-checkout-disable", (event) => {
      console.log('Checkout disabled', event);
    });
    true;
  `;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => false);
    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
      console.log('📱 App state changed:', nextAppState);
    });

    return () => {
      backHandler.remove();
      appStateListener.remove();
    };
  }, []);

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: webViewUrl }}
      originWhitelist={['*']} 
      javaScriptEnabled={true}
      domStorageEnabled={true}
      injectedJavaScript={injectedJavaScript}
      startInLoadingState
      renderLoading={() => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#9D57FF" />
        </View>
      )}
      onLoadStart={() => console.log('WebView started loading')}
      onLoadEnd={() => console.log('WebView finished loading')}
      onError={(e) => {
        console.error('WebView error:', e.nativeEvent);
      }}
      onHttpError={(e) => {
        console.error('WebView HTTP error:', e.nativeEvent);
      }}
      onMessage={(event) => {
        console.log('Received message from WebView:', event.nativeEvent.data);
      }}
    />
  );
}
