import * as Speech from 'expo-speech';

/**
 * TTS 可插拔接口
 * 当前实现：系统神经 TTS（iOS 26 系统级持续更新）
 * 升级项：Kokoro 本地神经 TTS（2025 开源，82M，用户六级单词 APK 已验证）——
 * 接入时实现同一接口即可，界面零改动。
 */
export interface TtsEngine {
  speak(text: string, onDone?: () => void): void;
  stop(): void;
}

class SystemTts implements TtsEngine {
  private speaking = false;

  speak(text: string, onDone?: () => void) {
    this.stop();
    this.speaking = true;
    Speech.speak(text, {
      language: 'en-US',
      rate: 0.85,
      pitch: 1.0,
      onDone: () => { this.speaking = false; onDone?.(); },
      onStopped: () => { this.speaking = false; },
      onError: () => { this.speaking = false; },
    });
  }

  stop() {
    if (this.speaking) {
      Speech.stop();
      this.speaking = false;
    }
  }
}

export const tts: TtsEngine = new SystemTts();

/** 播放英文原声 */
export function speakEnglish(text: string, onDone?: () => void) {
  tts.speak(text, onDone);
}

export function stopSpeaking() {
  tts.stop();
}
