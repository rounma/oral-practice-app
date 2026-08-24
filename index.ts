import { registerRootComponent } from 'expo';
import { Alert } from 'react-native';

import App from './App';

// 诊断用全局错误捕获：任何 JS 错误都弹窗显示（Release 下默认是白屏，弹窗能直接看到错误）
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

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
