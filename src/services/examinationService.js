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

export async function save(exam) {
  const id = exam.id || uuidv4();
  const withId = { ...exam, id, createdAt: new Date() };
  await setDoc(doc(db, "examinations", id), withId);
  return withId;
}
