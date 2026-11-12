import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// Referencias de colección (se crean automáticamente en Firestore al escribir).
const CITIES_COLLECTION = 'cities'
const ACCOMMODATIONS_COLLECTION = 'accommodations'
const STATUSES_COLLECTION = 'accommodationStatuses'

// Estados válidos de alojamiento compartido.
export const ACCOMMODATION_STATUS = {
  PENDING: 'pending',
  FAVORITE: 'favorite',
  DISCARDED: 'discarded',
}

/**
 * Suscripción a una consulta con manejo de errores.
 * Sin esto, si Firestore falla (config mala, reglas, sin conexión) el callback
 * nunca se ejecuta y las páginas quedan cargando para siempre.
 * `onError` es opcional: si no se pasa, solo se loguea el error.
 */
function subscribe(queryRef, mapDocs, callback, onError) {
  return onSnapshot(
    queryRef,
    (snap) => callback(snap.docs.map(mapDocs)),
    (error) => {
      console.error('[Firestore] Error escuchando la colección:', error)
      if (onError) onError(error)
    },
  )
}

const byId = (d) => ({ id: d.id, ...d.data() })

/**
 * Firestore rechaza `undefined` ("Unsupported field value: undefined").
 * Los formularios dejan vacíos los campos opcionales como `undefined`,
 * así que se convierten en `null` (valor válido que además permite vaciar
 * un campo al editar). Sin esto, crear una ciudad sin coordenadas o un
 * alojamiento sin capacidad/habitaciones fallaba siempre.
 */
function toFirestore(data) {
  const out = {}
  for (const [key, value] of Object.entries(data)) {
    out[key] = value === undefined ? null : value
  }
  return out
}

/* ------------------------- Ciudades ------------------------- */

export async function getCity(id) {
  const s = await getDoc(doc(db, CITIES_COLLECTION, id))
  return s.exists() ? { id: s.id, ...s.data() } : null
}

export function observeCities(callback, onError) {
  const q = query(collection(db, CITIES_COLLECTION), orderBy('name', 'asc'))
  return subscribe(q, byId, callback, onError)
}

export async function createCity(city) {
  return addDoc(collection(db, CITIES_COLLECTION), toFirestore({
    ...city,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }))
}

export async function updateCity(id, city) {
  return updateDoc(doc(db, CITIES_COLLECTION, id), toFirestore({
    ...city,
    updatedAt: serverTimestamp(),
  }))
}

export async function deleteCity(id) {
  // Borra la ciudad junto con sus alojamientos (así no quedan
  // alojamientos huérfanos apuntando a una ciudad inexistente).
  const snap = await getDocs(
    query(collection(db, ACCOMMODATIONS_COLLECTION), where('cityId', '==', id)),
  )
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(doc(db, CITIES_COLLECTION, id))
  await batch.commit()

  // Los estados se borran mejor-esfuerzo: si las reglas de Firestore aún no
  // permiten borrar en accommodationStatuses, queda un dato huérfano inofensivo.
  await Promise.allSettled(
    snap.docs.map((d) => deleteDoc(doc(db, STATUSES_COLLECTION, d.id))),
  )
}

/* ------------------------- Alojamientos ------------------------- */

export async function getAccommodation(id) {
  const s = await getDoc(doc(db, ACCOMMODATIONS_COLLECTION, id))
  return s.exists() ? { id: s.id, ...s.data() } : null
}

export function observeAccommodations(callback, onError) {
  const q = query(collection(db, ACCOMMODATIONS_COLLECTION), orderBy('createdAt', 'desc'))
  return subscribe(q, byId, callback, onError)
}

export function observeAccommodationsByCity(cityId, callback, onError) {
  const q = query(
    collection(db, ACCOMMODATIONS_COLLECTION),
    orderBy('createdAt', 'desc'),
  )
  return subscribe(
    q,
    byId,
    (list) => callback(list.filter((a) => a.cityId === cityId)),
    onError,
  )
}

export async function createAccommodation(accommodation) {
  return addDoc(collection(db, ACCOMMODATIONS_COLLECTION), toFirestore({
    ...accommodation,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }))
}

export async function updateAccommodation(id, accommodation) {
  return updateDoc(doc(db, ACCOMMODATIONS_COLLECTION, id), toFirestore({
    ...accommodation,
    updatedAt: serverTimestamp(),
  }))
}

export async function deleteAccommodation(id) {
  await deleteDoc(doc(db, ACCOMMODATIONS_COLLECTION, id))
  // Mejor esfuerzo: elimina el estado compartido asociado (si las reglas lo
  // permiten) para no dejar documentos huérfanos.
  await deleteDoc(doc(db, STATUSES_COLLECTION, id)).catch(() => {})
}

/* ------------------------- Estados familiares compartidos ------------------------- */

export function observeAccommodationStatuses(callback, onError) {
  const q = query(collection(db, STATUSES_COLLECTION))
  return subscribe(q, byId, callback, onError)
}

// Establece/crea el estado compartido de un alojamiento.
// Solo toca los campos 'status' y 'updatedAt' del documento de estado,
// nunca modifica otros campos del alojamiento.
export async function setAccommodationStatus(accommodationId, status) {
  const ref = doc(db, STATUSES_COLLECTION, accommodationId)
  await setDoc(
    ref,
    {
      status,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

// Obtiene el estado compartido de un alojamiento específico (una sola lectura).
export async function getAccommodationStatus(accommodationId) {
  const s = await getDoc(doc(db, STATUSES_COLLECTION, accommodationId))
  return s.exists() ? { id: s.id, ...s.data() } : null
}
