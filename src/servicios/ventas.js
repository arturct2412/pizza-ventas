import { addDoc, baseDeDatos, collection, onSnapshot } from "../firebase.js";

// Crea una venta nueva en la colección ventas de Firestore.
export function agregarVenta(datosVenta) {
  if (!baseDeDatos) {
    throw new Error("Firebase no está configurado.");
  }

  return addDoc(collection(baseDeDatos, "ventas"), datosVenta);
}

// Escucha las ventas guardadas y las ordena de la más reciente a la más antigua.
export function escucharVentas(alRecibirVentas, alOcurrirError) {
  if (!baseDeDatos) {
    alOcurrirError(new Error("Firebase no está configurado."));
    return () => {};
  }

  return onSnapshot(
    collection(baseDeDatos, "ventas"),
    (instantanea) => {
      const ventas = instantanea.docs
        .map((documento) => ({ id: documento.id, ...documento.data() }))
        .sort((ventaA, ventaB) =>
          (ventaB.creadaEn || "").localeCompare(ventaA.creadaEn || ""),
        );
      alRecibirVentas(ventas);
    },
    alOcurrirError,
  );
}
