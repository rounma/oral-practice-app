import { RecordingPresets } from 'expo-audio';
import Constants from 'expo-constants';
import { TurboModuleRegistry } from 'react-native';
import { log } from './logger';
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

/** 预览模式降级：无识别引擎，不造假分——返回哨兵结果（total=-1），UI 据此显示"录音成功、评分待开发版" */
class PreviewRecognizer implements Recognizer {
  isAvailable() { return false; }
  async recognize(_uri: string, expected: string, durationSec: number): Promise<ScoreResult> {
    log.info(`预览模式：录音 ${durationSec.toFixed(1)}s 成功，无 ASR 引擎不评分`);
    return {
      total: -1,
      accuracy: -1,
      completeness: -1,
      fluency: -1,
      wrongWords: [],
      transcript: '',
    };
  }
}

/** whisper.rn 实现（dev build 环境） */
class WhisperRecognizer implements Recognizer {
  private whisper: any = null;
  private vad: any = null;

  /** 懒加载 whisper.rn：Expo Go 下 require 抛错即不可用，dev build 下正常 */
  private loadModule(): { initWhisper: any; initWhisperVad: any } | null {
    try {
      return require('whisper.rn');
    } catch {
      return null;
    }
  }

  /** whisper.rn 原生 TurboModule 是否存在（Expo Go 里为 null，dev build 里存在） */
  private hasNativeModule(): boolean {
    try {
      return TurboModuleRegistry.get('RNWhisper') != null;
    } catch {
      return false;
    }
  }

  isAvailable() {
    // Expo Go（storeClient）绝无 whisper.rn 原生模块，无条件降级，不依赖 require/TurboModule 探测
    if (Constants.executionEnvironment === 'storeClient') {
      log.info('Expo Go 环境，whisper 不可用，降级预览模式');
      return false;
    }
    if (!this.hasNativeModule()) {
      log.info('whisper 原生模块不可用（非 dev build），降级预览模式');
      return false;
    }
    return this.loadModule() !== null;
  }

  private async ensureLoaded() {
    if (!this.whisper) {
      const mod = this.loadModule();
      if (!mod) throw new Error('whisper.rn 不可用（Expo Go 预览模式）');
      this.whisper = await mod.initWhisper({
        filePath: require('../../assets/models/ggml-model.bin'),
      });
    }
    return this.whisper;
  }

  private async ensureVad() {
    if (!this.vad) {
      try {
        const mod = this.loadModule();
        if (!mod) return null;
        this.vad = await mod.initWhisperVad({
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
      log.info(`whisper 识别: transcript="${transcript.slice(0, 80)}" pause=${pauseSec.toFixed(1)}s`);
      // 注：whisper.rn 当前未暴露词级 token 概率，置信度走默认 0.9（不惩罚）；
      // 待运行器暴露概率后可传真实值做发音质量加权
      return scoreUtterance(transcript, expected, durationSec, 0.9, pauseSec);
    } catch (e) {
      log.error('whisper 识别失败: ' + (e instanceof Error ? e.message : String(e)));
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

/** 录音采样配置：SDK 54 下 expo-audio 不支持 WAV 直录字段（bitDepth/linearPCM 为 SDK 55+），
 *  预览模式仅按语速评分，音频格式无关，故用内置 HIGH_QUALITY（m4a）。
 *  升级 SDK 57+ 后恢复 16kHz 单声道 WAV 直录 preset 供 whisper.cpp 免转码消费。 */
export const WAV_RECORDING_PRESET = RecordingPresets.HIGH_QUALITY;
