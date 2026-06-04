/** Patient shape returned to the frontend (mirrors window.DATA patient). */
export interface PatientDTO {
  id: string;
  name: string;
  cpf: string;
  rg: string | null;
  birth: string; // YYYY-MM-DD
  birthdate: string; // ISO
  age: number;
  gender: string | null;
  phone: string;
  email: string | null;
  cep: string | null;
  address: string | null;
  city: string | null;
  uf: string | null;
  status: string;
  planId: string | null;
  planName: string | null;
  allergies: string[];
  conditions: string[];
  observations: string | null;
  obs: string | null; // frontend alias
  isMinor: boolean;
  responsible: string | null; // frontend alias
  responsibleParty: string | null;
  responsiblePhone: string | null;
  lastVisit: string | null;
  nextVisit: string | null;
  consultations: number;
  createdAt: string;
  updatedAt: string;
}
