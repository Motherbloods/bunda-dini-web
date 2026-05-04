import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { uploadFoto } from "../utils/cloudinary";
import { v4 as uuidv4 } from "uuid";

// Fetch

export async function fetchByKader(kaderId) {
  const q = query(
    collection(db, "patients"),
    where("kaderId", "==", kaderId),
    where("status", "==", "aktif"),
    orderBy("nama"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchByKaderAll(kaderId) {
  const q = query(
    collection(db, "patients"),
    where("kaderId", "==", kaderId),
    orderBy("nama"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchAll(bidanId) {
  const q = query(
    collection(db, "patients"),
    where("bidanId", "==", bidanId),
    orderBy("nama"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchById(patientId) {
  const snap = await getDoc(doc(db, "patients", patientId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function findByNik(nik) {
  const q = query(
    collection(db, "patients"),
    where("nik", "==", nik),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// Create

export async function createPatient(patient, fotoFile) {
  const id = uuidv4();

  // Upload foto ke Cloudinary
  const fotoUrl = await uploadFoto(fotoFile, id);

  // Ambil bidanId dari data kader
  const kaderSnap = await getDoc(doc(db, "users", patient.kaderId));
  const bidanId = kaderSnap.data()?.createdBy ?? "";

  const now = new Date();
  const data = {
    ...patient,
    id,
    fotoUrl,
    bidanId,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, "patients", id), data);

  // Catat kader_history
  await addKaderHistory(id, patient.kaderId, patient.kaderNama ?? "");

  return data;
}

// Update

export async function updatePatient(patient, fotoFile = null) {
  let fotoUrl = patient.fotoUrl;
  if (fotoFile) {
    fotoUrl = await uploadFoto(fotoFile, patient.id);
  }
  const updated = { ...patient, fotoUrl, updatedAt: new Date() };
  await updateDoc(doc(db, "patients", patient.id), updated);
  return updated;
}

// Transfer Kader

export async function transferKader({
  patientId,
  newKaderId,
  newKaderNama,
  oldKaderId,
  alasan,
}) {
  const batch = writeBatch(db);
  const now = new Date();
  const patRef = doc(db, "patients", patientId);

  // Ambil bidanId kader baru
  const kaderSnap = await getDoc(doc(db, "users", newKaderId));
  const newBidanId = kaderSnap.data()?.createdBy ?? "";

  // Update pasien
  batch.update(patRef, {
    kaderId: newKaderId,
    bidanId: newBidanId,
    status: "aktif",
    updatedAt: now,
  });

  // Tutup history lama
  const histSnap = await getDocs(
    query(
      collection(db, "patients", patientId, "kader_history"),
      where("tanggalSelesai", "==", null),
    ),
  );
  histSnap.docs.forEach((d) => {
    batch.update(d.ref, { tanggalSelesai: now, alasanPindah: alasan ?? "" });
  });

  // Buat history baru
  const newHistRef = doc(
    collection(db, "patients", patientId, "kader_history"),
  );
  batch.set(newHistRef, {
    id: newHistRef.id,
    kaderId: newKaderId,
    kaderNama: newKaderNama,
    tanggalMulai: now,
    tanggalSelesai: null,
    alasanPindah: "",
  });

  await batch.commit();
}

// Status

export async function tandaiSelesai(patientId) {
  await updateDoc(doc(db, "patients", patientId), {
    status: "selesai",
    updatedAt: new Date(),
  });
}

// Kader History

export async function fetchKaderHistory(patientId) {
  const q = query(
    collection(db, "patients", patientId, "kader_history"),
    orderBy("tanggalMulai", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function addKaderHistory(patientId, kaderId, kaderNama) {
  await addDoc(collection(db, "patients", patientId, "kader_history"), {
    kaderId,
    kaderNama,
    tanggalMulai: new Date(),
    tanggalSelesai: null,
    alasanPindah: "",
  });
}
