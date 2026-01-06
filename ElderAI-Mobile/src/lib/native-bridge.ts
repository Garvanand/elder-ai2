import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface NativeBridgeMessage {
  id: number;
  action: string;
  payload?: Record<string, any>;
}

class NativeBridge {
  private recording: Audio.Recording | null = null;

  async handleMessage(message: NativeBridgeMessage): Promise<any> {
    const { action, payload } = message;

    switch (action) {
      case 'hapticFeedback':
        return this.hapticFeedback(payload?.type);
      
      case 'takePhoto':
        return this.takePhoto();
      
      case 'pickImage':
        return this.pickImage();
      
      case 'startVoiceRecording':
        return this.startVoiceRecording();
      
      case 'stopVoiceRecording':
        return this.stopVoiceRecording();
      
      case 'requestBiometric':
        return this.requestBiometric();
      
      case 'scheduleNotification':
        console.log('Push notifications not supported in Expo Go SDK 53+');
        return null;
      
      case 'getDeviceInfo':
        return this.getDeviceInfo();
      
      default:
        console.warn('Unknown native action:', action);
        return null;
    }
  }

  async hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') {
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
      return true;
    } catch (error) {
      console.error('Haptic feedback error:', error);
      return false;
    }
  }

  async takePhoto(): Promise<{ uri: string; base64?: string } | null> {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) {
        return null;
      }

      return {
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      };
    } catch (error) {
      console.error('Take photo error:', error);
      return null;
    }
  }

  async pickImage(): Promise<{ uri: string; base64?: string } | null> {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) {
        return null;
      }

      return {
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      };
    } catch (error) {
      console.error('Pick image error:', error);
      return null;
    }
  }

  async startVoiceRecording(): Promise<boolean> {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      this.recording = recording;
      return true;
    } catch (error) {
      console.error('Start recording error:', error);
      return false;
    }
  }

  async stopVoiceRecording(): Promise<{ uri: string; duration: number } | null> {
    try {
      if (!this.recording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();
      
      this.recording = null;
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      return {
        uri: uri || '',
        duration: status.durationMillis || 0,
      };
    } catch (error) {
      console.error('Stop recording error:', error);
      return null;
    }
  }

  async requestBiometric(): Promise<{ success: boolean; error?: string }> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return { success: false, error: 'No biometric hardware available' };
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return { success: false, error: 'No biometrics enrolled' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      return { 
        success: result.success,
        error: result.success ? undefined : 'Authentication failed'
      };
    } catch (error) {
      console.error('Biometric auth error:', error);
      return { success: false, error: 'Authentication error' };
    }
  }

  getDeviceInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isTablet: Platform.OS === 'ios' ? false : false,
    };
  }
}

export const nativeBridge = new NativeBridge();
