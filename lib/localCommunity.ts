import type { SellerRegistration } from './sellerRegistration';
import { getRandomBytesAsync } from 'expo-crypto';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';

export type User = {
 email: string;
 name: string;
 role: 'publico' | 'empreendedora' | 'admin';
 company?: boolean;
 documentLastFour?: string;
};

type PasswordVerifier = { salt: string; digest: string };
export type LocalAccount = User & { passwordVerifier: PasswordVerifier };
export type Message = { sender: string; text: string };
export type PartnershipStatus = 'pendente' | 'aprovada' | 'em execução' | 'concluída' | 'recusada';
export type PartnershipRequest = {
 id: string;
 email: string;
 companyName: string;
 proposal: string;
 status: PartnershipStatus;
};

export type Community = {
 accounts: LocalAccount[];
 deletedDemoEmails: string[];
 conversations: Record<string, Message[]>;
 partnerships: PartnershipRequest[];
 sellerRegistrations: SellerRegistration[];
};

export const demoPassword = 'firmina123';
export const adminAccount = { email: 'semmu@firmina.app', name: 'Equipe SEMMU', role: 'admin' } as const;
export const legacyAdminEmail = 'cramsv@firmina.app';
export const demoUsers: readonly User[] = [
 { email: 'compradora@firmina.app', name: 'Mariana Lima', role: 'publico' },
 { email: 'iema@firmina.app', name: 'IEMA', role: 'publico', company: true },
 { email: 'empreendedora@firmina.app', name: 'Ana Nascimento', role: 'empreendedora' },
 { email: 'rita@firmina.app', name: 'Rita Costa', role: 'empreendedora' },
 { email: 'lucia@firmina.app', name: 'Lúcia Santos', role: 'empreendedora' },
 adminAccount,
];

export function conversationKey(firstEmail: string, secondEmail: string) {
 return JSON.stringify([firstEmail, secondEmail].sort());
}

export const initialCommunity: Community = {
 accounts: [],
 sellerRegistrations: [],
 deletedDemoEmails: [],
 conversations: {
  [conversationKey('compradora@firmina.app', 'empreendedora@firmina.app')]: [
   { sender: 'compradora@firmina.app', text: 'Olá! Gostaria de saber mais sobre seus produtos.' },
  ],
 },
 partnerships: [
  { id: 'demo-mateus', email: '', companyName: 'Grupo Mateus', proposal: 'Feira de economia criativa', status: 'pendente' },
  { id: 'demo-shopping', email: '', companyName: 'Shopping da Ilha', proposal: 'Exposição de artesanato', status: 'pendente' },
 ],
};

export const partnershipLabels: Record<PartnershipStatus, string> = {
 pendente: 'Aguardando análise da SEMMU',
 aprovada: 'Proposta aprovada',
 'em execução': 'Parceria em execução',
 concluída: 'Parceria concluída',
 recusada: 'Proposta recusada',
};

export const partnershipActions: Record<PartnershipStatus, { label: string; status: PartnershipStatus }[]> = {
 pendente: [{ label: 'Aprovar proposta', status: 'aprovada' }, { label: 'Recusar proposta', status: 'recusada' }],
 aprovada: [{ label: 'Iniciar execução', status: 'em execução' }],
 'em execução': [{ label: 'Concluir parceria', status: 'concluída' }],
 concluída: [],
 recusada: [],
};

export function deleteLocalAccount(community: Community, email: string): Community {
 return {
  ...community,
  accounts: community.accounts.filter(account => account.email !== email),
  deletedDemoEmails: demoUsers.some(account => account.email === email)
   ? [...new Set([...community.deletedDemoEmails, email])]
   : community.deletedDemoEmails,
  conversations: Object.fromEntries(Object.entries(community.conversations).filter(([key]) =>
   !(JSON.parse(key) as string[]).includes(email))),
  partnerships: community.partnerships.filter(request => request.email !== email),
 };
}

function cpfDigit(base: string) {
 const total = Array.from(base).reduce((sum, digit, index) => sum + Number(digit) * (base.length + 1 - index), 0);
 const digit = (total * 10) % 11;
 return digit === 10 ? 0 : digit;
}

function cnpjDigit(base: string) {
 const total = Array.from(base).reduce((sum, character, index) =>
  sum + (character.charCodeAt(0) - 48) * (2 + (base.length - 1 - index) % 8), 0);
 const remainder = total % 11;
 return remainder < 2 ? 0 : 11 - remainder;
}

export function validDocument(input: string, company: boolean): string | undefined {
 const value = input.trim().toUpperCase().replace(/[./\-\s]/g, '');
 if (/^(.)\1+$/.test(value)) return;

 if (company) {
  if (!/^[A-Z0-9]{12}[0-9]{2}$/.test(value)) return;
  const first = cnpjDigit(value.slice(0, 12));
  const second = cnpjDigit(value.slice(0, 12) + first);
  return value.slice(-2) === String(first) + second ? value : undefined;
 }

 if (!/^\d{11}$/.test(value)) return;
 const first = cpfDigit(value.slice(0, 9));
 const second = cpfDigit(value.slice(0, 9) + first);
 return value.slice(-2) === String(first) + second ? value : undefined;
}

async function derivePassword(password: string, salt: Uint8Array) {
 return bytesToHex(await pbkdf2Async(sha256, password, salt, { c: 600_000, dkLen: 32 }));
}

export async function createPasswordVerifier(password: string): Promise<PasswordVerifier> {
 const salt = await getRandomBytesAsync(16);
 return { salt: bytesToHex(salt), digest: await derivePassword(password, salt) };
}

export async function verifyPassword(password: string, verifier: PasswordVerifier) {
 const digest = await derivePassword(password, hexToBytes(verifier.salt));
 return digest === verifier.digest;
}
