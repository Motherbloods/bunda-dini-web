// Status ibu
export const ExaminationStatus = {
  NORMAL: "normal",
  PERLU_PERHATIAN: "perlu_perhatian",
  RISIKO_TINGGI: "risiko_tinggi",
};

export const ExaminationStatusLabel = {
  normal: "Normal",
  perlu_perhatian: "Perlu Perhatian",
  risiko_tinggi: "Risiko Tinggi",
};

// Status janin
export const JaninStatus = {
  NORMAL: "normal",
  DJJ_RENDAH: "djj_rendah",
  DJJ_TINGGI: "djj_tinggi",
};

export const JaninStatusLabel = {
  normal: "Normal",
  djj_rendah: "DJJ Rendah",
  djj_tinggi: "DJJ Tinggi",
};

export function hitungBmi(beratKg, tinggiCm) {
  if (!tinggiCm || tinggiCm <= 0) return 0;
  const tinggiM = tinggiCm / 100;
  return beratKg / (tinggiM * tinggiM);
}

export function kategoriBmi(bmi) {
  if (bmi < 18.5) return "Kurus (Kurang Energi)";
  if (bmi < 25.0) return "Normal";
  if (bmi < 30.0) return "Kelebihan Berat";
  return "Obesitas";
}

export function isKek(lila) {
  return lila < 23.5;
}

export function tensiStatus(sistolik, diastolik) {
  if (sistolik >= 140 || diastolik >= 90)
    return { label: "🔴 Hipertensi", color: "danger" };
  if (sistolik < 90 || diastolik < 60)
    return { label: "⚠️ Hipotensi", color: "warning" };
  return { label: "✅ Normal", color: "success" };
}

export function djjStatus(djj) {
  if (djj < 110)
    return { label: "🔴 DJJ Rendah — Segera konsultasi", color: "danger" };
  if (djj > 160)
    return { label: "🔴 DJJ Tinggi — Segera konsultasi", color: "danger" };
  return { label: "✅ DJJ Normal (110–160 bpm)", color: "success" };
}

export function evaluate({
  sistolik,
  diastolik,
  beratBadan,
  tinggiBadan,
  lingkarLengan,
  lingkarPerut,
  bmi,
  djj,
  rules,
}) {
  let statusIbu = ExaminationStatus.NORMAL;
  let statusJanin = JaninStatus.NORMAL;
  const rekomendasi = [];
  const ruleTriggered = [];

  const fieldValues = {
    sistolik: sistolik,
    diastolik: diastolik,
    djj: djj,
    lingkar_lengan: lingkarLengan,
    bmi: bmi,
    berat_badan: beratBadan,
  };

  for (const rule of rules) {
    if (!rule.aktif) continue;
    const val = fieldValues[rule.kondisiField];
    if (val === undefined || val === null) continue;

    let triggered = false;
    switch (rule.kondisiOperator) {
      case ">":
        triggered = val > rule.kondisiValue;
        break;
      case "<":
        triggered = val < rule.kondisiValue;
        break;
      case ">=":
        triggered = val >= rule.kondisiValue;
        break;
      case "<=":
        triggered = val <= rule.kondisiValue;
        break;
      case "==":
        triggered = val === rule.kondisiValue;
        break;
    }

    if (triggered) {
      rekomendasi.push(rule.rekomendasi);
      ruleTriggered.push(rule.id);

      if (rule.severity === "danger") {
        statusIbu = ExaminationStatus.RISIKO_TINGGI;
      } else if (
        rule.severity === "warning" &&
        statusIbu === ExaminationStatus.NORMAL
      ) {
        statusIbu = ExaminationStatus.PERLU_PERHATIAN;
      }

      if (rule.kondisiField === "djj") {
        statusJanin =
          djj < 110 ? JaninStatus.DJJ_RENDAH : JaninStatus.DJJ_TINGGI;
      }
    }
  }

  if (rekomendasi.length === 0) {
    rekomendasi.push(
      "Hasil pemeriksaan normal. Pertahankan pola hidup sehat dan rutin kontrol kehamilan.",
    );
  }

  return { statusIbu, statusJanin, rekomendasi, ruleTriggered };
}
