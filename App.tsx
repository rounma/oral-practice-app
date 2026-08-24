import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SECTIONS } from './src/data/content';
import { log } from './src/services/logger';
import HomeScreen from './src/screens/HomeScreen';
import SectionScreen from './src/screens/SectionScreen';
import PracticeScreen from './src/screens/PracticeScreen';

const FAV_KEY = 'oral_favorites_v1';

type Route =
  | { name: 'home' }
  | { name: 'section'; sectionId: string }
  | { name: 'practice'; sectionId: string; index: number };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    log.info('App 启动');
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(FAV_KEY);
        if (raw) setFavorites(JSON.parse(raw));
        log.info('收藏加载完成: ' + (raw ? raw.length + ' 字符' : '空'));
      } catch (e) {
        log.error('加载收藏失败: ' + String(e));
      }
      setReady(true);
    })();
  }, []);

  const openSection = useCallback((sectionId: string) => {
    log.info(`进入列表页: ${sectionId}`);
    setRoute({ name: 'section', sectionId });
  }, []);

  const openPractice = useCallback((sectionId: string, index: number) => {
    log.info(`进入练习页: ${sectionId} #${index + 1}`);
    setRoute({ name: 'practice', sectionId, index });
  }, []);

  const goHome = useCallback(() => {
    log.info('返回首页');
    setRoute({ name: 'home' });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      AsyncStorage.setItem(FAV_KEY, JSON.stringify(next)).catch((e) => console.warn('保存收藏失败', e));
      return next;
    });
  }, []);

  if (!ready) return null;

  if (route.name === 'home') {
    return <HomeScreen onOpenSection={openSection} />;
  }

  const section = SECTIONS.find((s) => s.id === route.sectionId)!;

  if (route.name === 'section') {
    return (
      <SectionScreen
        section={section}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onPractice={openPractice}
        onBack={goHome}
      />
    );
  }

  return (
    <PracticeScreen
      section={section}
      index={route.index}
      favorites={favorites}
      onToggleFavorite={toggleFavorite}
      onIndexChange={(idx) => {
        log.info(`切换句子: ${route.sectionId} #${idx + 1}`);
        setRoute({ name: 'practice', sectionId: route.sectionId, index: idx });
      }}
      onBack={() => setRoute({ name: 'section', sectionId: route.sectionId })}
    />
  );
}
