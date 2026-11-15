import { useMemo, useRef, useState } from 'react';
import { Image, Linking, PanResponder, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View, type GestureResponderEvent } from 'react-native';

import pointsByRegion from './semmuMapPoints.json';

const regions = ([
 { name: 'Centro', spaces: ['Praça do Artesanato', 'Salão Cultural do Centro'] },
 { name: 'Anjo da Guarda', spaces: ['Centro Comunitário do Anjo da Guarda'] },
 { name: 'Cohab', spaces: ['Pavilhão da Feira da Cohab'] },
 { name: 'Cidade Operária', spaces: ['Praça de Eventos da Cidade Operária'] },
 { name: 'Itaqui-Bacanga', spaces: ['Espaço Comunitário do Itaqui-Bacanga'] },
] satisfies { name: keyof typeof pointsByRegion; spaces: string[] }[]).map(region => {
 const { entrepreneurs, otherUsers } = pointsByRegion[region.name];
 return {
  ...region,
  count: entrepreneurs.length,
  otherUsers: otherUsers.length,
  dots: [
   ...entrepreneurs.map(([x, y]) => ({ x, y, kind: 'entrepreneur' as const })),
   ...otherUsers.map(([x, y]) => ({ x, y, kind: 'other' as const })),
  ],
 };
});

const zoomLevels = [1, 1.5, 2, 3, 4];
const minZoom = zoomLevels[0];
const maxZoom = zoomLevels[zoomLevels.length - 1];
const initialCamera = { zoom: minZoom, x: 0, y: 0 };

type MapPoint = { x: number; y: number };
type MapCamera = MapPoint & { zoom: number };
type MapGesture = { camera: MapCamera; point: MapPoint; distance: number };
const clampPan = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

function mapSize(viewport: { width: number; height: number }, zoom: number) {
 const scale = Math.min(viewport.width / 1150, viewport.height / 900) * zoom;
 return { width: 1150 * scale, height: 900 * scale };
}

function boundCamera(camera: MapCamera, viewport: { width: number; height: number }): MapCamera {
 const size = mapSize(viewport, camera.zoom);
 return {
  zoom: camera.zoom,
  x: clampPan(camera.x, Math.max(0, (size.width - viewport.width) / 2)),
  y: clampPan(camera.y, Math.max(0, (size.height - viewport.height) / 2)),
 };
}

function gesturePosition(event: GestureResponderEvent, fallback: MapPoint) {
 const [first, second] = event.nativeEvent.touches ?? [];
 if (first && second) {
  return {
   point: { x: (first.pageX + second.pageX) / 2, y: (first.pageY + second.pageY) / 2 },
   distance: Math.max(1, Math.hypot(second.pageX - first.pageX, second.pageY - first.pageY)),
  };
 }
 return { point: first ? { x: first.pageX, y: first.pageY } : fallback, distance: 0 };
}

