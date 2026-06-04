/** Plan shape returned to the frontend (mirrors window.DATA plan). */
export interface PlanDTO {
  id: string;
  name: string;
  coveragePercent: number;
  coverage: number; // frontend alias
  status: string;
  gracePeriod: string | null;
  carencia: string | null; // frontend alias
  color: string | null;
  serviceCount: number;
  services: number; // frontend alias (count)
  createdAt: string;
  updatedAt: string;
}
