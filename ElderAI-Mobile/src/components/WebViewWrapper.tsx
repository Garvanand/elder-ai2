import React, { useRef, useState, useCallback, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl, 
  ScrollView,
  Platform,
  BackHandler,
  Alert,
  AppState,
  AppStateStatus
} from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { nativeBridge, NativeBridgeMessage } from '../lib/native-bridge';

const WEB_APP_URL = __DEV__ 
  ? 'http://172.25.250.109:8080' 
  : 'https://memory-friend.vercel.app';

interface WebViewWrapperProps {
  initialPath?: string;
  userRole?: 'elder' | 'caregiver' | 'clinician';
  authToken?: string;
  onNavigationChange?: (url: string) => void;
}

export function WebViewWrapper({ 
  initialPath = '/', 
  userRole,
  authToken,
  onNavigationChange 
}: WebViewWrapperProps) {
  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(`${WEB_APP_URL}${initialPath}`);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        webViewRef.current?.injectJavaScript(`
          window.dispatchEvent(new CustomEvent('app-foreground'));
          true;
        `);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      const message: NativeBridgeMessage = JSON.parse(event.nativeEvent.data);
      const result = await nativeBridge.handleMessage(message);
      
      if (result !== undefined && webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          window.nativeBridgeCallback && window.nativeBridgeCallback(${JSON.stringify({
            id: message.id,
            result
          })});
          true;
        `);
      }
    } catch (error) {
      console.error('WebView message error:', error);
    }
  }, []);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCurrentUrl(navState.url);
    onNavigationChange?.(navState.url);
  }, [onNavigationChange]);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    setRefreshing(false);
  }, []);

  const handleError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    Alert.alert(
      'Connection Error',
      'Unable to connect. Please check your internet connection.',
      [{ text: 'Retry', onPress: () => webViewRef.current?.reload() }]
    );
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    webViewRef.current?.reload();
  }, []);

  const injectedJavaScript = `
    (function() {
      window.isNativeMobile = true;
      window.nativeUserRole = '${userRole || ''}';
      window.nativeAuthToken = '${authToken || ''}';
      
      window.nativeBridge = {
        callNative: function(action, payload) {
          return new Promise((resolve, reject) => {
            const id = Date.now() + Math.random();
            window.nativeBridgeCallbacks = window.nativeBridgeCallbacks || {};
            window.nativeBridgeCallbacks[id] = { resolve, reject };
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              id,
              action,
              payload
            }));
            
            setTimeout(() => {
              if (window.nativeBridgeCallbacks[id]) {
                delete window.nativeBridgeCallbacks[id];
                reject(new Error('Native call timeout'));
              }
            }, 30000);
          });
        },
        
        hapticFeedback: function(type) {
          this.callNative('hapticFeedback', { type });
        },
        
        takePhoto: function() {
          return this.callNative('takePhoto', {});
        },
        
        pickImage: function() {
          return this.callNative('pickImage', {});
        },
        
        startVoiceRecording: function() {
          return this.callNative('startVoiceRecording', {});
        },
        
        stopVoiceRecording: function() {
          return this.callNative('stopVoiceRecording', {});
        },
        
        requestBiometric: function() {
          return this.callNative('requestBiometric', {});
        },
        
        scheduleNotification: function(title, body, trigger) {
          return this.callNative('scheduleNotification', { title, body, trigger });
        }
      };
      
      window.nativeBridgeCallback = function(response) {
        const callback = window.nativeBridgeCallbacks && window.nativeBridgeCallbacks[response.id];
        if (callback) {
          callback.resolve(response.result);
          delete window.nativeBridgeCallbacks[response.id];
        }
      };
      
      document.addEventListener('DOMContentLoaded', function() {
        document.body.classList.add('native-mobile');
        document.body.style.overscrollBehavior = 'none';
      });
      
      true;
    })();
  `;

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webview}
          onMessage={handleMessage}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          allowsBackForwardNavigationGestures={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          cacheEnabled={true}
          cacheMode="LOAD_DEFAULT"
          startInLoadingState={true}
          scalesPageToFit={false}
          bounces={false}
          overScrollMode="never"
          textZoom={100}
          androidLayerType="hardware"
          decelerationRate="normal"
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F59E0B" />
            </View>
          )}
          userAgent={`MemoryFriend-Mobile/${Platform.OS}/${Platform.Version}`}
          originWhitelist={['*']}
          mixedContentMode="compatibility"
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
        />
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  scrollContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 247, 237, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
