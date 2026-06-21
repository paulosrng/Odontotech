export interface ExamFileDTO {
  id: string;
  filename: string;
  originalName: string;
  url: string | null; // short-lived signed URL (null if Storage unavailable)
  path: string; // object path within the Storage bucket
  mimeType: string | null;
  size: number | null;
}

/** Exam shape returned to the frontend (mirrors window.DATA exam). */
export interface ExamDTO {
  id: string;
  patientId: string;
  patientName: string | null;
  dentistId: string | null;
  dentistName: string | null;
  type: string;
  description: string | null;
  notes: string | null;
  date: string; // YYYY-MM-DD
  status: string;
  filePath: string | null;
  files: number; // count, as the frontend expects
  attachments: ExamFileDTO[];
  createdAt: string;
  updatedAt: string;
}
