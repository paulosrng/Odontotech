export interface AppointmentServiceDTO {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number; // effective price (override or service price)
  priceOverride: number | null;
  quantity: number;
}

/** Appointment shape returned to the frontend (mirrors window.DATA appt). */
export interface AppointmentDTO {
  id: string;
  date: string; // YYYY-MM-DD
  hour: number;
  min: number;
  dur: number; // minutes
  durationMin: number;
  datetime: string; // ISO
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  serviceId: string | null;
  serviceName: string | null;
  status: string;
  planName: string | null;
  notes: string | null;
  services?: AppointmentServiceDTO[];
  total?: number;
  createdAt: string;
  updatedAt: string;
}
