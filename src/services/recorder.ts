import { useAudioRecorder, RecordingPresets } from 'expo-audio';

/**
 * 录音 hook 封装（expo-audio）
 * 在组件内使用：const { start, stop, uri, isRecording } = useVoiceRecorder();
 */
export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const start = async () => {
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      return true;
    } catch (e) {
      console.warn('录音启动失败', e);
      return false;
    }
  };

  const stop = async (): Promise<string | null> => {
    try {
      await recorder.stop();
      return recorder.uri ?? null;
    } catch (e) {
      console.warn('录音停止失败', e);
      return null;
    }
  };

  return {
    start,
    stop,
    isRecording: recorder.isRecording,
    uri: recorder.uri,
  };
}
