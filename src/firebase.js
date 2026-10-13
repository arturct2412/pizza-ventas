import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

function leerVariable(nombre) {
  const valor = import.meta.env[nombre];
  if (typeof valor !== "string") {
    return "";
  }

  return valor
    .trim()
    .replace(/^['"]/, "")
    .replace(/['"]$/, "")
    .replace(/,$/, "")
    .trim();
}

const configuracionFirebase = {
  apiKey: leerVariable("VITE_FIREBASE_API_KEY"),
  authDomain: leerVariable("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: leerVariable("VITE_FIREBASE_PROJECT_ID"),
  messagingSenderId: leerVariable("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: leerVariable("VITE_FIREBASE_APP_ID"),
};

export const firebaseConfigurado = Object.values(configuracionFirebase).every(
  Boolean,
);

function obtenerAplicacion() {
  return getApps().length ? getApp() : initializeApp(configuracionFirebase);
}

function obtenerAutenticacion(aplicacion) {
  try {
    return initializeAuth(aplicacion, {
      persistence: browserLocalPersistence,
    });
  } catch {
    return getAuth(aplicacion);
  }
}

let aplicacionFirebase = null;
let autenticacionInicial = null;
let baseDeDatosInicial = null;
let errorInicializacion = "";

if (firebaseConfigurado) {
  try {
    aplicacionFirebase = obtenerAplicacion();
    autenticacionInicial = obtenerAutenticacion(aplicacionFirebase);
    baseDeDatosInicial = getFirestore(aplicacionFirebase);
  } catch (error) {
    errorInicializacion = error.message || "No se pudo iniciar Firebase.";
  }
}

export const autenticacion = autenticacionInicial;
export const baseDeDatos = baseDeDatosInicial;
export const errorInicializacionFirebase = errorInicializacion;

export {
  addDoc,
  collection,
  createUserWithEmailAndPassword,
  deleteDoc,
  doc,
  onAuthStateChanged,
  onSnapshot,
  signInWithEmailAndPassword,
  signOut,
  updateDoc,
  writeBatch,
};
