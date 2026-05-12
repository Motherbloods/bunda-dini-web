import { format, differenceInDays, addDays, differenceInYears } from "date-fns";
import { id } from "date-fns/locale";

export function toDisplay(date) {
  if (!date) return "-";
  return format(new Date(date), "dd MMM yyyy", { locale: id });
}

export function toDisplayWithDay(date) {
  if (!date) return "-";
  return format(new Date(date), "EEEE, dd MMM yyyy", { locale: id });
}

export function toShort(date) {
  if (!date) return "-";
  return format(new Date(date), "dd/MM/yyyy");
}

export function toMonthYear(date) {
  if (!date) return "-";
  return format(new Date(date), "MMM yyyy", { locale: id });
}

export function toTimestamp(date) {
  if (!date) return "-";
  return format(new Date(date), "dd MMM yyyy, HH:mm", { locale: id });
}

export function toFileStamp(date) {
  return format(new Date(date ?? new Date()), "yyyyMMdd");
}

// Hitung usia kehamilan dalam minggu dari HPHT
export function usiaKehamilanMinggu(hpht) {
  if (!hpht) return null;
  const diff = differenceInDays(new Date(), new Date(hpht));
  return Math.floor(diff / 7);
}

// Hitung taksiran persalinan (HPL)
export function taksiranPersalinan(hpht) {
  if (!hpht) return null;
  return addDays(new Date(hpht), 280);
}

// Hitung usia dari tanggal lahir
export function ageFromDate(tglLahir) {
  if (!tglLahir) return "-";
  return `${differenceInYears(new Date(), new Date(tglLahir))} tahun`;
}

export function usiaKehamilanFormatted(hpht) {
  if (!hpht) return null;
  const date = hpht?.toDate?.() ?? new Date(hpht);
  const diff = differenceInDays(new Date(), date);
  const minggu = Math.floor(diff / 7);
  const bulan = Math.floor(minggu / 4.33);

  if (minggu <= 0) return null;
  if (bulan <= 0) return `${minggu} minggu`;
  return `${minggu} minggu (${bulan} bulan)`;
}

export function hplFormatted(hpht) {
  if (!hpht) return null;
  const date = hpht?.toDate?.() ?? new Date(hpht);
  const hpl = addDays(date, 280);
  return format(hpl, "dd MMMM yyyy (EEEE)", { locale: id });
}
