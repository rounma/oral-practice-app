import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAudioRecorder, useAudioPlayer } from 'expo-audio';
import { Section } from '../data/content';
import { colors } from '../theme';
import { speakEnglish, stopSpeaking } from '../services/tts';
import { ScoreResult } from '../services/scorer';
import { getRecognizer, WAV_RECORDING_PRESET } from '../services/recognizer';

interface Props {
  section: Section;
  index: number;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onIndexChange: (idx: number) => void;
  onBack: () => void;
}

export default function PracticeScreen({ section, index, favorites, onToggleFavorite, onIndexChange, onBack }: Props) {
  const s = section.sentences[index];
  const [showZh, setShowZh] = useState(true);
  const [recUri, setRecUri] = useState<string | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [engineReady, setEngineReady] = useState<boolean | null>(null);
  const startTimeRef = useRef(0);

  const recorder = useAudioRecorder(WAV_RECORDING_PRESET as any);
  const player = useAudioPlayer(recUri);

  const isFav = favorites.includes(s.id);
  const tag = s.isParagraph ? '背诵段落' : s.isQA ? '问答练习' : s.isKeyTerm ? '术语跟读' : '跟读练习';

  const handleRecord = async () => {
    stopSpeaking();
    setScore(null);
    try {
      await recorder.prepareToRecordAsync();
      startTimeRef.current = Date.now();
      recorder.record();
    } catch (e) {
      console.warn('录音失败', e);
    }
  };

  const handleStop = async () => {
    try {
      await recorder.stop();
      const durSec = (Date.now() - startTimeRef.current) / 1000;
      const uri = recorder.uri;
      if (uri) {
        setRecUri(uri);
        // 尝试识别评分（dev build 环境 whisper.rn 可用时生效）
        runScoring(uri, durSec);
      }
    } catch (e) {
      console.warn('停止录音失败', e);
    }
  };

  const runScoring = async (uri: string, durSec: number) => {
    const recognizer = getRecognizer();
    setEngineReady(recognizer.isAvailable());
    const result = await recognizer.recognize(uri, s.en, durSec);
    setScore(result);
  };

  const playMine = () => {
    if (recUri) {
      player.seekTo(0);
      player.play();
    }
  };

  const prev = () => { stopSpeaking(); setScore(null); onIndexChange(Math.max(0, index - 1)); };
  const next = () => { stopSpeaking(); setScore(null); onIndexChange(Math.min(section.sentences.length - 1, index + 1)); };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>‹ 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tag}</Text>
        <Text style={styles.counter}>{index + 1}/{section.sentences.length}</Text>
        <TouchableOpacity onPress={() => onToggleFavorite(s.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.star, isFav && styles.starOn]}>{isFav ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.enCard}>
          <Text style={styles.enText}>{s.en}</Text>
        </View>

        <TouchableOpacity onPress={() => setShowZh(!showZh)} style={styles.zhRow} activeOpacity={0.7}>
          <Text style={styles.zhText} numberOfLines={4}>
            {showZh ? s.zh : '••• 点击显示中文 •••'}
          </Text>
          <Text style={styles.zhToggle}>{showZh ? '隐藏' : '显示'}</Text>
        </TouchableOpacity>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.ctlBtn} onPress={() => speakEnglish(s.en)} activeOpacity={0.7}>
            <Text style={styles.ctlIcon}>▶</Text>
            <Text style={styles.ctlLabel}>原声</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctlBtn} onPress={recorder.isRecording ? handleStop : handleRecord} activeOpacity={0.7}>
            <Text style={[styles.ctlIcon, recorder.isRecording && styles.recIcon]}>{recorder.isRecording ? '■' : '●'}</Text>
            <Text style={styles.ctlLabel}>{recorder.isRecording ? '停止' : '录音'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ctlBtn, !recUri && styles.ctlBtnDisabled]} onPress={playMine} disabled={!recUri} activeOpacity={0.7}>
            <Text style={styles.ctlIcon}>↺</Text>
            <Text style={styles.ctlLabel}>回放</Text>
          </TouchableOpacity>
        </View>

        {score && (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTotal}>{score.total}</Text>
            <Text style={styles.scoreTotalLabel}>总分</Text>
            <View style={styles.scoreDims}>
              <View style={styles.dim}><Text style={styles.dimVal}>{score.accuracy}</Text><Text style={styles.dimLabel}>准确</Text></View>
              <View style={styles.dim}><Text style={styles.dimVal}>{score.completeness}</Text><Text style={styles.dimLabel}>完整</Text></View>
              <View style={styles.dim}><Text style={styles.dimVal}>{score.fluency}</Text><Text style={styles.dimLabel}>流利</Text></View>
            </View>
            {engineReady === false && (
              <Text style={styles.engineHint}>预览模式：语音识别引擎需 dev build 安装后启用，当前为语速预估分</Text>
            )}
            {score.wrongWords.length > 0 && (
              <Text style={styles.wrongHint}>读得较弱的词：{score.wrongWords.slice(0, 5).join(' / ')}</Text>
            )}
          </View>
        )}

        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={prev} disabled={index === 0} activeOpacity={0.7}>
            <Text style={[styles.navText, index === 0 && styles.navDisabled]}>‹ 上一句</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={next} disabled={index === section.sentences.length - 1} activeOpacity={0.7}>
            <Text style={[styles.navText, index === section.sentences.length - 1 && styles.navDisabled]}>下一句 ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginRight: 10 },
  backText: { color: colors.white, fontSize: 17 },
  headerTitle: { flex: 1, color: colors.white, fontSize: 18, fontWeight: '700' },
  counter: { color: '#9DB2C8', fontSize: 14, marginRight: 12 },
  star: { fontSize: 22, color: '#C4CDD6', paddingHorizontal: 2 },
  starOn: { color: colors.accent },
  body: { flex: 1, padding: 16 },
  enCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  enText: { fontSize: 20, color: colors.text, fontWeight: '600', lineHeight: 30 },
  zhRow: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  zhText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  zhToggle: { fontSize: 12, color: colors.accent, marginLeft: 8 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 22 },
  ctlBtn: { alignItems: 'center', padding: 10, minWidth: 76 },
  ctlBtnDisabled: { opacity: 0.35 },
  ctlIcon: { fontSize: 26, color: colors.primary },
  recIcon: { color: colors.danger },
  ctlLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  scoreCard: {
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  scoreTotal: { fontSize: 44, fontWeight: '800', color: colors.primary },
  scoreTotalLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  scoreDims: { flexDirection: 'row', marginTop: 14, alignSelf: 'stretch' },
  dim: { flex: 1, alignItems: 'center' },
  dimVal: { fontSize: 20, fontWeight: '700', color: colors.primaryLight },
  dimLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  engineHint: { marginTop: 12, fontSize: 11, color: colors.accent, textAlign: 'center' },
  wrongHint: { marginTop: 8, fontSize: 12, color: colors.danger, textAlign: 'center' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  navBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  navText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  navDisabled: { color: '#C4CDD6' },
});
