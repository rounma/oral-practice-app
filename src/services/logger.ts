import { Platform } from 'react-native';

/**
 * 轻量内存日志：环形缓冲 + 时间戳 + 级别
 * 用途：Expo Go 预览阶段排查问题，一键复制日志发给开发者
 */
type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  time: string;
  level: LogLevel;
  msg: string;
}

const MAX_ENTRIES = 300;
const entries: LogEntry[] = [];

function ts(): string {
  const d = new Date();
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}

function push(level: LogLevel, msg: string) {
  entries.push({ time: ts(), level, msg });
  if (entries.length > MAX_ENTRIES) entries.shift();
}

export const log = {
  info(msg: string) {
    push('INFO', msg);
    console.log(`[INFO] ${msg}`);
  },
  warn(msg: string) {
    push('WARN', msg);
    console.warn(`[WARN] ${msg}`);
  },
  error(msg: string) {
    push('ERROR', msg);
    console.error(`[ERROR] ${msg}`);
  },
  /** 导出全部日志文本（含环境信息头），供一键复制 */
  exportText(): string {
    const head = [
      '=== 口语陪练 运行日志 ===',
      `导出时间: ${new Date().toLocaleString()}`,
      `平台: ${Platform.OS}${Platform.OS === 'ios' ? ` (${Platform.Version})` : ''}`,
      `日志条数: ${entries.length}`,
      '---',
    ].join('\n');
    const body = entries.map((e) => `[${e.time}] [${e.level}] ${e.msg}`).join('\n');
    return head + '\n' + (body || '（暂无日志）');
  },
  clear() {
    entries.length = 0;
  },
};
