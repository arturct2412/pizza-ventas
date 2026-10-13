import { ArrowUp, Clock3, ReceiptText } from "lucide-react";

// Muestra un resumen de las ventas recientes registradas en Firestore.
function HistorialVentas({ ventas = [], cargando = false, error = "" }) {
  // Convierte la fecha guardada a la hora local del dispositivo.
  function formatearFecha(fecha) {
    if (!fecha) return "Fecha no disponible";
    return new Date(fecha).toLocaleString("es-BO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // Formatea los importes con la moneda del negocio.
  function formatearPrecio(importe) {
    return `Bs ${Number(importe || 0).toFixed(2)}`;
  }

  // Devuelve la página al inicio desde la sección de ventas recientes.
  function volverArriba() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="sales-history" id="historial-ventas">
      <div className="sales-history-heading">
        <div>
          <h2>
            <Clock3 size={17} /> Ventas recientes
          </h2>
          <p>Últimas ventas registradas</p>
        </div>
        <span>{ventas.length}</span>
      </div>
      {error ? (
        <p className="sales-history-empty">
          No se pudo cargar el historial: {error}
        </p>
      ) : cargando ? (
        <p className="sales-history-empty">Cargando ventas...</p>
      ) : ventas.length === 0 ? (
        <p className="sales-history-empty">
          Todavía no hay ventas registradas.
        </p>
      ) : (
        <div className="sales-history-list">
          {ventas.slice(0, 8).map((venta) => (
            <article className="sales-history-item" key={venta.id}>
              <span className="sales-history-icon">
                <ReceiptText size={17} />
              </span>
              <div className="sales-history-info">
                <b>
                  {venta.productos
                    ?.map(
                      (producto) => `${producto.cantidad}× ${producto.nombre}`,
                    )
                    .join(", ") || "Venta"}
                </b>
                <small>
                  {formatearFecha(venta.creadaEn)} ·{" "}
                  {venta.metodoPago || "Sin método"} ·{" "}
                  {venta.tipoPedido || "Pedido"}
                </small>
              </div>
              <strong>{formatearPrecio(venta.total)}</strong>
            </article>
          ))}
        </div>
      )}
      <button className="sales-history-up" type="button" onClick={volverArriba}>
        <ArrowUp size={14} /> Subir
      </button>
    </section>
  );
}

export default HistorialVentas;
