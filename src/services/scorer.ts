/**
 * 口语评分器
 * 评分维度：准确度(50%) + 完整度(20%) + 流利度(30%)
 * V1：识别文本对比 + 语速计算（纯本地，无网络）
 */

export interface ScoreResult {
  total: number;      // 总分 0-100
  accuracy: number;   // 准确度 0-100
  completeness: number; // 完整度 0-100
  fluency: number;    // 流利度 0-100
  wrongWords: string[]; // 与原句不一致的词
  transcript: string; // 识别出的文本
}

const REF_WPM = 145; // 英文正常语速参考值

/** 归一化：小写 + 去标点 + 分词 */
function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** 计算词级别编辑距离（动态规划） */
function levenshteinWords(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

/** 找出识别文本中读错的词（按顺序与原文对齐） */
function findWrongWords(expected: string[], actual: string[]): string[] {
  const wrong: string[] = [];
  for (let i = 0; i < Math.max(expected.length, actual.length); i++) {
    if (expected[i] !== actual[i]) {
      if (expected[i]) wrong.push(expected[i]);
    }
  }
  return wrong;
}

/**
 * 评分主函数
 * @param transcript 语音识别出的文本（null 表示识别失败）
 * @param expected   原句
 * @param durationSec 录音时长（秒），用于流利度
 * @param avgConf    词级识别置信度均值 0-1（whisper.cpp token probability），
 *                   置信度低说明发音含糊/口音重，即使词对也扣分
 * @param pauseSec   停顿总时长（秒），流利度惩罚用（V1 可传 0）
 */
export function scoreUtterance(
  transcript: string | null,
  expected: string,
  durationSec: number,
  avgConf = 0.9,
  pauseSec = 0
): ScoreResult {
  const expWords = normalize(expected);
  const actWords = transcript ? normalize(transcript) : [];

  // 准确度：编辑距离换算，再乘置信度加权（0.4~1.0 系数）
  const dist = levenshteinWords(expWords, actWords);
  const maxLen = Math.max(expWords.length, actWords.length, 1);
  const baseAcc = (1 - dist / maxLen) * 100;
  const confFactor = 0.4 + 0.6 * Math.max(0, Math.min(avgConf, 1));
  const accuracy = Math.max(0, Math.round(baseAcc * confFactor));

  // 完整度：念出的词占原句比例
  const completeness = Math.max(0, Math.min(100, Math.round((actWords.length / Math.max(expWords.length, 1)) * 100)));

  // 流利度：语速偏离参考值越远分越低，另扣停顿分（每秒停顿扣 4 分）
  let fluency = 0;
  if (durationSec > 0.5 && actWords.length > 0) {
    const wpm = actWords.length / (durationSec / 60);
    const deviation = Math.abs(wpm - REF_WPM) / REF_WPM;
    fluency = Math.max(0, Math.round((1 - Math.min(deviation, 1)) * 100));
    fluency = Math.max(0, fluency - Math.round(pauseSec * 4));
  } else {
    fluency = 0;
  }

  // 识别失败直接低分
  const total = transcript
    ? Math.round(accuracy * 0.5 + completeness * 0.2 + fluency * 0.3)
    : Math.round(accuracy * 0.5 + fluency * 0.3);

  return {
    total,
    accuracy,
    completeness,
    fluency,
    wrongWords: findWrongWords(expWords, actWords),
    transcript: transcript ?? '',
  };
}

/** 识别失败时的兜底结果 */
export function scoreFailed(expected: string): ScoreResult {
  return {
    total: 0,
    accuracy: 0,
    completeness: 0,
    fluency: 0,
    wrongWords: normalize(expected),
    transcript: '',
  };
}
