export const ROUTES = {
  // Auth
  LOGIN: "/login",

  // Kader
  KADER_HOME: "/kader",
  ADD_PATIENT: "/kader/patients/add",
  PATIENT_DETAIL: "/kader/patients/:patientId",
  EDIT_PATIENT: "/kader/patients/:patientId/edit",
  EXAMINE: "/kader/patients/:patientId/examine",
  EXAM_RESULT: "/shared/examine/result/:examId",
  EXAM_HISTORY: "/kader/patients/:patientId/history",

  // Bidan
  BIDAN_DASHBOARD: "/bidan",
  KADER_LIST: "/bidan/kaders",
  ADD_KADER: "/bidan/kaders/add",
  ALL_PATIENTS: "/bidan/patients",
  PATIENT_DETAIL_BIDAN: "/bidan/patients/:patientId",
  EXPORT: "/bidan/export",
};

// Helper untuk build path dengan params
export const buildPath = {
  patientDetail: (id) => `/kader/patients/${id}`,
  editPatient: (id) => `/kader/patients/${id}/edit`,
  examine: (id) => `/kader/patients/${id}/examine`,
  examResult: (id) => `/shared/examine/result/${id}`,
  examHistory: (id) => `/kader/patients/${id}/history`,
  patientDetailBidan: (id) => `/bidan/patients/${id}`,
};
