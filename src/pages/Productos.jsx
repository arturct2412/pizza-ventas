import { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Edit3,
  LoaderCircle,
  LogOut,
  Pizza,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import emojisEspanol from "emoji-picker-react/dist/data/emojis-es";
import {
  actualizarProducto,
  agregarProducto,
  eliminarProducto,
} from "../servicios/productos.js";
import { obtenerFechaActual } from "../utilidades/fechaActual.js";

const formularioVacio = {
  nombre: "",
  descripcion: "",
  categoria: "",
  precioOriginal: "",
  precio: "",
  emoji: "🍕",
  color: "coral",
  tag: "",
  activo: true,
};
const coloresDisponibles = ["coral", "green", "gold", "yellow", "red", "brown"];
const precioEnBolivianos = (precio) => `Bs ${Number(precio || 0).toFixed(2)}`;
// Calcula un valor inicial para productos antiguos que aún no guardaban el precio original.
const precioOriginalAntiguo = (precioVenta) =>
  Math.max(Number(precioVenta || 0) - 10, 0);
const opcionNuevaCategoria = "__agregar_categoria_nueva__";

// Administra el catálogo de productos guardado en Cloud Firestore.
function Productos({
  productos,
  cargandoProductos,
  errorProductos,
  onVolverVentas,
  onCerrarSesion,
  correoUsuario,
}) {
  const fechaActual = obtenerFechaActual();
  // filtrar el catálogo.
  const [textoBusqueda, establecerBusqueda] = useState("");
  const [categoriaSeleccionada, establecerCategoriaSeleccionada] =
    useState("Todas");
  const [productoEditando, establecerProductoEditando] = useState(null);
  const [formularioAbierto, establecerFormularioAbierto] = useState(false);
  const [formulario, establecerFormulario] = useState(formularioVacio);
  const [crearCategoriaNueva, establecerCrearCategoriaNueva] = useState(false);
  const [guardando, establecerGuardando] = useState(false);
  const [mensajeError, establecerMensajeError] = useState("");
  const [aviso, establecerAviso] = useState("");
  const [barraLateralAbierta, establecerBarraLateralAbierta] = useState(
    () => window.innerWidth > 700,
  );

  const categoriasDisponibles = [
    ...new Set(productos.map((producto) => producto.categoria).filter(Boolean)),
  ].sort((categoriaA, categoriaB) =>
    categoriaA.localeCompare(categoriaB, "es", { numeric: true }),
  );
  const categorias = ["Todas", ...categoriasDisponibles];
  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaSeleccionada === "Todas" ||
      producto.categoria === categoriaSeleccionada;
    const textoProducto =
      `${producto.nombre} ${producto.descripcion || ""} ${producto.categoria || ""}`.toLocaleLowerCase(
        "es",
      );
    return (
      coincideCategoria &&
      textoProducto.includes(textoBusqueda.toLocaleLowerCase("es"))
    );
  });

  // Cambia la categoría usada para filtrar el catálogo.
  function seleccionarCategoria(categoria) {
    establecerCategoriaSeleccionada(categoria);
  }

  // Pliega o despliega la barra lateral de navegación.
  function alternarBarraLateral() {
    establecerBarraLateralAbierta((abierta) => !abierta);
  }

  // Abre el formulario limpio para agregar un producto nuevo.
  function abrirFormularioNuevo() {
    establecerProductoEditando(null);
    establecerFormulario(formularioVacio);
    establecerCrearCategoriaNueva(false);
    establecerFormularioAbierto(true);
    establecerMensajeError("");
  }

  // Carga los datos de un producto en el formulario de edición.
  function abrirFormularioEdicion(producto) {
    establecerProductoEditando(producto);
    establecerCrearCategoriaNueva(false);
    establecerFormulario({
      ...formularioVacio,
      ...producto,
      precioOriginal: String(
        producto.precioOriginal ?? precioOriginalAntiguo(producto.precio),
      ),
      precio: String(producto.precio),
    });
    establecerFormularioAbierto(true);
    establecerMensajeError("");
  }

  // Cierra el formulario y descarta los cambios que no se guardaron.
  function cerrarFormulario() {
    establecerProductoEditando(null);
    establecerFormulario(formularioVacio);
    establecerCrearCategoriaNueva(false);
    establecerFormularioAbierto(false);
    establecerMensajeError("");
  }

  // Guarda en el formulario el emoji seleccionado en el catálogo.
  function seleccionarEmoji(datosEmoji) {
    establecerFormulario((formularioActual) => ({
      ...formularioActual,
      emoji: datosEmoji.emoji,
    }));
  }

  // Actualiza el campo del formulario que el usuario está editando.
  function cambiarCampo(evento) {
    const { name, value, type, checked } = evento.target;
    establecerFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Selecciona una categoría existente o habilita el campo para crear otra.
  function cambiarCategoriaSeleccionada(evento) {
    const categoriaElegida = evento.target.value;
    if (categoriaElegida === opcionNuevaCategoria) {
      establecerCrearCategoriaNueva(true);
      establecerFormulario((formularioActual) => ({
        ...formularioActual,
        categoria: "",
      }));
      return;
    }

    establecerCrearCategoriaNueva(false);
    establecerFormulario((formularioActual) => ({
      ...formularioActual,
      categoria: categoriaElegida,
    }));
  }

  // Agregar o actualizar el producto
  async function guardarProducto(evento) {
    evento.preventDefault();
    establecerMensajeError("");

    const precioOriginalNumerico = Number(formulario.precioOriginal);
    const precioVentaNumerico = Number(formulario.precio);
    if (
      !formulario.nombre.trim() ||
      !formulario.categoria.trim() ||
      !Number.isFinite(precioOriginalNumerico) ||
      precioOriginalNumerico <= 0 ||
      !Number.isFinite(precioVentaNumerico) ||
      precioVentaNumerico <= 0
    ) {
      establecerMensajeError(
        "Escribe el nombre, la categoría y ambos precios mayores que cero.",
      );
      return;
    }

    establecerGuardando(true);
    try {
      const datosProducto = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim(),
        categoria: formulario.categoria.trim(),
        precioOriginal: precioOriginalNumerico,
        precio: precioVentaNumerico,
        emoji: formulario.emoji.trim() || "🍕",
        color: formulario.color,
        tag: formulario.tag.trim(),
        activo: formulario.activo,
        actualizadoEn: new Date().toISOString(),
      };

      if (productoEditando) {
        await actualizarProducto(productoEditando.id, datosProducto);
      } else {
        await agregarProducto({
          ...datosProducto,
          creadoEn: new Date().toISOString(),
        });
      }

      establecerAviso(
        productoEditando
          ? "Producto actualizado correctamente."
          : "Producto agregado al catálogo.",
      );
      cerrarFormulario();
    } catch (errorFirebase) {
      establecerMensajeError(
        errorFirebase.message || "No se pudo guardar el producto.",
      );
    } finally {
      establecerGuardando(false);
    }
  }

  // Elimina el producto
  async function borrarProducto(producto) {
    const confirmacion = window.confirm(
      `¿Eliminar "${producto.nombre}" del catálogo?`,
    );
    if (!confirmacion) return;

    try {
      await eliminarProducto(producto.id);
      establecerAviso("Producto eliminado del catálogo.");
    } catch (errorFirebase) {
      establecerMensajeError(
        errorFirebase.message || "No se pudo eliminar el producto.",
      );
    }
  }

  return (
    <div
      className={`products-page ${barraLateralAbierta ? "" : "sidebar-is-collapsed"}`}
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
            <small>HORNO & SABOR</small>
          </span>
        </a>
        <div className="side-label">MENÚ PRINCIPAL</div>
        <button
          className="nav-item muted"
          onClick={onVolverVentas}
          title="Punto de venta"
        >
          <span className="nav-icon">
            <ShoppingBag size={18} />
          </span>
          <span className="products-nav-label">Punto de venta</span>
        </button>
        <button
          className="nav-item active"
          aria-current="page"
          title="Productos"
        >
          <span className="nav-icon">
            <Pizza size={18} />
          </span>
          <span className="products-nav-label">Productos</span>
          <span className="nav-dot" />
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

      <div className="products-workspace">
        <header className="products-topbar">
          <div className="products-crumb">
            Inicio <span>/</span> <b>Productos</b>
          </div>
          <div className="products-user">
            <div className="today">
              <span>Hoy</span>
              <b>{fechaActual.larga}</b>
            </div>
            <span className="products-email">{correoUsuario}</span>
            <button
              className="logout-button"
              onClick={onCerrarSesion}
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="products-content">
          <section className="products-heading">
            <div>
              <p className="eyebrow">GESTIÓN DEL NEGOCIO</p>
              <h1>Productos</h1>
            </div>
            <button
              className="new-product-button"
              onClick={abrirFormularioNuevo}
            >
              <CirclePlus size={17} /> Agregar producto
            </button>
          </section>

          {errorProductos && (
            <div className="products-error">
              <X size={16} /> No se pudieron cargar los productos:{" "}
              {errorProductos}
            </div>
          )}
          {aviso && (
            <div className="products-success">
              <Check size={16} /> {aviso}
              <button onClick={() => establecerAviso("")}>
                <X size={14} />
              </button>
            </div>
          )}
          {mensajeError && !productoEditando && (
            <div className="products-error">
              <X size={16} /> {mensajeError}
            </div>
          )}

          <section className="products-toolbar">
            <label className="search-box">
              <Search size={17} />
              <input
                value={textoBusqueda}
                onChange={(evento) => establecerBusqueda(evento.target.value)}
                placeholder="Buscar producto..."
              />
            </label>
            <span>{productosFiltrados.length} productos en el catálogo</span>
          </section>

          <div
            className="category-row products-category-row"
            aria-label="Filtrar por categoría"
          >
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

          {cargandoProductos ? (
            <div className="products-loading">
              <LoaderCircle className="spin" /> Cargando productos desde
              Firebase...
            </div>
          ) : productosFiltrados.length ? (
            <section className="products-table-wrap">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>PRODUCTO</th>
                    <th>CATEGORÍA</th>
                    <th>PRECIO ORIGINAL</th>
                    <th>PRECIO DE VENTA</th>
                    <th>ESTADO</th>
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((producto) => (
                    <tr key={producto.id}>
                      <td>
                        <div className="product-name-cell">
                          <span
                            className={`product-emoji ${producto.color || "coral"}`}
                          >
                            {producto.emoji || "🍕"}
                          </span>
                          <span>
                            <b>{producto.nombre}</b>
                            <small>
                              {producto.descripcion || "Sin descripción"}
                            </small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="category-label">
                          {producto.categoria || "Sin categoría"}
                        </span>
                      </td>
                      <td>
                        <b className="table-price">
                          {precioEnBolivianos(
                            producto.precioOriginal ??
                              precioOriginalAntiguo(producto.precio),
                          )}
                        </b>
                      </td>
                      <td>
                        <b className="table-price">
                          {precioEnBolivianos(producto.precio)}
                        </b>
                      </td>
                      <td>
                        <span
                          className={`product-status ${producto.activo === false ? "inactive" : ""}`}
                        >
                          <i />
                          {producto.activo === false ? "Inactivo" : "Activo"}
                        </span>
                      </td>
                      <td>
                        <div className="product-actions">
                          <button
                            onClick={() => abrirFormularioEdicion(producto)}
                            title="Editar producto"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="delete-action"
                            onClick={() => borrarProducto(producto)}
                            title="Eliminar producto"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : (
            <section className="products-empty">
              <span>
                <Pizza size={27} />
              </span>
              <b>
                {textoBusqueda
                  ? "No encontramos productos"
                  : "Tu catálogo todavía está vacío"}
              </b>
              <p>
                {textoBusqueda
                  ? "Intenta con otra búsqueda."
                  : "Agrega tu primer producto para guardarlo en Firebase."}
              </p>
              {!textoBusqueda && (
                <button
                  className="new-product-button"
                  onClick={abrirFormularioNuevo}
                >
                  <CirclePlus size={16} /> Agregar producto
                </button>
              )}
            </section>
          )}
        </main>

        {formularioAbierto && (
          <div
            className="product-modal-backdrop"
            onMouseDown={(evento) => {
              if (evento.target === evento.currentTarget) cerrarFormulario();
            }}
          >
            <form className="product-modal" onSubmit={guardarProducto}>
              <div className="product-modal-head">
                <div>
                  <p className="eyebrow">CATÁLOGO DE PRODUCTOS</p>
                  <h2>
                    {productoEditando ? "Editar producto" : "Agregar producto"}
                  </h2>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={cerrarFormulario}
                >
                  <X size={18} />
                </button>
              </div>
              <label className="product-form-field">
                Nombre del producto
                <input
                  name="nombre"
                  value={formulario.nombre}
                  onChange={cambiarCampo}
                  placeholder="Escribe el nombre"
                  required
                  maxLength={60}
                />
              </label>
              <label className="product-form-field">
                Descripción
                <textarea
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={cambiarCampo}
                  placeholder="Ingredientes y detalles del producto"
                  rows={3}
                  maxLength={160}
                />
              </label>
              <div className="product-form-row">
                <label className="product-form-field">
                  Categoría
                  <select
                    value={
                      crearCategoriaNueva
                        ? opcionNuevaCategoria
                        : formulario.categoria
                    }
                    onChange={cambiarCategoriaSeleccionada}
                    required={!crearCategoriaNueva}
                  >
                    <option value="" disabled>
                      Selecciona una categoría
                    </option>
                    {categoriasDisponibles.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                    <option value={opcionNuevaCategoria}>
                      + Agregar nueva categoría
                    </option>
                  </select>
                </label>
                {crearCategoriaNueva && (
                  <label className="product-form-field">
                    Nombre de la nueva categoría
                    <input
                      name="categoria"
                      value={formulario.categoria}
                      onChange={cambiarCampo}
                      placeholder="Escribe la nueva categoría"
                      required
                      maxLength={40}
                      autoFocus
                    />
                  </label>
                )}
                <label className="product-form-field">
                  Precio original (Bs)
                  <input
                    name="precioOriginal"
                    type="number"
                    value={formulario.precioOriginal}
                    onChange={cambiarCampo}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </label>
                <label className="product-form-field">
                  Precio de venta (Bs)
                  <input
                    name="precio"
                    type="number"
                    value={formulario.precio}
                    onChange={cambiarCampo}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </label>
              </div>
              <fieldset className="visual-picker">
                <legend>Emoji del producto</legend>
                <div className="selected-emoji-preview">
                  <span>{formulario.emoji || "🍕"}</span>
                  <small>Emoji seleccionado</small>
                </div>
                <EmojiPicker
                  onEmojiClick={seleccionarEmoji}
                  emojiData={emojisEspanol}
                  emojiStyle="native"
                  searchPlaceholder="Buscar entre todos los emojis..."
                  previewConfig={{ showPreview: false }}
                  autoFocusSearch={false}
                  width="100%"
                  height={340}
                  skinTonesDisabled={false}
                />
              </fieldset>
              <div className="product-form-row">
                <label className="product-form-field">
                  Color de tarjeta
                  <select
                    name="color"
                    value={formulario.color}
                    onChange={cambiarCampo}
                  >
                    {coloresDisponibles.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="product-form-field">
                  Etiqueta (opcional)
                  <input
                    name="tag"
                    value={formulario.tag}
                    onChange={cambiarCampo}
                    placeholder="Escribe una etiqueta"
                    maxLength={24}
                  />
                </label>
              </div>
              {mensajeError && (
                <p className="form-error">
                  <X size={14} /> {mensajeError}
                </p>
              )}
              <div className="product-modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={cerrarFormulario}
                  disabled={guardando}
                >
                  Cancelar
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
                  {guardando
                    ? "Guardando..."
                    : productoEditando
                      ? "Guardar cambios"
                      : "Guardar producto"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Productos;
