import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toDisplay, toDisplayWithDay } from "./dateFormatter";
import { kategoriBmi } from "./ruleEngine";

export async function generateRekapPdf({
  exams,
  patMap,
  namaPuskesmas = "PUSKESMAS",
  bidanNama = "",
  from,
  to,
}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const RED = [198, 40, 40];
  const GREY = [117, 117, 117];
  const DARK = [33, 33, 33];
  const LIGHT = [245, 245, 245];
  const WHITE = [255, 255, 255];

  // HEADER
  doc.setFillColor(...RED);
  doc.rect(0, 0, 297, 30, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(namaPuskesmas.toUpperCase(), 148.5, 12, { align: "center" });
  doc.setFontSize(10);
  doc.text("REKAP PEMERIKSAAN IBU HAMIL", 148.5, 18, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `Periode: ${toDisplay(from)} s/d ${toDisplay(to)}   |   Tanggal Cetak: ${toDisplay(new Date())}`,
    148.5,
    24,
    { align: "center" },
  );

  // TABEL REKAP
  const headers = [
    "No",
    "Nama Ibu",
    "NIK",
    "Kader",
    "Tanggal",
    "Usia\nKehamilan\n(mgg)",
    "TP",
    "Sistolik\n(mmHg)",
    "Diastolik\n(mmHg)",
    "Status\nTensi",
    "BB\n(kg)",
    "LILA\n(cm)",
    "BMI",
    "DJJ\n(bpm)",
    "Status Ibu",
    "Status\nJanin",
  ];

  const tableData = exams.map((e, i) => {
    const p = patMap[e.patientId] ?? {};
    const tanggal =
      e.tanggal?.toDate?.() ?? new Date(e.tanggal?.seconds * 1000);
    const hpht = p?.hpht?.toDate?.() ?? (p?.hpht ? new Date(p.hpht) : null);

    let tpStr = "Belum diisi";
    if (hpht) {
      try {
        const tp = new Date(hpht);
        tp.setDate(tp.getDate() + 7);
        tp.setMonth(tp.getMonth() - 3);
        tp.setFullYear(tp.getFullYear() + 1);
        tpStr = toDisplay(tp);
      } catch (err) {
        tpStr = "-";
      }
    }

    const tensiStatus =
      e.sistolik >= 140 || e.diastolik >= 90
        ? "Hipertensi"
        : e.sistolik < 90 || e.diastolik < 60
          ? "Hipotensi"
          : "Normal";

    const statusIbu =
      e.statusIbu === "risiko_tinggi"
        ? "Risiko Tinggi"
        : e.statusIbu === "perlu_perhatian"
          ? "Perlu Perhatian"
          : "Normal";

    const statusJanin =
      e.statusJanin === "djj_rendah"
        ? "DJJ Rendah"
        : e.statusJanin === "djj_tinggi"
          ? "DJJ Tinggi"
          : "Normal";

    return [
      i + 1,
      p.nama ?? "-",
      p.nik ?? "-",
      e.kaderNama ?? "-",
      toDisplay(tanggal),
      e.usiaKehamilan ?? "-",
      tpStr,
      e.sistolik ?? "-",
      e.diastolik ?? "-",
      tensiStatus,
      e.beratBadan?.toFixed(1) ?? "-",
      e.lingkarLengan?.toFixed(1) ?? "-",
      e.bmi?.toFixed(1) ?? "-",
      e.djj ?? "-",
      statusIbu,
      statusJanin,
    ];
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  const totalTableWidth =
    8 +
    25 +
    20 +
    20 +
    18 +
    12 +
    18 +
    12 +
    12 +
    16 +
    10 +
    10 +
    10 +
    10 +
    20 +
    18;

  const leftMargin = (pageWidth - totalTableWidth) / 2;

  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: RED,
      textColor: WHITE,
      fontSize: 7,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      textColor: DARK,
      valign: "middle",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { halign: "left", cellWidth: 25 },
      2: { halign: "left", cellWidth: 20 },
      3: { halign: "left", cellWidth: 20 },
      4: { halign: "center", cellWidth: 18 },
      5: { halign: "center", cellWidth: 12 },
      6: { halign: "center", cellWidth: 18 },
      7: { halign: "center", cellWidth: 12 },
      8: { halign: "center", cellWidth: 12 },
      9: { halign: "center", cellWidth: 16 },
      10: { halign: "center", cellWidth: 10 },
      11: { halign: "center", cellWidth: 10 },
      12: { halign: "center", cellWidth: 10 },
      13: { halign: "center", cellWidth: 10 },
      14: { halign: "center", cellWidth: 20 },
      15: { halign: "center", cellWidth: 18 },
    },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: leftMargin },
    tableWidth: totalTableWidth,
  });

  // FOOTER - Tanda tangan bidan
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setTextColor(...GREY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Mengetahui, Bidan Pendamping", 148.5, finalY, {
    align: "center",
  });
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setDrawColor(...DARK);
  doc.line(120, finalY + 15, 177, finalY + 15);
  doc.text(
    bidanNama || "(................................)",
    148.5,
    finalY + 20,
    { align: "center" },
  );

  doc.save(
    `Rekap_BundaDini_${toDisplay(from).replace(/\//g, "-")}_sd_${toDisplay(to).replace(/\//g, "-")}.pdf`,
  );
}

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
    ["Catatan Bidan", exam.catatanBidan ?? "-"],
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
