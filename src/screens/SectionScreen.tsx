import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Section } from '../data/content';
import { colors } from '../theme';

interface Props {
  section: Section;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onPractice: (sectionId: string, index: number) => void;
  onBack: () => void;
}

export default function SectionScreen({ section, favorites, onToggleFavorite, onPractice, onBack }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>‹ 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{section.title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {section.sentences.map((s, idx) => {
          const isFav = favorites.includes(s.id);
          const tag = s.isParagraph ? '背诵段' : s.isQA ? '问答' : s.isKeyTerm ? '术语' : '';
          return (
            <TouchableOpacity
              key={s.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => onPractice(section.id, idx)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardEn} numberOfLines={3}>{s.en}</Text>
                <TouchableOpacity
                  onPress={() => onToggleFavorite(s.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.star, isFav && styles.starOn]}>{isFav ? '★' : '☆'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardZh} numberOfLines={3}>{s.zh}</Text>
              {tag ? <View style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View> : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  backBtn: { marginRight: 12 },
  backText: { color: colors.white, fontSize: 17 },
  headerTitle: { color: colors.white, fontSize: 19, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardEn: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '500', lineHeight: 23 },
  star: { fontSize: 20, color: '#C4CDD6', marginLeft: 8, paddingHorizontal: 2 },
  starOn: { color: colors.accent },
  cardZh: { fontSize: 13, color: colors.textSecondary, marginTop: 8, lineHeight: 19 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 8,
  },
  tagText: { color: colors.white, fontSize: 10 },
});
