import type { ImageSourcePropType } from 'react-native';

type ProductWithImage = {
 id?: string;
 name: string;
 owner: string;
 image?: string | ImageSourcePropType;
};

const demoPhotos = [
 { id: 'demo-bolsa', name: 'Bolsa de palha trançada', owner: 'Maria Firmina', source: require('../docs/bolsa de palha.jpeg') },
 { id: 'demo-bolo', name: 'Bolo de macaxeira', owner: 'Rita Costa', source: require('../docs/foto bolo de macaxeira.jpg') },
 { id: 'demo-colares', name: 'Colares de sementes', owner: 'Lúcia Santos', source: require('../docs/colar de semente.jpeg') },
];

export function productImageSource(product: ProductWithImage): ImageSourcePropType | undefined {
 // Resolve bundled assets at render time: saved module IDs can change between builds.
 const demo = demoPhotos.find(item => item.id === product.id ||
  ((!product.id || product.id.startsWith('legacy-')) && item.name === product.name && item.owner === product.owner));
 if (demo) return demo.source;
 return typeof product.image === 'string' ? { uri: product.image } : product.image;
}
