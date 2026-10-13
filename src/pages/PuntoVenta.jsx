import { useMemo, useState } from "react";
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  CircleDollarSign,
  Pizza,
  Clock3,
  Check,
  ChefHat,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { obtenerFechaActual } from "../utilidades/fechaActual.js";
import ConfirmarVenta from "./ConfirmarVenta.jsx";
import HistorialVentas from "./HistorialVentas.jsx";

// Convierte un importe numérico a la moneda usada por el negocio.
const formatearPrecio = (importe) => `Bs ${importe.toFixed(2)}`;

// Mantiene el estado de la pantalla de ventas y prepara los datos que se muestran.
function PuntoVenta({
  productos = [],
  cargandoProductos = false,
  errorProductos = "",
  ventas = [],
  cargandoVentas = false,
  errorVentas = "",
  onIrProductos,
  onCerrarSesion,
  correoUsuario,
}) {
  const fechaActual = obtenerFechaActual();
  // Guarda la categoría elegida para filtrar el menú.
  const [categoriaSeleccionada, establecerCategoria] = useState("Todas");
  // Guarda el texto que se usa para buscar pizzas.
  const [textoBusqueda, establecerBusqueda] = useState("");
  // Guarda las pizzas agregadas al pedido y sus cantidades.
  const [productosPedido, establecerProductosPedido] = useState([]);
  // Indica si el pedido se recogerá o se enviará a domicilio.
  const [tipoPedido, establecerTipoPedido] = useState("Para recoger");
  // Guarda el mensaje temporal que confirma una acción.
  const [mensajeAviso, establecerAviso] = useState("");
  // Controla la ventana independiente para confirmar el cobro.
  const [confirmacionVentaAbierta, establecerConfirmacionVentaAbierta] =
    useState(false);
  // Controla la apertura del carrito en pantallas pequeñas.
  const [carritoMovilAbierto, establecerCarritoMovilAbierto] = useState(false);
  // Controla si el menú lateral se muestra abierto o plegado.
  const [barraLateralAbierta, establecerBarraLateralAbierta] = useState(
    () => window.innerWidth > 700,
  );
  // Obtiene las categorías existentes y filtra los productos recibidos de Firestore.
  const categorias = useMemo(() => {
    const presentes = new Set(
      productos.map((producto) => producto.categoria).filter(Boolean),
    );
    const categoriasOrdenadas = [...presentes].sort((categoriaA, categoriaB) =>
      categoriaA.localeCompare(categoriaB, "es"),
    );
    return ["Todas", ...categoriasOrdenadas];
  }, [productos]);
  const pizzasFiltradas = useMemo(
    () =>
      productos
        .filter((producto) => producto.activo !== false)
        .filter(
          (pizzaDelMenu) =>
            (categoriaSeleccionada === "Todas" ||
              pizzaDelMenu.categoria === categoriaSeleccionada) &&
            `${pizzaDelMenu.nombre} ${pizzaDelMenu.descripcion || ""}`
              .toLocaleLowerCase("es")
              .includes(textoBusqueda.toLocaleLowerCase("es")),
        ),
    [categoriaSeleccionada, productos, textoBusqueda],
  );
  // Calcula la cantidad de pizzas y los importes del pedido actual.
  const cantidadTotal = productosPedido.reduce(
    (acumulado, producto) => acumulado + producto.cantidad,
    0,
  );
  const subtotalPedido = productosPedido.reduce(
    (acumulado, producto) => acumulado + producto.precio * producto.cantidad,
    0,
  );
  const costoEnvio = tipoPedido === "A domicilio" && cantidadTotal ? 8 : 0;
  const totalPedido = subtotalPedido + costoEnvio;

  // Agrega una pizza al pedido o aumenta su cantidad si ya estaba incluida.
  function agregarPizza(pizza) {
    establecerProductosPedido((productosActuales) => {
      const productoExistente = productosActuales.find(
        (producto) => producto.id === pizza.id,
      );
      return productoExistente
        ? productosActuales.map((producto) =>
            producto.id === pizza.id
              ? { ...producto, cantidad: producto.cantidad + 1 }
              : producto,
          )
        : [...productosActuales, { ...pizza, cantidad: 1 }];
    });
  }
  // Actualiza la cantidad de una pizza y la quita si llega a cero.
  function cambiarCantidad(idPizza, cambio) {
    establecerProductosPedido((productosActuales) =>
      productosActuales
        .map((producto) =>
          producto.id === idPizza
            ? { ...producto, cantidad: producto.cantidad + cambio }
            : producto,
        )
        .filter((producto) => producto.cantidad > 0),
    );
  }
  // Abre el formulario de método de pago antes de registrar la venta.
  function confirmarPedido() {
    if (!cantidadTotal) return;
    establecerConfirmacionVentaAbierta(true);
  }

  // Vacía el carrito cuando el componente de cobro confirma que guardó la venta.
  function terminarVenta() {
    establecerConfirmacionVentaAbierta(false);
    establecerAviso("Venta registrada correctamente en Firebase.");
    establecerProductosPedido([]);
    // Oculta el mensaje de confirmación después de unos segundos.
    setTimeout(() => establecerAviso(""), 3500);
  }

  // Cierra el formulario de cobro sin modificar el pedido actual.
  function cancelarConfirmacionVenta() {
    establecerConfirmacionVentaAbierta(false);
  }

  // Permite quitar una pizza completa del pedido.
  function quitarPizza(idPizza) {
    establecerProductosPedido((productosActuales) =>
      productosActuales.filter((producto) => producto.id !== idPizza),
    );
  }

  // Selecciona una categoría del menú.
  function seleccionarCategoria(nuevaCategoria) {
    establecerCategoria(nuevaCategoria);
  }

  // Actualiza el texto que filtra el menú.
  function actualizarBusqueda(evento) {
    establecerBusqueda(evento.target.value);
  }

  // Cambia la modalidad de entrega del pedido.
  function seleccionarTipoPedido(nuevoTipo) {
    establecerTipoPedido(nuevoTipo);
  }

  // Cierra el carrito desplegado en la versión móvil.
  function cerrarCarritoMovil() {
    establecerCarritoMovilAbierto(false);
  }

  // Abre el carrito desde el botón flotante en pantallas pequeñas.
  function abrirCarritoMovil() {
    establecerCarritoMovilAbierto(true);
  }

  // Limpia el mensaje temporal mostrado en pantalla.
  function cerrarAviso() {
    establecerAviso(String());
  }
  // Informa que las secciones de gestión todavía no están implementadas.
  function avisarSeccionPendiente(mensaje) {
    establecerAviso(mensaje);
  }

  // Pliega o despliega la barra lateral de navegación.
  function alternarBarraLateral() {
    establecerBarraLateralAbierta((abierta) => !abierta);
  }

  // Desplaza la página hasta la sección del historial de ventas.
  function irAlHistorialVentas() {
    document
      .getElementById("historial-ventas")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Devuelve la pantalla al inicio desde la opción Punto de venta del menú.
  function volverAlInicioVentas() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Renderiza la pantalla de ventas y sus controles.
  return (
    <div
      className={`app-shell ${barraLateralAbierta ? "" : "sidebar-is-collapsed"}`}
    >
      <aside
        className={`products-sidebar ${barraLateralAbierta ? "" : "collapsed"}`}
      >
        <a
          className="brand"
          href="#inicio"
          onClick={(evento) => evento.preventDefault()}
        >
          <span className="brand-mark">
            <Pizza size={23} strokeWidth={2.4} />
          </span>
          <span>
            ad<span className="brand-red">pizza</span>
          </span>
        </a>
        <div className="side-label">MENÚ PRINCIPAL</div>
        <button
          className="nav-item active"
          onClick={volverAlInicioVentas}
          aria-current="page"
          title="Punto de venta"
        >
          <span className="nav-icon">
            <ShoppingBag size={18} />
          </span>
          <span className="products-nav-label">Punto de venta</span>
          <span className="nav-dot" />
        </button>
        <button
          className="nav-item muted"
          onClick={onIrProductos}
          title="Productos"
        >
          <span className="nav-icon">
            <Pizza size={18} />
          </span>
          <span className="products-nav-label">Productos</span>
        </button>
        <button
          className="nav-item muted"
          onClick={irAlHistorialVentas}
          title="Historial de ventas"
        >
          <span className="nav-icon">
            <Clock3 size={18} />
          </span>
          <span className="products-nav-label">Historial</span>
        </button>
        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="avatar">AP</div>
            <div className="user-text sidebar-user-copy">
              <b>Ad Pizza SRL</b>
              <span>{correoUsuario}</span>
            </div>
          </div>
        </div>
        <button
          className="products-sidebar-toggle"
          onClick={alternarBarraLateral}
          aria-label={barraLateralAbierta ? "Ocultar menú" : "Mostrar menú"}
          title={barraLateralAbierta ? "Ocultar menú" : "Mostrar menú"}
        >
          {barraLateralAbierta ? (
            <ChevronLeft size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="crumb">
            Inicio <span>/</span> <b>Punto de venta</b>
          </div>
          <div className="top-right">
            <span className="open-status">
              <i /> Abierto
            </span>
            <span className="top-divider" />
            <div className="today">
              <span>Hoy</span>
              <b>{fechaActual.larga}</b>
            </div>
            <button
              className="logout-button"
              onClick={onCerrarSesion}
              title={`Cerrar sesión de ${correoUsuario || "usuario"}`}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">{fechaActual.encabezado}</div>
              <h1>¿Qué vamos a preparar hoy?</h1>
            </div>
          </section>
          <div className="content-grid">
            <section className="menu-section">
              <div className="section-head">
                <div>
                  <h2>Nuestros productos </h2>
                  <p>{pizzasFiltradas.length} Productos disponibles</p>
                </div>
                <label className="search-box">
                  <Search size={17} />
                  <input
                    value={textoBusqueda}
                    onChange={actualizarBusqueda}
                    placeholder="Buscar producto..."
                  />
                </label>
              </div>
              <div className="category-row">
                {categorias.map((categoria) => (
                  <button
                    key={categoria}
                    onClick={() => seleccionarCategoria(categoria)}
                    className={`category-pill ${categoriaSeleccionada === categoria ? "selected" : ""}`}
                  >
                    {categoria}
                  </button>
                ))}
              </div>
              <div className="pizza-grid">
                {pizzasFiltradas.map((pizza) => (
                  <article className="pizza-card" key={pizza.id}>
                    <div className={`pizza-art ${pizza.color}`}>
                      <span className="pizza-emoji">{pizza.emoji || "🍕"}</span>
                      {pizza.tag && (
                        <span className="popular-tag">★ {pizza.tag}</span>
                      )}
                      <span className="art-leaf">✳</span>
                    </div>
                    <div className="pizza-info">
                      <div className="pizza-title-row">
                        <h3>{pizza.nombre}</h3>
                        <span className="price">
                          {formatearPrecio(pizza.precio)}
                        </span>
                      </div>
                      <p>{pizza.descripcion}</p>
                      <div className="pizza-card-bottom">
                        <span className="category-label">
                          {pizza.categoria}
                        </span>
                        <button
                          className="add-btn"
                          onClick={() => agregarPizza(pizza)}
                          aria-label={`Agregar ${pizza.nombre}`}
                        >
                          <Plus size={17} />
                          <span>Agregar</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {errorProductos && (
                <div className="products-error">
                  <X size={16} /> No se pudieron leer los productos:{" "}
                  {errorProductos}
                </div>
              )}
              {cargandoProductos && (
                <div className="products-loading">
                  <span className="spin">◌</span> Cargando productos...
                </div>
              )}
              {!cargandoProductos && !pizzasFiltradas.length && (
                <div className="empty-search">
                  <span>🍕</span>
                  <b>
                    {productos.length
                      ? "No encontramos productos"
                      : "El catálogo está vacío"}
                  </b>
                  <p>
                    {productos.length
                      ? "Prueba con otro nombre o categoría."
                      : "Agrega productos desde la sección Productos."}
                  </p>
                </div>
              )}
            </section>
            <aside
              className={`order-panel ${carritoMovilAbierto ? "mobile-open" : ""}`}
            >
              <div className="order-head">
                <div>
                  <div className="order-title">
                    <span className="bag-icon">
                      <ShoppingBag size={17} />
                    </span>
                    <h2>Pedido</h2>
                    <span className="order-count">{cantidadTotal}</span>
                  </div>
                </div>
                <button className="mobile-close" onClick={cerrarCarritoMovil}>
                  <X size={19} />
                </button>
              </div>
              <div className="order-type">
                <label>Tipo de pedido</label>
                <div className="type-options">
                  <button
                    className={
                      tipoPedido === "Para recoger" ? "type-selected" : ""
                    }
                    onClick={() => seleccionarTipoPedido("Para recoger")}
                  >
                    Para recoger
                  </button>
                  <button
                    className={
                      tipoPedido === "A domicilio" ? "type-selected" : ""
                    }
                    onClick={() => seleccionarTipoPedido("A domicilio")}
                  >
                    A domicilio
                  </button>
                </div>
              </div>
              <div className="cart-items">
                {productosPedido.length ? (
                  productosPedido.map((producto) => (
                    <div className="cart-item" key={producto.id}>
                      <div className={`mini-pizza ${producto.color}`}>
                        {producto.emoji || "🍕"}
                      </div>
                      <div className="cart-info">
                        <b>{producto.nombre}</b>
                        <span>{formatearPrecio(producto.precio)} c/u</span>
                        <div className="quantity">
                          <button
                            onClick={() => cambiarCantidad(producto.id, -1)}
                          >
                            <Minus size={12} />
                          </button>
                          <span>{producto.cantidad}</span>
                          <button
                            onClick={() => cambiarCantidad(producto.id, 1)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="cart-line-end">
                        <b>
                          {formatearPrecio(producto.precio * producto.cantidad)}
                        </b>
                        <button
                          className="remove-btn"
                          onClick={() => quitarPizza(producto.id)}
                          aria-label="Quitar producto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-cart">
                    <div className="empty-bag">
                      <ShoppingBag size={22} />
                    </div>
                    <b>Tu pedido está vacío</b>
                    <div className="empty-cart-decoration">✳</div>
                  </div>
                )}
              </div>
              <div className="order-summary">
                <div>
                  <span>Subtotal</span>
                  <b>{formatearPrecio(subtotalPedido)}</b>
                </div>
                {tipoPedido === "A domicilio" && (
                  <div>
                    <span>Envío</span>
                    <b>
                      {cantidadTotal
                        ? formatearPrecio(costoEnvio)
                        : formatearPrecio(0)}
                    </b>
                  </div>
                )}
                <div className="total-row">
                  <span>Total</span>
                  <b>{formatearPrecio(totalPedido)}</b>
                </div>
                <button
                  className="pay-btn"
                  onClick={confirmarPedido}
                  disabled={!cantidadTotal}
                >
                  <CircleDollarSign size={18} />
                  <span>Cobrar pedido</span>
                  <span className="pay-total">
                    {formatearPrecio(totalPedido)}
                  </span>
                </button>
              </div>
            </aside>
          </div>
          <HistorialVentas
            ventas={ventas}
            cargando={cargandoVentas}
            error={errorVentas}
          />
          <footer className="footer">
            <span>© {fechaActual.anio} Ad Pizza SRL</span>
          </footer>
        </div>
      </main>
      {cantidadTotal > 0 && (
        <button className="mobile-cart-fab" onClick={abrirCarritoMovil}>
          <ShoppingBag size={18} />
          <span>Ver pedido</span>
          <b>{cantidadTotal}</b>
        </button>
      )}
      {confirmacionVentaAbierta && (
        <ConfirmarVenta
          productos={productosPedido}
          tipoPedido={tipoPedido}
          subtotal={subtotalPedido}
          costoEnvio={costoEnvio}
          total={totalPedido}
          correoUsuario={correoUsuario}
          onCancelar={cancelarConfirmacionVenta}
          onVentaConfirmada={terminarVenta}
        />
      )}
      {mensajeAviso && (
        <div className="toast">
          <span className="toast-check">
            <Check size={16} />
          </span>
          {mensajeAviso}
          <button onClick={cerrarAviso}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
export default PuntoVenta;
