import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import {
 ageFromBirthDate, demoEligibilityCodes, formatIncome, incomeToCents, maritalStatuses,
 type MaritalStatus, type SellerRegistration,
} from '../lib/sellerRegistration';

type FormProps = {
 initial: SellerRegistration | null;
 busy: boolean;
 onSave: (registration: SellerRegistration) => void;
};

function Field({ label, ...props }: TextInputProps & { label: string }) {
 return (
  <View style={styles.field}>
   <Text style={styles.label}>{label}</Text>
   <TextInput style={styles.input} accessibilityLabel={label} {...props} />
  </View>
 );
}

function ParentField({ label, value, onChange }: {
 label: string;
 value: string | null;
 onChange: (value: string | null) => void;
}) {
 return (
  <View style={styles.field}>
   <View style={styles.parentHeader}>
    <Text style={[styles.label, styles.parentLabel]}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={label + ': Não informar'}
     accessibilityState={{ selected: value === null }}
     onPress={() => onChange(value === null ? '' : null)}
     style={[styles.smallChoice, value === null && styles.selected]}>
     <Text style={styles.smallChoiceText}>Não informar</Text>
    </Pressable>
   </View>
   {value !== null && <TextInput accessibilityLabel={label} value={value} onChangeText={onChange}
    autoCapitalize="words" maxLength={120} style={styles.input} />}
  </View>
 );
}

export function SellerRegistrationForm({ initial, busy, onSave }: FormProps) {
 const [code, setCode] = useState(initial?.code ?? '');
 const [name, setName] = useState(initial?.name ?? '');
 const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '');
 const [address, setAddress] = useState(initial?.address ?? '');
 const [income, setIncome] = useState(initial ? (initial.monthlyIncomeCents / 100).toFixed(2).replace('.', ',') : '');
 const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | undefined>(initial?.maritalStatus);
 const [dependents, setDependents] = useState(initial ? String(initial.dependents) : '');
 const [motherName, setMotherName] = useState<string | null>(initial ? initial.motherName : '');
 const [fatherName, setFatherName] = useState<string | null>(initial ? initial.fatherName : '');
 const [needsSupport, setNeedsSupport] = useState<boolean | undefined>(initial ? initial.accessibilityNeed !== null : undefined);
 const [accessibilityNeed, setAccessibilityNeed] = useState(initial?.accessibilityNeed ?? '');
 const [error, setError] = useState('');
 const age = ageFromBirthDate(birthDate);

 const save = () => {
  const normalizedCode = code.trim().toUpperCase();
  const monthlyIncomeCents = incomeToCents(income);
  if (!demoEligibilityCodes.includes(normalizedCode)) {
   setError('Informe um código de elegibilidade válido.');
   return;
  }
  if (!name.trim() || !address.trim()) {
   setError('Preencha o nome completo e o endereço.');
   return;
  }
  if (age === undefined) {
   setError('Informe uma data de nascimento válida no formato DD/MM/AAAA.');
   return;
  }
  if (monthlyIncomeCents === undefined || !/^\d+$/.test(dependents) || !maritalStatus) {
   setError('Confira a renda mensal, o número de dependentes e o estado civil.');
   return;
  }
  if (motherName?.trim() === '' || fatherName?.trim() === '') {
   setError('Preencha o nome da mãe e do pai ou selecione Não informar.');
   return;
  }
  if (needsSupport === undefined || (needsSupport && !accessibilityNeed.trim())) {
   setError('Informe se há alguma necessidade especial e descreva qual, se aplicável.');
   return;
  }
  setError('');
  onSave({
   code: normalizedCode, name: name.trim(), birthDate, address: address.trim(), monthlyIncomeCents, maritalStatus,
   dependents: Number(dependents), motherName: motherName?.trim() ?? null, fatherName: fatherName?.trim() ?? null,
   accessibilityNeed: needsSupport ? accessibilityNeed.trim() : null,
  });
 };

 return (
  <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
   <Text style={styles.caption}>Use dados fictícios neste protótipo.</Text>
   {!initial && <>
    <Field label="Código de elegibilidade" value={code} onChangeText={setCode} placeholder="DEMO-024"
     autoCapitalize="characters" autoCorrect={false} maxLength={16} />
    <Text style={styles.caption}>{demoEligibilityCodes.join(' · ')}</Text>
   </>}
   <Field label="Nome completo" value={name} onChangeText={setName} autoCapitalize="words" maxLength={120} />
   <Field label="Nascimento" value={birthDate} onChangeText={setBirthDate} placeholder="DD/MM/AAAA" maxLength={10} />
   <Field label="Idade" value={age === undefined ? '' : String(age)} placeholder="Calculada pelo nascimento" editable={false} />
   <Field label="Endereço" value={address} onChangeText={setAddress} autoCapitalize="sentences" multiline maxLength={240} />
   <Field label="Renda mensal da empreendedora (R$)" value={income} onChangeText={setIncome}
    placeholder="0,00" keyboardType="decimal-pad" maxLength={18} />
   <View style={styles.field}>
    <Text style={styles.label}>Estado civil</Text>
    <View style={styles.options}>
     {maritalStatuses.map(status => (
      <Pressable key={status} accessibilityRole="radio" accessibilityState={{ checked: maritalStatus === status }}
       onPress={() => setMaritalStatus(status)} style={[styles.option, maritalStatus === status && styles.selected]}>
       <Text style={styles.optionText}>{status}</Text>
      </Pressable>
     ))}
    </View>
   </View>
   <Field label="Número de dependentes" value={dependents} onChangeText={setDependents} keyboardType="number-pad" maxLength={3} />
   <ParentField label="Nome completo da mãe" value={motherName} onChange={setMotherName} />
   <ParentField label="Nome completo do pai" value={fatherName} onChange={setFatherName} />
   <View style={styles.field}>
    <Text style={styles.label}>Possui alguma necessidade especial?</Text>
    <View style={styles.options}>
     {[true, false].map(option => (
      <Pressable key={String(option)} accessibilityRole="radio" accessibilityState={{ checked: needsSupport === option }}
       onPress={() => setNeedsSupport(option)} style={[styles.option, needsSupport === option && styles.selected]}>
       <Text style={styles.optionText}>{option ? 'Sim' : 'Não'}</Text>
      </Pressable>
     ))}
    </View>
   </View>
   {needsSupport && <Field label="Qual?" value={accessibilityNeed} onChangeText={setAccessibilityNeed}
    multiline maxLength={240} />}
   {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
   <Pressable accessibilityRole="button" disabled={busy} onPress={save} style={[styles.save, busy && styles.disabled]}>
    <Text style={styles.saveText}>{busy ? 'Salvando…' : initial ? 'Salvar alterações' : 'Validar e cadastrar'}</Text>
   </Pressable>
  </ScrollView>
 );
}

