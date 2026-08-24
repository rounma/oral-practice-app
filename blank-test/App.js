import { registerRootComponent } from 'expo';
import { StyleSheet, Text, View } from 'react-native';

function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Blank Test OK</Text>
      <Text style={styles.sub}>如果看到这行字，说明构建+签名流程正常</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  sub: { fontSize: 14, color: '#666', marginTop: 12 },
});

registerRootComponent(App);
