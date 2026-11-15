import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type DimensionValue } from 'react-native';

const regions = [
 { name: 'Centro', count: 8, x: '43%', y: '31%', spaces: ['Praça do Artesanato', 'Salão Cultural do Centro'] },
 { name: 'Anjo da Guarda', count: 6, x: '31%', y: '50%', spaces: ['Centro Comunitário do Anjo da Guarda'] },
 { name: 'Cohab', count: 5, x: '78%', y: '40%', spaces: ['Pavilhão da Feira da Cohab'] },
 { name: 'Cidade Operária', count: 3, x: '88%', y: '59%', spaces: ['Praça de Eventos da Cidade Operária'] },
 { name: 'Itaqui-Bacanga', count: 2, x: '22%', y: '65%', spaces: ['Espaço Comunitário do Itaqui-Bacanga'] },
] satisfies { name: string; count: number; x: DimensionValue; y: DimensionValue; spaces: string[] }[];

export function SemmuMap({ onPlanEvent }: { onPlanEvent: (place: string) => void }) {
 const [selectedIndex, setSelectedIndex] = useState(0);
 const region = regions[selectedIndex];

 return (
  <View style={styles.section}>
   <Text style={styles.intro}>Escolha uma região para consultar espaços para feiras e oficinas.</Text>
   <View style={styles.mapCard}>
    <Text style={styles.heading}>São Luís</Text>
    <View style={styles.map}>
     <Image source={require('../docs/mapa-sao-luis-ibge.png')} style={StyleSheet.absoluteFill}
      resizeMode="stretch" accessible={false} />
     {regions.map((item, index) => {
      const selected = selectedIndex === index;
      return (
       <Pressable key={item.name} accessibilityRole="button"
        accessibilityLabel={`Selecionar ${item.name} no mapa`} accessibilityState={{ selected }}
        onPress={() => setSelectedIndex(index)}
        style={[styles.pin, { left: item.x, top: item.y }, selected && styles.selectedPin]}>
        <Text style={[styles.pinText, selected && styles.selectedPinText]}>{index + 1}</Text>
       </Pressable>
      );
     })}
    </View>
    <Text style={styles.caption}>Contorno municipal do IBGE · Marcadores aproximados por região</Text>
   </View>

   <View style={styles.panel}>
    <Text style={styles.heading}>Regiões</Text>
    <Text style={styles.caption}>Contagens fictícias de empreendedoras</Text>
    {regions.map((item, index) => {
     const selected = selectedIndex === index;
     return (
      <Pressable key={item.name} accessibilityRole="button" accessibilityState={{ selected }}
       onPress={() => setSelectedIndex(index)} style={[styles.row, selected && styles.selectedRow]}>
       <Text style={styles.regionName}>{index + 1}. {item.name}</Text>
       <Text style={styles.count}>{item.count}</Text>
      </Pressable>
     );
    })}
   </View>

   <View style={styles.panel}>
    <Text style={styles.heading}>Espaços em {region.name}</Text>
    <Text style={styles.caption}>Locais de demonstração</Text>
    {region.spaces.map(place => (
     <View key={place} style={styles.space}>
      <Text style={styles.regionName}>{place}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Cadastrar evento em ${place}`}
       onPress={() => onPlanEvent(place)} style={styles.action}>
       <Text style={styles.actionText}>Cadastrar evento</Text>
      </Pressable>
     </View>
    ))}
   </View>
  </View>
 );
}

const styles = StyleSheet.create({
 section: { gap: 14 },
 intro: { color: '#212B36', lineHeight: 21 },
 mapCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, gap: 8 },
 heading: { color: '#3D1A4F', fontWeight: '800', fontSize: 18 },
 map: { width: '100%', aspectRatio: 920 / 720, borderRadius: 12, overflow: 'hidden', backgroundColor: '#E7F1F2' },
 caption: { color: '#57515C', fontSize: 13, lineHeight: 18 },
 pin: {
  position: 'absolute', marginLeft: -20, marginTop: -20, width: 40, height: 40,
  alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF',
  borderRadius: 20, backgroundColor: '#80297D',
 },
 selectedPin: { backgroundColor: '#FFE02C', borderColor: '#3D1A4F', zIndex: 1 },
 pinText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
 selectedPinText: { color: '#3D1A4F' },
 panel: { gap: 8, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 16 },
 row: {
  minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  gap: 8, paddingHorizontal: 10, borderRadius: 8,
 },
 selectedRow: { backgroundColor: '#F1E6F2' },
 regionName: { color: '#212B36', fontSize: 15, fontWeight: '700', flexShrink: 1 },
 count: { color: '#80297D', fontSize: 16, fontWeight: '800' },
 space: { gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#EEE8EF' },
 action: {
  alignSelf: 'flex-start', justifyContent: 'center', minHeight: 44, paddingHorizontal: 16,
  borderRadius: 10, backgroundColor: '#80297D',
 },
 actionText: { color: '#FFFFFF', fontWeight: '700' },
});
