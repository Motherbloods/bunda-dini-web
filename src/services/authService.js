import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userData = await getUserById(cred.user.uid);
  if (!userData) throw new Error("Data pengguna tidak ditemukan.");
  if (!userData.isActive) throw new Error("user-disabled");
  return userData;
}

export async function logout() {
  await signOut(auth);
}

export async function getUserById(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function registerKader({ email, password, nama, createdBy }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  await setDoc(doc(db, "users", uid), {
    id: uid,
    email,
    nama,
    role: "kader",
    createdBy,
    createdAt: new Date(),
    isActive: true,
  });
}

export async function fetchKaders(bidanId) {
  const q = query(
    collection(db, "users"),
    where("role", "==", "kader"),
    where("createdBy", "==", bidanId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deactivateKader(kaderId) {
  await updateDoc(doc(db, "users", kaderId), { isActive: false });
}

export async function activateKader(kaderId) {
  await updateDoc(doc(db, "users", kaderId), { isActive: true });
}

export async function updateProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), { ...data, updatedAt: new Date() });
}