export function SaoLuisMap({ onGestureChange }: { onGestureChange: (active: boolean) => void }) {
 const { width, height } = useWindowDimensions();
 const [viewport, setViewport] = useState({ width: 0, height: 0 });
 const [camera, setCamera] = useState<MapCamera>(initialCamera);
 const currentCamera = useRef(camera);
 const { zoom, x, y } = boundCamera(camera, viewport);
 const size = mapSize(viewport, zoom);
 const pointDiameter = Math.max(3, Math.min(9, size.width / 165));

 const panResponder = useMemo(() => {
  let start: MapGesture | undefined;
  const finish = () => {
   start = undefined;
   onGestureChange(false);
  };

  return PanResponder.create({
   onStartShouldSetPanResponderCapture: event => event.nativeEvent.touches.length > 1,
   onMoveShouldSetPanResponderCapture: (event, gesture) =>
    event.nativeEvent.touches.length > 1 ||
    (currentCamera.current.zoom > minZoom && Math.hypot(gesture.dx, gesture.dy) > 5),
   onPanResponderGrant: (event, gesture) => {
    start = {
     camera: boundCamera(currentCamera.current, viewport),
     ...gesturePosition(event, { x: gesture.x0, y: gesture.y0 }),
    };
    onGestureChange(true);
   },
   onPanResponderMove: (event, gesture) => {
    const position = gesturePosition(event, { x: gesture.moveX, y: gesture.moveY });
    if (!start || Boolean(position.distance) !== Boolean(start.distance)) {
     start = { camera: currentCamera.current, ...position };
     return;
    }

    const nextZoom = start.distance
     ? Math.min(maxZoom, Math.max(minZoom, start.camera.zoom * position.distance / start.distance))
     : start.camera.zoom;
    const ratio = nextZoom / start.camera.zoom;
    const next = boundCamera({
     zoom: nextZoom,
     x: start.camera.x * ratio + position.point.x - start.point.x,
     y: start.camera.y * ratio + position.point.y - start.point.y,
    }, viewport);
    currentCamera.current = next;
    setCamera(next);
   },
   onPanResponderTerminationRequest: () => false,
   onPanResponderRelease: finish,
   onPanResponderTerminate: finish,
  });
 }, [onGestureChange, viewport]);

 const setMapZoom = (nextZoom: number) => {
  const ratio = nextZoom / zoom;
  const next = boundCamera({ zoom: nextZoom, x: x * ratio, y: y * ratio }, viewport);
  currentCamera.current = next;
  setCamera(next);
 };

 const resetMap = () => {
  currentCamera.current = initialCamera;
  setCamera(initialCamera);
 };
 const zoomOut = zoomLevels.findLast(level => level < zoom) ?? minZoom;
 const zoomIn = zoomLevels.find(level => level > zoom) ?? maxZoom;
 const [selectedIndex, setSelectedIndex] = useState(0);
 const region = regions[selectedIndex];

 return (
  <View style={styles.section}>
   <View style={[styles.mapLayout, width >= 820 && styles.mapLayoutWide]}>
    <View style={styles.mapCard}>
     <View style={styles.mapToolbar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Diminuir zoom"
       disabled={zoom <= minZoom} onPress={() => setMapZoom(zoomOut)}
       style={[styles.zoomButton, zoom <= minZoom && styles.zoomDisabled]}>
       <Text style={styles.zoomSymbol}>−</Text>
      </Pressable>
      <Text style={styles.zoomLevel} accessibilityLiveRegion="polite">{Math.round(zoom * 100)}%</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Aumentar zoom"
       disabled={zoom >= maxZoom} onPress={() => setMapZoom(zoomIn)}
       style={[styles.zoomButton, zoom >= maxZoom && styles.zoomDisabled]}>
       <Text style={styles.zoomSymbol}>+</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={resetMap} style={styles.resetButton}>
       <Text style={styles.sourceLink}>Visão geral</Text>
      </Pressable>
     </View>
     <View style={[styles.map, { height: width >= 820 ? Math.max(520, height * 0.76) : Math.max(320, width * 0.87) }, webTouchStyle]}
      onLayout={({ nativeEvent: { layout } }) => setViewport(previous =>
       previous.width === layout.width && previous.height === layout.height
        ? previous
        : { width: layout.width, height: layout.height })}
      {...panResponder.panHandlers}>
      <View style={[styles.mapCanvas, {
       width: size.width,
       height: size.height,
       left: (viewport.width - size.width) / 2 + x,
       top: (viewport.height - size.height) / 2 + y,
      }]}>
       <Image source={require('../docs/mapa-bairros-sao-luis.png')} style={styles.mapImage}
        resizeMode="stretch" accessible={false} />
       <Image source={require('../docs/mapa-vias-sao-luis.png')} style={[styles.mapImage, styles.streetLayer]}
        resizeMode="stretch" accessible={false} />
       {regions.map((item, index) => (
        <View key={item.name} style={styles.pointLayer}>
         {item.dots.map(({ x, y, kind }) => (
          <Pressable key={x + ',' + y} accessible={false} focusable={false}
           onPress={() => setSelectedIndex(index)}
           style={[
            styles.mapPoint,
            kind === 'entrepreneur' ? styles.redDot : styles.blueDot,
            {
             left: `${x}%`, top: `${y}%`, width: pointDiameter, height: pointDiameter,
             marginLeft: -pointDiameter / 2, marginTop: -pointDiameter / 2,
            },
           ]} />
         ))}
        </View>
       ))}
      </View>
     </View>
     <Text style={styles.caption}>
      Contorno municipal do IBGE · <Text accessibilityRole="link" style={styles.sourceLink}
       onPress={() => Linking.openURL('https://doi.org/10.5281/zenodo.14290787')}>
       38 bairros digitalizados por Francisco Eduardo Almeida-de-Souza (CC BY 4.0)
      </Text>
      {' · '}<Text accessibilityRole="link" style={styles.sourceLink}
       onPress={() => Linking.openURL('https://sites.google.com/semus.saoluis.ma.gov.br/epidemiologia/mapas')}>
       Limites para os pontos: Prefeitura de São Luís (SEMUS)
      </Text>
     </Text>
     <Text style={styles.caption}>
      Vias © <Text accessibilityRole="link" style={styles.sourceLink}
       onPress={() => Linking.openURL('https://www.openstreetmap.org/copyright')}>colaboradores do OpenStreetMap</Text>
      {' · '}<Text accessibilityRole="link" style={styles.sourceLink}
       onPress={() => Linking.openURL('https://openfreemap.org/')}>OpenFreeMap</Text>
      {' · '}<Text accessibilityRole="link" style={styles.sourceLink}
       onPress={() => Linking.openURL('https://openmaptiles.org/')}>OpenMapTiles</Text>
     </Text>
    </View>

    <View style={[styles.panel, width >= 820 && styles.legendWide]}>
     <Text style={styles.heading}>Legenda</Text>
     <View style={styles.legendItem}>
      <View style={[styles.dot, styles.redDot]} />
      <Text style={styles.regionName}>Empreendedoras cadastradas</Text>
     </View>
     <View style={styles.legendItem}>
      <View style={[styles.dot, styles.blueDot]} />
      <Text style={styles.regionName}>Outras pessoas que usam o app</Text>
     </View>
     <Text style={styles.caption}>Cada ponto representa uma pessoa fictícia dentro da região cadastrada.</Text>
     <View style={styles.regionOptions}>
      {regions.map((item, index) => (
       <Pressable key={item.name} accessibilityRole="button"
        accessibilityState={{ selected: index === selectedIndex }}
        onPress={() => setSelectedIndex(index)}
        style={[styles.regionOption, index === selectedIndex && styles.selectedRow]}>
        <Text style={styles.regionName}>{item.name}</Text>
       </Pressable>
      ))}
     </View>
     <View style={styles.regionSummary} accessibilityLiveRegion="polite">
      <Text style={styles.heading}>{region.name}</Text>
      <Text style={styles.intro}>{region.count} empreendedoras · {region.otherUsers} outros usuários</Text>
     </View>
    </View>
   </View>
  </View>
 );
}

export function SemmuMap({ onPlanEvent, onViewMap }: { onPlanEvent: (place: string) => void; onViewMap: () => void }) {
 const [selectedIndex, setSelectedIndex] = useState(0);
 const region = regions[selectedIndex];

 return (
  <View style={styles.section}>
   <Text style={styles.intro}>Escolha uma região para consultar espaços para feiras e oficinas.</Text>
   <Pressable accessibilityRole="button" onPress={onViewMap} style={styles.action}>
    <Text style={styles.actionText}>Ver mapa de São Luís</Text>
   </Pressable>

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

const webTouchStyle = Platform.OS === 'web' ? { overflow: 'hidden' as const, touchAction: 'none' } : undefined;

const styles = StyleSheet.create({
 section: { gap: 14 },
 intro: { color: '#212B36', lineHeight: 21 },
 mapLayout: { gap: 14 },
 mapLayoutWide: { flexDirection: 'row', alignItems: 'flex-start' },
 mapCard: { flex: 1, minWidth: 0, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, gap: 8 },
 legendWide: { width: 248 },
 legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 32 },
 regionSummary: { borderTopWidth: 1, borderTopColor: '#EEE8EF', paddingTop: 12, marginTop: 4, gap: 4 },
 sourceLink: { color: '#80297D', textDecorationLine: 'underline' },
 map: { width: '100%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#DCECF1' },
 mapToolbar: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
 zoomButton: {
  width: 44, height: 44, borderRadius: 10, backgroundColor: '#F1E6F2',
  alignItems: 'center', justifyContent: 'center',
 },
 zoomDisabled: { opacity: 0.45 },
 zoomSymbol: { color: '#3D1A4F', fontSize: 22, fontWeight: '800' },
 zoomLevel: { minWidth: 42, textAlign: 'center', color: '#212B36', fontWeight: '700' },
 resetButton: { paddingHorizontal: 10, minHeight: 44, justifyContent: 'center' },
 mapCanvas: { position: 'absolute' },
 mapImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
 streetLayer: { opacity: 0.78 },
 pointLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'box-none' },
 mapPoint: { position: 'absolute', borderRadius: 10, borderColor: '#FFFFFF', borderWidth: 0.75 },
 regionOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
 regionOption: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8, borderRadius: 8 },
 dot: { borderRadius: 12, width: 12, height: 12 },
 redDot: { backgroundColor: '#B91C34' },
 blueDot: { backgroundColor: '#1754A4' },
 heading: { color: '#3D1A4F', fontWeight: '800', fontSize: 18 },
 caption: { color: '#57515C', fontSize: 13, lineHeight: 18 },
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
