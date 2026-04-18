declare global {
  interface Window {
    firebaseBootError: string;
    firebase: {
      apps: unknown[];
      initializeApp: (config: object) => void;
      firestore: () => FirestoreDB;
    };
  }
}

export type FirestoreDB = {
  collection: (path: string) => CollectionRef;
};

export type CollectionRef = {
  orderBy: (field: string, dir?: string) => QueryRef;
  where: (field: string, op: string, value: unknown) => QueryRef;
  add: (data: object) => Promise<{ id: string }>;
  doc: (id: string) => DocRef;
  get: () => Promise<QuerySnapshot>;
};

export type DocRef = {
  get: () => Promise<DocSnapshot>;
  set: (data: object, options?: object) => Promise<void>;
  delete: () => Promise<void>;
};

export type QueryRef = {
  where: (field: string, op: string, value: unknown) => QueryRef;
  limit: (n: number) => QueryRef;
  get: () => Promise<QuerySnapshot>;
  orderBy: (field: string, dir?: string) => QueryRef;
};

export type QuerySnapshot = {
  empty: boolean;
  docs: DocSnapshot[];
};

export type DocSnapshot = {
  id: string;
  exists: boolean;
  data: () => Record<string, unknown>;
};

let db: FirestoreDB | null = null;

try {
  const firebaseConfig = {
    apiKey: "AIzaSyBmi_ecKiyJr8GRhyQ_ZNl6rM6NDdr3gUg",
    authDomain: "codekids-camp.firebaseapp.com",
    projectId: "codekids-camp",
    storageBucket: "codekids-camp.firebasestorage.app",
    messagingSenderId: "832677156374",
    appId: "1:832677156374:web:d8ac0b359961d495750737",
    measurementId: "G-JVZWRMWXQE"
  };
  if (window.firebase && !window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig);
  }
  if (window.firebase) {
    db = window.firebase.firestore();
  }
} catch (error: unknown) {
  window.firebaseBootError = error instanceof Error ? error.message : "Firebase failed to initialize.";
}

export { db };

export function getFirebaseError(error: unknown): string {
  if (window.firebaseBootError) return window.firebaseBootError;
  if (!error) return "Something went wrong while talking to Firebase.";
  const e = error as { code?: string; message?: string };
  if (e.code === "permission-denied") return "Firestore rules are blocking this action.";
  return e.message || "Something went wrong while talking to Firebase.";
}

function ensureFirebase(): FirestoreDB {
  if (!db) throw new Error(window.firebaseBootError || "Firebase is not initialized.");
  return db;
}

export type Student = {
  id: string;
  name: string;
  email: string;
  track: "pygame" | "ml";
  paid: boolean;
  notes: string;
  age: string;
  parentName: string;
  source: string;
  registrationStatus: string;
  password?: string;
};

function normalizeStudent(doc: { id: string } & Record<string, unknown>): Student {
  return {
    id: doc.id,
    name: (doc["name"] as string) || "",
    email: ((doc["email"] as string) || "").toLowerCase(),
    track: doc["track"] === "ml" ? "ml" : "pygame",
    paid: !!doc["paid"],
    notes: (doc["notes"] as string) || "",
    age: (doc["age"] as string) || "",
    parentName: (doc["parentName"] as string) || "",
    source: (doc["source"] as string) || "manual",
    registrationStatus: (doc["registrationStatus"] as string) || (doc["paid"] ? "approved" : "payment-pending"),
    password: (doc["password"] as string) || undefined,
  };
}

export async function fbGetStudents(): Promise<Student[]> {
  const firestore = ensureFirebase();
  const snap = await firestore.collection("students").orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => normalizeStudent({ id: d.id, ...d.data() }));
}

export async function fbFindStudentByEmail(email: string): Promise<Student | null> {
  const firestore = ensureFirebase();
  const snap = await firestore.collection("students").where("email", "==", email.toLowerCase().trim()).limit(1).get();
  if (snap.empty) return null;
  return normalizeStudent({ id: snap.docs[0].id, ...snap.docs[0].data() });
}

export async function fbAddStudent(data: Omit<Student, "id">): Promise<void> {
  const firestore = ensureFirebase();
  const payload = {
    name: data.name,
    email: data.email.toLowerCase().trim(),
    track: data.track,
    paid: !!data.paid,
    notes: data.notes || "",
    age: data.age || "",
    parentName: data.parentName || "",
    source: data.source || "manual",
    registrationStatus: data.registrationStatus || (data.paid ? "approved" : "payment-pending"),
    createdAt: window.firebase ? (window.firebase as unknown as { firestore: { FieldValue: { serverTimestamp: () => unknown } } }).firestore.FieldValue?.serverTimestamp?.() ?? new Date().toISOString() : new Date().toISOString()
  };
  await firestore.collection("students").add(payload);
}

export async function fbUpdateStudent(id: string, data: Partial<Student>): Promise<void> {
  const firestore = ensureFirebase();
  await firestore.collection("students").doc(id).set(data as object, { merge: true });
}

export async function fbDeleteStudent(id: string): Promise<void> {
  const firestore = ensureFirebase();
  await firestore.collection("students").doc(id).delete();
}

export type Settings = {
  pygameZoom: string;
  mlZoom: string;
  pygameRecordings: { title: string; date: string; url: string }[];
  mlRecordings: { title: string; date: string; url: string }[];
  pygameResources: { title: string; url: string; type: string }[];
  mlResources: { title: string; url: string; type: string }[];
  announcement: string;
  paypalUrl: string;
  venmoUrl: string;
  paypalQrUrl: string;
  venmoQrUrl: string;
  paymentInstructions: string;
};

export const DEFAULT_SETTINGS: Settings = {
  pygameZoom: "",
  mlZoom: "",
  pygameRecordings: [],
  mlRecordings: [],
  pygameResources: [
    { title: "Python Cheatsheet", url: "https://www.pythoncheatsheet.org/", type: "Reference" },
    { title: "Pygame Docs", url: "https://www.pygame.org/docs/", type: "Docs" },
    { title: "Replit", url: "https://replit.com/", type: "Tool" },
    { title: "OpenGameArt", url: "https://opengameart.org/", type: "Assets" }
  ],
  mlResources: [
    { title: "Python Cheatsheet", url: "https://www.pythoncheatsheet.org/", type: "Reference" },
    { title: "Scikit-learn Docs", url: "https://scikit-learn.org/stable/", type: "Docs" },
    { title: "Google Colab", url: "https://colab.research.google.com/", type: "Tool" },
    { title: "Kaggle Datasets", url: "https://www.kaggle.com/datasets", type: "Dataset" }
  ],
  announcement: "Zoom links and recordings will appear here once classes begin.",
  paypalUrl: "",
  venmoUrl: "",
  paypalQrUrl: "",
  venmoQrUrl: "",
  paymentInstructions: "Please send payment and include the student name in the note. Once payment is confirmed, registration will be activated."
};

export async function fbGetSettings(): Promise<Settings> {
  const firestore = ensureFirebase();
  const doc = await firestore.collection("settings").doc("main").get();
  return { ...DEFAULT_SETTINGS, ...(doc.exists ? doc.data() : {}) } as Settings;
}

export async function fbUpdateSettings(data: Partial<Settings>): Promise<void> {
  const firestore = ensureFirebase();
  await firestore.collection("settings").doc("main").set(data as object, { merge: true });
}