export function SellerRegistrationDetails({ registration }: { registration: SellerRegistration }) {
 const age = ageFromBirthDate(registration.birthDate);
 return (
  <View style={styles.details}>
   <Text style={styles.caption}>Nascimento: {registration.birthDate} · {age} anos</Text>
   <Text style={styles.caption}>Endereço: {registration.address}</Text>
   <Text style={styles.caption}>Renda mensal: {formatIncome(registration.monthlyIncomeCents)}</Text>
   <Text style={styles.caption}>Estado civil: {registration.maritalStatus}</Text>
   <Text style={styles.caption}>Dependentes: {registration.dependents}</Text>
   <Text style={styles.caption}>Mãe: {registration.motherName ?? 'Não informado'}</Text>
   <Text style={styles.caption}>Pai: {registration.fatherName ?? 'Não informado'}</Text>
   <Text style={styles.caption}>Necessidade especial: {registration.accessibilityNeed ?? 'Não'}</Text>
  </View>
 );
}

const styles = StyleSheet.create({
 form: { gap: 14, paddingBottom: 8 },
 field: { gap: 5 },
 label: { color: '#212B36', fontWeight: '700', fontSize: 14 },
 parentLabel: { flex: 1 },
 input: { minHeight: 44, padding: 11, borderRadius: 10, borderWidth: 1, borderColor: '#DED0E0', color: '#212B36', backgroundColor: '#FFFFFF' },
 caption: { color: '#605465', fontSize: 13, lineHeight: 20 },
 parentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
 options: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
 option: { paddingHorizontal: 12, justifyContent: 'center', minHeight: 44, borderWidth: 1, borderColor: '#DED0E0', borderRadius: 10, backgroundColor: '#FFFFFF' },
 smallChoice: { paddingHorizontal: 8, justifyContent: 'center', minHeight: 32, borderRadius: 8, borderWidth: 1, borderColor: '#DED0E0', backgroundColor: '#FFFFFF' },
 smallChoiceText: { color: '#3D1A4F', fontSize: 12, fontWeight: '700' },
 optionText: { color: '#3D1A4F', fontWeight: '700' },
 selected: { backgroundColor: '#F1E6F2', borderColor: '#80297D' },
 error: { color: '#A32235', fontSize: 14 },
 save: { alignItems: 'center', justifyContent: 'center', minHeight: 46, borderRadius: 12, backgroundColor: '#80297D', paddingHorizontal: 12 },
 saveText: { color: '#FFFFFF', fontWeight: '800' },
 disabled: { opacity: 0.5 },
 details: { gap: 5, paddingVertical: 8 },
});
