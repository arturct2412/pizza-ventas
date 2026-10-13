import { useState } from "react";
import {
  AlertCircle,
  Check,
  CircleDollarSign,
  LoaderCircle,
  X,
} from "lucide-react";
import { agregarVenta } from "../servicios/ventas.js";

const metodosPago = ["Efectivo", "QR", "Tarjeta", "Otro"];

// Presenta el resumen y guarda una venta confirmada en Firestore.
function ConfirmarVenta({
  productos,
  tipoPedido,
  subtotal,
  costoEnvio,
  total,
  correoUsuario,
  onCancelar,
  onVentaConfirmada,
}) {
  const [metodoPago, establecerMetodoPago] = useState("Efectivo");
  const [guardando, establecerGuardando] = useState(false);
  const [mensajeError, establecerMensajeError] = useState("");

  // Convierte importes numéricos a bolivianos para el resumen del cobro.
  function formatearPrecio(importe) {
    return `Bs ${Number(importe || 0).toFixed(2)}`;
  }

  // Guarda una copia de los productos, precios y datos del cobro.
  async function guardarVenta(evento) {
    evento.preventDefault();
    establecerMensajeError("");
    establecerGuardando(true);

    try {
      const venta = {
        productos: productos.map((producto) => ({
          productoId: producto.id,
          nombre: producto.nombre,
          emoji: producto.emoji || "🍕",
          cantidad: producto.cantidad,
          precioOriginal: Number(producto.precioOriginal || 0),
          precioVenta: Number(producto.precio),
          subtotal: Number(producto.precio) * producto.cantidad,
        })),
        tipoPedido,
        metodoPago,
        subtotal,
        costoEnvio,
        total,
        estado: "completada",
        correoUsuario: correoUsuario || "",
        creadaEn: new Date().toISOString(),
      };

      await agregarVenta(venta);
      onVentaConfirmada();
    } catch (errorFirebase) {
      establecerMensajeError(
        errorFirebase.message ||
          "No se pudo guardar la venta. Revisa las reglas de Firestore.",
      );
    } finally {
      establecerGuardando(false);
    }
  }

  // Cierra el cuadro al hacer clic fuera sin registrar la venta.
  function cerrarAlHacerClicFuera(evento) {
    if (evento.target === evento.currentTarget && !guardando) onCancelar();
  }

  return (
    <div
      className="product-modal-backdrop"
      onMouseDown={cerrarAlHacerClicFuera}
    >
      <form className="product-modal checkout-modal" onSubmit={guardarVenta}>
        <div className="product-modal-head">
          <div>
            <p className="eyebrow">CONFIRMACIÓN DE VENTA</p>
            <h2>Revisar y cobrar</h2>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onCancelar}
            disabled={guardando}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="checkout-summary">
          <div>
            <span>Productos</span>
            <b>
              {productos.reduce(
                (cantidad, producto) => cantidad + producto.cantidad,
                0,
              )}
            </b>
          </div>
          <div>
            <span>Tipo de pedido</span>
            <b>{tipoPedido}</b>
          </div>
          <div>
            <span>Subtotal</span>
            <b>{formatearPrecio(subtotal)}</b>
          </div>
          {costoEnvio > 0 && (
            <div>
              <span>Envío</span>
              <b>{formatearPrecio(costoEnvio)}</b>
            </div>
          )}
          <div className="checkout-total">
            <span>Total a cobrar</span>
            <b>{formatearPrecio(total)}</b>
          </div>
        </div>
        <label className="product-form-field">
          Método de pago
          <select
            value={metodoPago}
            onChange={(evento) => establecerMetodoPago(evento.target.value)}
          >
            {metodosPago.map((metodo) => (
              <option key={metodo} value={metodo}>
                {metodo}
              </option>
            ))}
          </select>
        </label>
        {mensajeError && (
          <p className="form-error">
            <AlertCircle size={14} />
            {mensajeError}
          </p>
        )}
        <div className="product-modal-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancelar}
            disabled={guardando}
          >
            Volver al pedido
          </button>
          <button
            className="save-product-button"
            type="submit"
            disabled={guardando}
          >
            {guardando ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <Check size={16} />
            )}
            {guardando ? (
              "Guardando..."
            ) : (
              <>
                <CircleDollarSign size={15} /> Confirmar venta
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ConfirmarVenta;
