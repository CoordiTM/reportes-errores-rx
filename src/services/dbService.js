import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  orderBy,
  Timestamp
} from 'firebase/firestore';

const REPORTES_COLLECTION = 'reportes_errores_rx';
const ERRORES_CATALOG = 'catalogo_errores';
const TECNICOS_LIST = 'tecnicos_lista';

// ============================================
// REPORTES
// ============================================
export const getAllReportes = async () => {
  const q = query(collection(db, REPORTES_COLLECTION), orderBy('fechaRegistro', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addReporte = async (reporteData) => {
  const data = {
    ...reporteData,
    fechaRegistro: Timestamp.now()
  };
  const docRef = await addDoc(collection(db, REPORTES_COLLECTION), data);
  return { id: docRef.id, ...data };
};

export const deleteReporte = async (id) => {
  await deleteDoc(doc(db, REPORTES_COLLECTION, id));
};

export const getReportesByFecha = async (fechaInicio, fechaFin) => {
  const q = query(
    collection(db, REPORTES_COLLECTION),
    where('fechaExamen', '>=', fechaInicio),
    where('fechaExamen', '<=', fechaFin),
    orderBy('fechaExamen', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ============================================
// CATÁLOGO DE ERRORES (Multi-check)
// ============================================
export const getCatalogoErrores = async () => {
  const snapshot = await getDocs(collection(db, ERRORES_CATALOG));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addErrorCatalogo = async (nombre) => {
  const docRef = await addDoc(collection(db, ERRORES_CATALOG), {
    nombre,
    activo: true
  });
  return { id: docRef.id, nombre, activo: true };
};

export const updateErrorCatalogo = async (id, data) => {
  await setDoc(doc(db, ERRORES_CATALOG, id), data, { merge: true });
};

export const deleteErrorCatalogo = async (id) => {
  await deleteDoc(doc(db, ERRORES_CATALOG, id));
};

// ============================================
// LISTA DE TÉCNICOS
// ============================================
export const getTecnicos = async () => {
  const snapshot = await getDocs(collection(db, TECNICOS_LIST));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addTecnico = async (nombre) => {
  const docRef = await addDoc(collection(db, TECNICOS_LIST), {
    nombre,
    activo: true
  });
  return { id: docRef.id, nombre, activo: true };
};

export const updateTecnico = async (id, data) => {
  await setDoc(doc(db, TECNICOS_LIST, id), data, { merge: true });
};

export const deleteTecnico = async (id) => {
  await deleteDoc(doc(db, TECNICOS_LIST, id));
};

// ============================================
// DATOS POR DEFECTO
// ============================================
export const getDefaultErrores = () => [
  { id: 'err-1', nombre: 'Nombre mal escrito', activo: true },
  { id: 'err-2', nombre: 'DNI incorrecto', activo: true },
  { id: 'err-3', nombre: 'Examen eliminado', activo: true },
  { id: 'err-4', nombre: 'Datos invertidos', activo: true },
  { id: 'err-5', nombre: 'Fecha incorrecta', activo: true },
  { id: 'err-6', nombre: 'Hora incorrecta', activo: true },
  { id: 'err-7', nombre: 'Examen equivocado', activo: true },
  { id: 'err-8', nombre: 'Otro', activo: true }
];

export const getDefaultTecnicos = () => [
  { id: 'tec-1', nombre: 'Tecnólogo 1', activo: true },
  { id: 'tec-2', nombre: 'Tecnólogo 2', activo: true }
];
