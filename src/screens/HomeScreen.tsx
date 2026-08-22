import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SECTIONS } from '../data/content';
import { colors } from '../theme';

interface Props {
  onOpenSection: (sectionId: string) => void;
}

export default function HomeScreen({ onOpenSection }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.appTitle}>接待口语陪练</Text>
        <Text style={styles.appSub}>奶牛智慧健康管理系统 · 外宾接待英文话术</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => onOpenSection(s.id)}
          >
            <View style={styles.cardAccent} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.cardSub}>{s.subtitle}</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{s.sentences.length}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 64,
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  appTitle: { color: colors.white, fontSize: 24, fontWeight: '700' },
  appSub: { color: '#9DB2C8', fontSize: 13, marginTop: 6 },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardAccent: { width: 5, alignSelf: 'stretch', backgroundColor: colors.accent },
  cardBody: { flex: 1, paddingVertical: 16, paddingHorizontal: 14 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  countBadge: {
    marginRight: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  countText: { color: colors.white, fontSize: 12, fontWeight: '600' },
});
