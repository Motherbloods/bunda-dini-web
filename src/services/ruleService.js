import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export async function fetchActiveRules() {
  const q = query(collection(db, "rules"), where("aktif", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
