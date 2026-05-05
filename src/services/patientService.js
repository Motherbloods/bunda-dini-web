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

async function enrichKaderNama(patients) {
  const missingIds = [
    ...new Set(
      patients.filter((p) => p.kaderId && !p.kaderNama).map((p) => p.kaderId),
    ),
  ];

  if (missingIds.length === 0) return patients;

  const kaderMap = {};
  await Promise.all(
    missingIds.map(async (id) => {
      const snap = await getDoc(doc(db, "users", id));
      if (snap.exists()) kaderMap[id] = snap.data().nama ?? "";
    }),
  );

  return patients.map((p) =>
    p.kaderId && !p.kaderNama
      ? { ...p, kaderNama: kaderMap[p.kaderId] ?? "" }
      : p,
  );
}

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
  const patients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return enrichKaderNama(patients);
}

export async function fetchAll(bidanId) {
  const q = query(
    collection(db, "patients"),
    where("bidanId", "==", bidanId),
    orderBy("nama"),
  );
  const snap = await getDocs(q);
  const patients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return enrichKaderNama(patients);
}

export async function fetchById(patientId) {
  const snap = await getDoc(doc(db, "patients", patientId));
  if (!snap.exists()) return null;
  const patient = { id: snap.id, ...snap.data() };
  if (patient.kaderId && !patient.kaderNama) {
    const kaderSnap = await getDoc(doc(db, "users", patient.kaderId));
    if (kaderSnap.exists()) patient.kaderNama = kaderSnap.data().nama ?? "";
  }
  return patient;
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

  const fotoUrl = await uploadFoto(fotoFile, id);

  const kaderSnap = await getDoc(doc(db, "users", patient.kaderId));
  const kaderData = kaderSnap.data() ?? {};
  const bidanId = kaderData.createdBy ?? "";
  const kaderNama = patient.kaderNama || kaderData.nama || "";

  const now = new Date();
  const data = {
    ...patient,
    id,
    fotoUrl,
    bidanId,
    kaderNama,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, "patients", id), data);
  await addKaderHistory(id, patient.kaderId, kaderNama);

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

  const kaderSnap = await getDoc(doc(db, "users", newKaderId));
  const kaderData = kaderSnap.data() ?? {};
  const newBidanId = kaderData.createdBy ?? "";
  const resolvedKaderNama = newKaderNama || kaderData.nama || "";

  batch.update(patRef, {
    kaderId: newKaderId,
    kaderNama: resolvedKaderNama,
    bidanId: newBidanId,
    status: "aktif",
    updatedAt: now,
  });

  const histSnap = await getDocs(
    query(
      collection(db, "patients", patientId, "kader_history"),
      where("tanggalSelesai", "==", null),
    ),
  );
  histSnap.docs.forEach((d) => {
    batch.update(d.ref, { tanggalSelesai: now, alasanPindah: alasan ?? "" });
  });

  const newHistRef = doc(
    collection(db, "patients", patientId, "kader_history"),
  );
  batch.set(newHistRef, {
    id: newHistRef.id,
    kaderId: newKaderId,
    kaderNama: resolvedKaderNama,
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

export async function fetchByIdSecure(patientId, caller) {
  const patient = await fetchById(patientId);

  if (!patient) throw new Error("Pasien tidak ditemukan.");

  if (caller.role === "kader" && patient.kaderId !== caller.id) {
    throw new Error("Akses ditolak.");
  }

  if (caller.role === "bidan" && patient.bidanId !== caller.id) {
    throw new Error("Akses ditolak.");
  }

  return patient;
}
