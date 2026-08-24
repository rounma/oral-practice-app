import { registerRootComponent } from 'expo';
import { Alert } from 'react-native';

// 诊断用全局错误捕获：在 require('./App') 之前设置，import 阶段的错误也能捕获
const originalHandler = ErrorUtils.getGlobalHandler?.();
ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
  const err = error instanceof Error ? error : new Error(String(error));
  const msg = `[${isFatal ? 'FATAL' : 'JS'}] ${err.message}\n${err.stack || ''}`;
  console.error('GLOBAL_ERROR', msg);
  try {
    Alert.alert(isFatal ? '致命错误' : 'JS 错误', msg.slice(0, 1800));
  } catch (e) {
    // Alert 不可用时忽略
  }
  if (originalHandler) originalHandler(error, isFatal);
});

// 延迟加载 App：ErrorUtils 设置完成后再 require，import 阶段的错误也能弹窗显示
let App: React.ComponentType<any>;
try {
  App = require('./App').default;
} catch (e) {
  const err = e instanceof Error ? e : new Error(String(e));
  console.error('APP_IMPORT_ERROR', err);
  try {
    Alert.alert('App 加载失败', `${err.message}\n${err.stack || ''}`.slice(0, 1800));
  } catch {}
  // 提供一个空组件，避免完全白屏无提示
  App = function AppLoadFailed() {
    return null;
  };
}

registerRootComponent(App);
