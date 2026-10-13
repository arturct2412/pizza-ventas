import {
  addDoc,
  baseDeDatos,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "../firebase.js";

const coleccionProductos = baseDeDatos
  ? collection(baseDeDatos, "productos")
  : null;

function ordenarProductos(productos) {
  return [...productos].sort((productoA, productoB) => {
    const porCategoria = (productoA.categoria || "").localeCompare(
      productoB.categoria || "",
      "es",
    );
    if (porCategoria) {
      return porCategoria;
    }
    return (productoA.nombre || "").localeCompare(productoB.nombre || "", "es");
  });
}

// Escucha los productos guardados en Firestore y los entrega ordenados.
export function escucharProductos(alRecibirProductos, alOcurrirError) {
  return onSnapshot(
    coleccionProductos,
    (instantanea) => {
      const productos = ordenarProductos(
        instantanea.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        })),
      );
      alRecibirProductos(productos);
    },
    alOcurrirError,
  );
}

// Agrega un producto nuevo a la colección de Firestore.
export function agregarProducto(datosProducto) {
  return addDoc(coleccionProductos, datosProducto);
}

// Guarda los cambios hechos a un producto existente.
export function actualizarProducto(idProducto, datosProducto) {
  return updateDoc(doc(baseDeDatos, "productos", idProducto), datosProducto);
}

// Elimina un producto de la colección.
export function eliminarProducto(idProducto) {
  return deleteDoc(doc(baseDeDatos, "productos", idProducto));
}
