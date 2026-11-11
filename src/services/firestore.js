import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
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

/* ------------------------- Ciudades ------------------------- */

export async function getCity(id) {
  const s = await getDoc(doc(db, CITIES_COLLECTION, id))
  return s.exists() ? { id: s.id, ...s.data() } : null
}

export function observeCities(callback) {
  const q = query(collection(db, CITIES_COLLECTION), orderBy('name', 'asc'))
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
}

export async function createCity(city) {
  return addDoc(collection(db, CITIES_COLLECTION), {
    ...city,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateCity(id, city) {
  return updateDoc(doc(db, CITIES_COLLECTION, id), {
    ...city,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCity(id) {
  return deleteDoc(doc(db, CITIES_COLLECTION, id))
}

/* ------------------------- Alojamientos ------------------------- */

export async function getAccommodation(id) {
  const s = await getDoc(doc(db, ACCOMMODATIONS_COLLECTION, id))
  return s.exists() ? { id: s.id, ...s.data() } : null
}

export function observeAccommodations(callback) {
  const q = query(collection(db, ACCOMMODATIONS_COLLECTION), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
}

export function observeAccommodationsByCity(cityId, callback) {
  const q = query(
    collection(db, ACCOMMODATIONS_COLLECTION),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, (snap) =>
    callback(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((a) => a.cityId === cityId),
    ),
  )
}

export async function createAccommodation(accommodation) {
  return addDoc(collection(db, ACCOMMODATIONS_COLLECTION), {
    ...accommodation,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateAccommodation(id, accommodation) {
  return updateDoc(doc(db, ACCOMMODATIONS_COLLECTION, id), {
    ...accommodation,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteAccommodation(id) {
  return deleteDoc(doc(db, ACCOMMODATIONS_COLLECTION, id))
}

/* ------------------------- Estados familiares compartidos ------------------------- */

export function observeAccommodationStatuses(callback) {
  const q = query(collection(db, STATUSES_COLLECTION))
  return onSnapshot(
    q,
    (snap) =>
      callback(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      ),
  )
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
