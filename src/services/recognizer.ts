import { initWhisper, initWhisperVad } from 'whisper.rn';
import { scoreUtterance, scoreFailed, ScoreResult } from './scorer';

/**
 * 语音识别器接口（可插拔）
 * V1 实现：whisper.rn（whisper.cpp 绑定，iOS Core ML 加速，离线）
 * 升级项：Qwen3-ASR（2026-01，阿里）RN runner 成熟后实现同一接口替换
 */
export interface Recognizer {
  /** 当前环境是否可用（Expo Go 无原生模块 = false，dev build = true） */
  isAvailable(): boolean;
  /**
   * 识别录音并评分
   * @param uri 录音文件（16kHz 单声道 wav 最佳）
   * @param expected 原句
   * @param durationSec 录音时长（秒）
   */
  recognize(uri: string, expected: string, durationSec: number): Promise<ScoreResult>;
}

/** 预览模式降级：无识别引擎，仅语速预估分（流利度维度有效） */
class PreviewRecognizer implements Recognizer {
  isAvailable() { return false; }
  async recognize(_uri: string, expected: string, durationSec: number): Promise<ScoreResult> {
    return scoreUtterance(null, expected, durationSec);
  }
}

/** whisper.rn 实现（dev build 环境） */
class WhisperRecognizer implements Recognizer {
  private whisper: any = null;
  private vad: any = null;

  isAvailable() {
    try {
      return !!require('whisper.rn');
    } catch {
      return false;
    }
  }

  private async ensureLoaded() {
    if (!this.whisper) {
      this.whisper = await initWhisper({
        filePath: require('../../assets/models/ggml-model.bin'),
      });
    }
    return this.whisper;
  }

  private async ensureVad() {
    if (!this.vad) {
      try {
        this.vad = await initWhisperVad({
          filePath: require('../../assets/models/ggml-vad.bin'),
          useGpu: false,
        });
      } catch {
        this.vad = null; // VAD 不可用不影响评分，仅流利度少停顿惩罚
      }
    }
    return this.vad;
  }

  /** 用 VAD 计算录音中的停顿总时长（秒） */
  private async measurePause(uri: string, durationSec: number): Promise<number> {
    try {
      const vad = await this.ensureVad();
      if (!vad) return 0;
      const segments = await vad.detectSpeech(uri, {
        threshold: 0.5,
        minSpeechDurationMs: 250,
        minSilenceDurationMs: 150,
      });
      const speechSec = segments.reduce((acc: number, seg: { t0: number; t1: number }) => acc + (seg.t1 - seg.t0), 0);
      return Math.max(0, durationSec - speechSec);
    } catch {
      return 0;
    }
  }

  async recognize(uri: string, expected: string, durationSec: number): Promise<ScoreResult> {
    try {
      const ctx = await this.ensureLoaded();
      const { promise } = ctx.transcribe(uri, { language: 'en' });
      const { result } = await promise;
      const transcript: string = (result?.result ?? result ?? '').trim();
      const pauseSec = await this.measurePause(uri, durationSec);
      // 注：whisper.rn 当前未暴露词级 token 概率，置信度走默认 0.9（不惩罚）；
      // 待运行器暴露概率后可传真实值做发音质量加权
      return scoreUtterance(transcript, expected, durationSec, 0.9, pauseSec);
    } catch (e) {
      console.warn('识别失败', e);
      return scoreFailed(expected);
    }
  }
}

/** 单例：环境可用则用 whisper，否则预览降级 */
let cached: Recognizer | null = null;
export function getRecognizer(): Recognizer {
  if (!cached) {
    const w = new WhisperRecognizer();
    cached = w.isAvailable() ? w : new PreviewRecognizer();
  }
  return cached;
}

/** 录音采样配置：16kHz 单声道 16bit WAV，whisper.cpp 直接消费，免转码 */
export const WAV_RECORDING_PRESET = {
  extension: '.wav',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitDepth: 16,
  encodeBitRate: 256000,
  linearPCM: true,
};
