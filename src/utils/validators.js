export const required =
  (label = "Field ini") =>
  (v) =>
    v && String(v).trim() !== "" ? true : `${label} wajib diisi`;

export const nik = (v) => {
  if (!v || v.trim() === "") return "NIK wajib diisi";
  if (!/^\d{16}$/.test(v.trim())) return "NIK harus 16 digit angka";
  return true;
};

export const email = (v) => {
  if (!v || v.trim() === "") return "Email wajib diisi";
  if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v.trim()))
    return "Format email tidak valid";
  return true;
};

export const password = (v) => {
  if (!v || v === "") return "Kata sandi wajib diisi";
  if (v.length < 6) return "Kata sandi minimal 6 karakter";
  return true;
};

export const noHp = (v) => {
  if (!v || v.trim() === "") return "Nomor HP wajib diisi";
  const clean = v.replace(/[\s-]/g, "");
  if (!/^(\+62|62|0)[0-9]{8,12}$/.test(clean))
    return "Format nomor HP tidak valid";
  return true;
};

export const intRange = (min, max, label) => (v) => {
  if (!v && v !== 0) return `${label} wajib diisi`;
  const n = parseInt(v);
  if (isNaN(n)) return `${label} harus angka`;
  if (n < min || n > max) return `${label} harus antara ${min}–${max}`;
  return true;
};

export const floatRange = (min, max, label) => (v) => {
  if (!v && v !== 0) return `${label} wajib diisi`;
  const n = parseFloat(String(v).replace(",", "."));
  if (isNaN(n)) return `${label} harus angka`;
  if (n < min || n > max) return `${label} harus antara ${min}–${max}`;
  return true;
};
export const notFutureDate =
  (label = "Tanggal") =>
  (value) => {
    if (!value) return true;

    const selected = new Date(value);
    const today = new Date();

    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selected <= today || `${label} tidak boleh lebih dari hari ini`;
  };

// Shortcut untuk form pemeriksaan
export const sistolik = intRange(60, 250, "Sistolik");
export const diastolik = intRange(40, 180, "Diastolik");
export const djj = intRange(50, 200, "DJJ");
export const beratBadan = floatRange(20, 200, "Berat badan");
export const tinggiBadan = floatRange(100, 250, "Tinggi badan");
export const lingkarLengan = floatRange(10, 50, "LILA");
export const usiaKehamilan = intRange(1, 45, "Usia kehamilan");
