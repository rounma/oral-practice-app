/**
 * whisper.rn 类型声明
 * 包自身 exports 未暴露根类型入口（只有 "./*" 通配），此处声明必要 API。
 * 运行时由 Metro 的 react-native 条件导出解析，与类型无关。
 */
declare module 'whisper.rn' {
  export interface WhisperContext {
    transcribe(
      audioPath: string | number,
      options?: {
        language?: string;
        translate?: boolean;
        maxThreads?: number;
        tokenTimestamps?: boolean;
        onProgress?: (progress: number) => void;
      }
    ): {
      stop: () => Promise<void>;
      promise: Promise<{
        result: string;
        segments: Array<{ text: string; t0: number; t1: number }>;
        isAborted: boolean;
      }>;
    };
    release(): Promise<void>;
  }

  export interface VadContext {
    detectSpeech(
      audio: string | number,
      options?: {
        threshold?: number;
        minSpeechDurationMs?: number;
        minSilenceDurationMs?: number;
        maxSpeechDurationS?: number;
        speechPadMs?: number;
      }
    ): Promise<Array<{ t0: number; t1: number }>>;
    release(): Promise<void>;
  }

  export function initWhisper(options: {
    filePath: string | number;
    useGpu?: boolean;
    useCoreMLIos?: boolean;
    coreMLModelAsset?: any;
  }): Promise<WhisperContext>;

  export function initWhisperVad(options: {
    filePath: string | number;
    useGpu?: boolean;
    nThreads?: number;
  }): Promise<VadContext>;

  export function releaseAllWhisper(): Promise<void>;
  export function releaseAllWhisperVad(): Promise<void>;
}
