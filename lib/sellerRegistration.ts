export const demoEligibilityCodes = ['DEMO-024', 'DEMO-018', 'DEMO-031'];

export const maritalStatuses = ['Solteira', 'Casada', 'União estável', 'Separada', 'Divorciada', 'Viúva', 'Outro'] as const;
export type MaritalStatus = typeof maritalStatuses[number];

export type SellerRegistration = {
 code: string;
 name: string;
 birthDate: string;
 address: string;
 monthlyIncomeCents: number;
 maritalStatus: MaritalStatus;
 dependents: number;
 motherName: string | null;
 fatherName: string | null;
 accessibilityNeed: string | null;
};

export function ageFromBirthDate(input: string, today = new Date()): number | undefined {
 if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return;
 const [day, month, year] = input.split('/').map(Number);
 const birth = new Date(year, month - 1, day);
 if (birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day
  || birth > today) return;

 const birthdayPending = today.getMonth() < month - 1 ||
  (today.getMonth() === month - 1 && today.getDate() < day);
 return today.getFullYear() - year - Number(birthdayPending);
}

export function incomeToCents(input: string): number | undefined {
 const value = input.trim();
 const brazilian = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/;
 const decimalPoint = /^\d+\.\d{1,2}$/;
 if (!brazilian.test(value) && !decimalPoint.test(value)) return;
 const normalized = brazilian.test(value) ? value.replace(/\./g, '').replace(',', '.') : value;
 const cents = Math.round(Number(normalized) * 100);
 return Number.isSafeInteger(cents) ? cents : undefined;
}

export function formatIncome(cents: number) {
 return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}
