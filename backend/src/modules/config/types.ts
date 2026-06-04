export interface SettingsDTO {
  id: string;
  clinicName: string;
  unit: string | null;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  primaryColor: string;
  radius: string;
  density: string;
  theme: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  appointmentSlotMinutes: number;
  timezone: string;
  updatedAt: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty: string | null;
  color: string | null;
  initials: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Dentist projection used by the agenda/exam dropdowns (mirrors window.DATA dentist). */
export interface DentistDTO {
  id: string;
  name: string;
  spec: string | null; // frontend alias for specialty
  specialty: string | null;
  color: string | null;
  initials: string | null;
}
