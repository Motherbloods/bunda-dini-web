import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toDisplay, toDisplayWithDay } from "./dateFormatter";
import { kategoriBmi } from "./ruleEngine";

export async function generatePdf({ exam, patient, bidanNama = "" }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const RED = [198, 40, 40];
  const GREY = [117, 117, 117];
  const DARK = [33, 33, 33];
  const LIGHT = [245, 245, 245];
  const WHITE = [255, 255, 255];

  const tanggal =
    exam.tanggal?.toDate?.() ?? new Date(exam.tanggal?.seconds * 1000);
  const hpht =
    patient?.hpht?.toDate?.() ??
    (patient?.hpht ? new Date(patient.hpht) : null);

  doc.setFillColor(...RED);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("LAPORAN PEMERIKSAAN IBU HAMIL", 105, 18, { align: "center" });
  doc.setFontSize(9);
  doc.text(`Tanggal Cetak: ${toDisplay(new Date())}`, 105, 24, {
    align: "center",
  });

  let y = 35;

  doc.setFillColor(...RED);
  doc.rect(10, y, 190, 7, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DATA IBU HAMIL", 14, y + 4.8);
  y += 10;

  const patientRows = [
    ["Nama", patient?.nama ?? "-"],
    ["NIK", patient?.nik ?? "-"],
    [
      "Tanggal Lahir",
      patient?.tanggalLahir
        ? toDisplay(
            patient.tanggalLahir?.toDate?.() ?? new Date(patient.tanggalLahir),
          )
        : "-",
    ],
    ["Golongan Darah", patient?.golonganDarah ?? "-"],
    ["Nomor HP", patient?.noHp ?? "-"],
    ["HPHT", hpht ? toDisplay(hpht) : "Belum diisi"],
    ["Alamat", patient?.alamat ?? "-"],
  ];

  autoTable(doc, {
    startY: y,
    body: patientRows,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5, textColor: DARK },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: LIGHT, cellWidth: 45 },
      1: { cellWidth: 145 },
    },
    margin: { left: 10, right: 10 },
  });
  y = doc.lastAutoTable.finalY + 6;

  doc.setFillColor(...RED);
  doc.rect(10, y, 190, 7, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("HASIL PEMERIKSAAN", 14, y + 4.8);
  y += 10;

  const examRows = [
    ["Tanggal", toDisplayWithDay(tanggal)],
    ["Usia Kehamilan", `${exam.usiaKehamilan} minggu`],
    ["Sistolik", `${exam.sistolik} mmHg`],
    ["Diastolik", `${exam.diastolik} mmHg`],
    [
      "Berat Badan",
      `${exam.beratBadan} kg${exam.kenaikanBb !== 0 ? ` (${exam.kenaikanBb >= 0 ? "+" : ""}${exam.kenaikanBb?.toFixed(1)} kg)` : ""}`,
    ],
    ["Tinggi Badan", `${exam.tinggiBadan} cm`],
    [
      "LILA",
      `${exam.lingkarLengan} cm${exam.lingkarLengan < 23.5 ? " — KEK" : " — Normal"}`,
    ],
    ["BMI", `${exam.bmi?.toFixed(1)} — ${kategoriBmi(exam.bmi)}`],
    ["DJJ", `${exam.djj} bpm`],
    ["Keluhan Ibu", exam.keluhanIbu ?? "-"],
    ["Catatan Kader", exam.catatanKader ?? "-"],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Parameter", "Nilai"]],
    body: examRows,
    theme: "grid",
    headStyles: {
      fillColor: RED,
      textColor: WHITE,
      fontSize: 9,
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 2.5, textColor: DARK },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: LIGHT, cellWidth: 50 },
      1: { cellWidth: 140 },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { left: 10, right: 10 },
  });
  y = doc.lastAutoTable.finalY + 6;

  doc.setFillColor(...RED);
  doc.rect(10, y, 190, 7, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("KESIMPULAN", 14, y + 4.8);
  y += 10;

  autoTable(doc, {
    startY: y,
    body: [
      [
        "Kondisi Ibu",
        exam.statusIbu === "risiko_tinggi"
          ? "Risiko Tinggi"
          : exam.statusIbu === "perlu_perhatian"
            ? "Perlu Perhatian"
            : "Normal",
      ],
      [
        "Kondisi Janin",
        exam.statusJanin === "djj_rendah"
          ? "DJJ Rendah"
          : exam.statusJanin === "djj_tinggi"
            ? "DJJ Tinggi"
            : "Normal",
      ],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3, textColor: DARK },
    columnStyles: { 0: { fontStyle: "bold", fillColor: LIGHT, cellWidth: 50 } },
    margin: { left: 10, right: 10 },
  });
  y = doc.lastAutoTable.finalY + 6;

  doc.setFillColor(...RED);
  doc.rect(10, y, 190, 7, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("REKOMENDASI", 14, y + 4.8);
  y += 10;

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setFillColor(...LIGHT);
  doc.rect(10, y, 190, (exam.rekomendasi?.length ?? 1) * 7 + 6, "F");
  exam.rekomendasi?.forEach((r, i) => {
    doc.text(`• ${r}`, 14, y + 5 + i * 7, { maxWidth: 183 });
  });
  y += (exam.rekomendasi?.length ?? 1) * 7 + 10;

  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  doc.setTextColor(...GREY);
  doc.setFontSize(9);
  doc.text("Diperiksa oleh:", 14, y);
  doc.text("Mengetahui, Bidan Pendamping", 140, y);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text(exam.kaderNama ?? "-", 14, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setDrawColor(...DARK);
  doc.line(130, y + 17, 195, y + 17);
  doc.text(
    bidanNama || "(................................)",
    130 +
      (65 -
        doc.getTextWidth(bidanNama || "(................................)")) /
        2,
    y + 22,
  );

  doc.save(
    `Pemeriksaan_${patient?.nama?.replace(/ /g, "_")}_${toDisplay(tanggal).replace(/ /g, "_")}.pdf`,
  );
}
