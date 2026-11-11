import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Configuración centralizada de Firebase.
// Se lee exclusivamente desde variables de entorno (VITE_*).
// No se duplica la instancia: getFirestore(app) devuelve la misma instancia.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }
