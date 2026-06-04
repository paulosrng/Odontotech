/** Format a Date as "YYYY-MM-DD" (local-ish, used by the calendar frontend). */
export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function calcAge(birthdate: Date, ref = new Date()): number {
  let age = ref.getFullYear() - birthdate.getFullYear();
  const m = ref.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birthdate.getDate())) age--;
  return Math.max(0, age);
}

/** Split a Date into { date, hour, min } as used by the agenda frontend. */
export function splitDateTime(d: Date): { date: string; hour: number; min: number } {
  return { date: toDateString(d), hour: d.getHours(), min: d.getMinutes() };
}

/** Parse a "YYYY-MM-DD" string as a LOCAL date (noon) to avoid UTC off-by-one shifts. */
export function parseYmdLocal(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

/** Combine a "YYYY-MM-DD" date and "HH:mm" time into a Date. */
export function combineDateTime(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0, 0, 0);
}
