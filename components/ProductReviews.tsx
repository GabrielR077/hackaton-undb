import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export const ratingValues = [1, 2, 3, 4, 5] as const;
export type Rating = typeof ratingValues[number];
export type ProductReview = { authorEmail: string; authorName: string; rating: Rating; comment: string };

export function ProductRating({ reviews }: { reviews: ProductReview[] }) {
 if (!reviews.length) return <Text style={styles.muted}>Sem avaliações</Text>;
 const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
 return (
  <Text style={styles.average} accessibilityLabel={`Nota ${average.toFixed(1)} de 5, ${reviews.length} avaliações`}>
   ★ {average.toFixed(1).replace('.', ',')} ({reviews.length})
  </Text>
 );
}

export function ProductReviews({ reviews, authorEmail, onSave }: {
 reviews: ProductReview[];
 authorEmail: string;
 onSave?: (rating: Rating, comment: string) => void;
}) {
 const existing = reviews.find(review => review.authorEmail === authorEmail);
 const [rating, setRating] = useState<Rating | undefined>(existing?.rating);
 const [comment, setComment] = useState(existing?.comment ?? '');
 const [editing, setEditing] = useState(false);
 const [saved, setSaved] = useState(false);

 return (
  <View style={styles.section}>
   <Text style={styles.heading}>Avaliações</Text>
   <ProductRating reviews={reviews} />
   {onSave && (
    <View style={styles.form}>
     {!editing ? <Pressable accessibilityRole="button" onPress={() => { setEditing(true); setSaved(false); }} style={styles.button}>
      <Text style={styles.buttonText}>{existing ? 'Editar minha avaliação' : 'Avaliar produto'}</Text>
     </Pressable> : <>
      <Text style={styles.muted}>Que nota você dá ao produto?</Text>
      <View style={styles.stars}>
       {ratingValues.map(value => (
        <Pressable key={value} accessibilityRole="button"
         accessibilityLabel={value + (value === 1 ? ' estrela' : ' estrelas')}
         accessibilityState={{ selected: rating === value }} onPress={() => setRating(value)} style={styles.starButton}>
         <Text style={[styles.star, rating && value <= rating && styles.selectedStar]}>
          {rating && value <= rating ? '★' : '☆'}
         </Text>
        </Pressable>
       ))}
      </View>
      <TextInput accessibilityLabel="Comentário opcional" placeholder="Comentário opcional" multiline maxLength={500}
       value={comment} onChangeText={setComment} style={styles.input} />
      <Pressable accessibilityRole="button" disabled={!rating} style={[styles.button, !rating && styles.disabled]}
       onPress={() => {
        if (!rating) return;
        onSave(rating, comment.trim());
        setEditing(false);
        setSaved(true);
       }}>
       <Text style={styles.buttonText}>Salvar avaliação</Text>
      </Pressable>
     </>}
     {saved && <Text accessibilityLiveRegion="polite" style={styles.muted}>Avaliação salva.</Text>}
    </View>
   )}
   {reviews.map(review => (
    <View key={review.authorEmail} style={styles.review}>
     <Text style={styles.author}>{review.authorName}</Text>
     <Text style={styles.average} accessibilityLabel={`${review.rating} de 5 estrelas`}>
      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
     </Text>
     {review.comment !== '' && <Text style={styles.comment}>{review.comment}</Text>}
    </View>
   ))}
  </View>
 );
}

const styles = StyleSheet.create({
 section: { marginTop: 16, gap: 8, borderTopWidth: 1, borderTopColor: '#DED0E0', paddingTop: 14 },
 heading: { fontWeight: '800', fontSize: 17, color: '#212B36' },
 average: { color: '#775407', fontSize: 13, fontWeight: '700' },
 muted: { color: '#61586A', fontSize: 13 },
 form: { gap: 7 },
 stars: { flexDirection: 'row', flexWrap: 'wrap' },
 starButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
 star: { fontSize: 27, color: '#61586A' },
 selectedStar: { color: '#9C6800' },
 input: { minHeight: 74, borderRadius: 10, padding: 11, borderColor: '#DED0E0', borderWidth: 1, backgroundColor: '#FFFFFF', color: '#212B36', textAlignVertical: 'top' },
 button: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#80297D' },
 buttonText: { color: '#FFFFFF', fontWeight: '800' },
 disabled: { opacity: 0.55 },
 review: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, gap: 4 },
 author: { color: '#212B36', fontWeight: '700' },
 comment: { color: '#212B36', lineHeight: 19 },
});
