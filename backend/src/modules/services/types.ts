/** Service shape returned to the frontend (mirrors window.DATA service). */
export interface ServiceDTO {
  id: string;
  name: string;
  description: string | null;
  desc: string | null; // frontend alias
  price: number;
  duration: number;
  dur: number; // frontend alias
  category: string;
  cat: string; // frontend alias
  createdAt: string;
  updatedAt: string;
}
