import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { v4 as uuidv4 } from "uuid";

export async function fetchByPatient(patientId) {
  const q = query(
    collection(db, "examinations"),
    where("patientId", "==", patientId),
    orderBy("tanggal", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchById(examId) {
  const snap = await getDoc(doc(db, "examinations", examId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchLatestByPatient(patientId) {
  const q = query(
    collection(db, "examinations"),
    where("patientId", "==", patientId),
    orderBy("tanggal", "desc"),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function fetchByDateRange(from, to, bidanId) {
  const q = query(
    collection(db, "examinations"),
    where("bidanId", "==", bidanId),
    where("tanggal", ">=", Timestamp.fromDate(from)),
    where("tanggal", "<=", Timestamp.fromDate(to)),
    orderBy("tanggal", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function countThisMonth(bidanId) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const exams = await fetchByDateRange(start, end, bidanId);
  return exams.length;
}

export async function save(exam) {
  const id = exam.id || uuidv4();
  const withId = {
    ...exam,
    id,
    tanggal: Timestamp.fromDate(new Date()),
    createdAt: Timestamp.fromDate(new Date()),
  };
  await setDoc(doc(db, "examinations", id), withId);
  return withId;
}

export async function fetchByIdSecure(examId, caller) {
  const exam = await fetchById(examId);

  if (!exam) throw new Error("Data pemeriksaan tidak ditemukan.");

  // Cek apakah user punya akses ke pasien ini
  const patient = await getDoc(doc(db, "patients", exam.patientId));
  if (!patient.exists()) throw new Error("Data pasien tidak ditemukan.");

  const patientData = patient.data();

  // Validasi akses berdasarkan role
  if (caller.role === "kader" && patientData.kaderId !== caller.id) {
    throw new Error("Akses ditolak.");
  }

  if (caller.role === "bidan" && patientData.bidanId !== caller.id) {
    throw new Error("Akses ditolak.");
  }

  return exam;
}
