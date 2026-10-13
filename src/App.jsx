import { useEffect, useState } from "react";
import {
  AlertCircle,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Pizza,
} from "lucide-react";
import PuntoVenta from "./pages/PuntoVenta.jsx";
import Productos from "./pages/Productos.jsx";
import {
  autenticacion,
  createUserWithEmailAndPassword,
  errorInicializacionFirebase,
  firebaseConfigurado,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "./firebase.js";
import { escucharProductos } from "./servicios/productos.js";
import { escucharVentas } from "./servicios/ventas.js";

// Conecta autenticación, productos y las dos pantallas de la aplicación.
function App() {
  const [usuario, establecerUsuario] = useState(null);
  const [productos, establecerProductos] = useState([]);
  const [pantalla, establecerPantalla] = useState("ventas");
  const [cargando, establecerCargando] = useState(true);
  const [cargandoProductos, establecerCargandoProductos] = useState(false);
  const [errorProductos, establecerErrorProductos] = useState("");
  const [ventas, establecerVentas] = useState([]);
  const [cargandoVentas, establecerCargandoVentas] = useState(false);
  const [errorVentas, establecerErrorVentas] = useState("");

  // Mantiene la sesión sincronizada con el estado de Firebase Authentication.
  useEffect(() => {
    if (!autenticacion) {
      establecerCargando(false);
      return undefined;
    }

    return onAuthStateChanged(
      autenticacion,
      (usuarioActual) => {
        establecerUsuario(usuarioActual);
        establecerCargando(false);
      },
      (errorAuth) => {
        establecerCargando(false);
        console.error(errorAuth);
      },
    );
  }, []);

  // Escucha cambios de productos mientras el usuario tiene una sesión activa.
  useEffect(() => {
    if (!usuario) {
      establecerProductos([]);
      establecerCargandoProductos(false);
      return undefined;
    }

    establecerCargandoProductos(true);
    establecerErrorProductos("");
    return escucharProductos(
      (productosActualizados) => {
        establecerProductos(productosActualizados);
        establecerCargandoProductos(false);
      },
      (error) => {
        establecerErrorProductos(
          error.message || "No se pudieron leer los productos.",
        );
        establecerCargandoProductos(false);
      },
    );
  }, [usuario]);

  // Mantiene el historial de ventas sincronizado con Firestore para el usuario activo.
  useEffect(() => {
    if (!usuario) {
      establecerVentas([]);
      establecerCargandoVentas(false);
      return undefined;
    }

    establecerCargandoVentas(true);
    establecerErrorVentas("");
    return escucharVentas(
      (ventasActualizadas) => {
        establecerVentas(ventasActualizadas);
        establecerCargandoVentas(false);
      },
      (error) => {
        establecerErrorVentas(
          error.message || "No se pudo leer el historial de ventas.",
        );
        establecerCargandoVentas(false);
      },
    );
  }, [usuario]);

  // Muestra el estado de carga inicial de autenticación.
  if (cargando) {
    return (
      <div className="auth-screen">
        <LoaderCircle className="spin" /> Cargando sesión...
      </div>
    );
  }

  // Solicita completar la configuración local antes de usar Firebase.
  if (!firebaseConfigurado) {
    return <ConfiguracionFirebase />;
  }

  if (errorInicializacionFirebase) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <p className="auth-eyebrow">FIREBASE</p>
          <h1>No se pudo iniciar Firebase</h1>
          <p className="auth-description">
            Revisa <code>.env.local</code>: sin comillas, sin comas y sin
            espacios alrededor del igual. Reinicia <code>npm run dev</code>{" "}
            después de guardar.
          </p>
          <p className="auth-error">
            <AlertCircle size={15} />
            {errorInicializacionFirebase}
          </p>
        </section>
      </main>
    );
  }

  // Pide iniciar sesión antes de abrir el punto de venta o el catálogo.
  if (!usuario) {
    return <PantallaAcceso />;
  }

  // Abre la página elegida y comparte con ella la sesión y los productos.
  return pantalla === "ventas" ? (
    <PuntoVenta
      productos={productos}
      cargandoProductos={cargandoProductos}
      errorProductos={errorProductos}
      ventas={ventas}
      cargandoVentas={cargandoVentas}
      errorVentas={errorVentas}
      onIrProductos={() => establecerPantalla("productos")}
      onCerrarSesion={() => signOut(autenticacion)}
      correoUsuario={usuario.email}
    />
  ) : (
    <Productos
      productos={productos}
      cargandoProductos={cargandoProductos}
      errorProductos={errorProductos}
      onVolverVentas={() => establecerPantalla("ventas")}
      onCerrarSesion={() => signOut(autenticacion)}
      correoUsuario={usuario.email}
    />
  );
}

// Recoge el correo y la contraseña para entrar o crear una cuenta de Firebase.
function PantallaAcceso() {
  const [correo, establecerCorreo] = useState("");
  const [contrasena, establecerContrasena] = useState("");
  const [crearCuenta, establecerCrearCuenta] = useState(false);
  const [error, establecerError] = useState("");
  const [enviando, establecerEnviando] = useState(false);

  // Valida el formulario y envía las credenciales a Firebase Authentication.
  async function enviarFormulario(evento) {
    evento.preventDefault();
    establecerError("");
    establecerEnviando(true);

    try {
      if (crearCuenta) {
        await createUserWithEmailAndPassword(
          autenticacion,
          correo.trim(),
          contrasena,
        );
      } else {
        await signInWithEmailAndPassword(
          autenticacion,
          correo.trim(),
          contrasena,
        );
      }
    } catch (errorFirebase) {
      establecerError(mensajeDeAutenticacion(errorFirebase.code));
    } finally {
      establecerEnviando(false);
    }
  }

  // Cambia entre el formulario de inicio de sesión y el de registro.
  function cambiarModoAcceso() {
    establecerCrearCuenta((modoActual) => !modoActual);
    establecerError("");
  }

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={enviarFormulario}>
        <div className="auth-logo">
          <Pizza size={23} />
          <span>
            ad<span>pizza</span>
          </span>
        </div>
        <p className="auth-eyebrow">SISTEMA DE VENTAS</p>
        <h1>{crearCuenta ? "Crear cuenta" : "Bienvenido de nuevo"}</h1>
        <p className="auth-description">
          {crearCuenta
            ? "Registra el acceso para tu equipo."
            : "Inicia sesión para administrar tus pedidos."}
        </p>

        <label className="auth-field">
          Correo electrónico
          <input
            type="email"
            autoComplete="email"
            value={correo}
            onChange={(evento) => establecerCorreo(evento.target.value)}
            placeholder="tu@negocio.com"
            required
          />
        </label>
        <label className="auth-field">
          Contraseña
          <input
            type="password"
            autoComplete={crearCuenta ? "new-password" : "current-password"}
            value={contrasena}
            onChange={(evento) => establecerContrasena(evento.target.value)}
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
          />
        </label>

        {error && (
          <p className="auth-error">
            <AlertCircle size={15} />
            {error}
          </p>
        )}
        <button className="auth-submit" type="submit" disabled={enviando}>
          {enviando ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <LogIn size={17} />
          )}
          {crearCuenta ? "Crear cuenta" : "Iniciar sesión"}
        </button>
        <button
          className="auth-switch"
          type="button"
          onClick={cambiarModoAcceso}
        >
          {crearCuenta ? "Ya tengo una cuenta" : "Crear una cuenta nueva"}
        </button>
        <p className="auth-footnote">
          <LockKeyhole size={13} /> Acceso protegido por Firebase Authentication
        </p>
      </form>
    </main>
  );
}

// Presenta los campos que hay que completar en .env.local.
function ConfiguracionFirebase() {
  const campos = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  return (
    <main className="auth-screen">
      <section className="auth-card firebase-setup-card">
        <div className="auth-logo">
          <Pizza size={23} />
          <span>
            ad<span>pizza</span>
          </span>
        </div>
        <p className="auth-eyebrow">CONFIGURACIÓN INICIAL</p>
        <h1>Conecta tu proyecto Firebase</h1>
        <p className="auth-description">
          Copia estos valores desde la configuración de tu aplicación web en
          Firebase y pégalos en el archivo <code>.env.local</code>.
        </p>
        <div className="firebase-fields">
          {campos.map((campo) => (
            <code key={campo}>{campo}=</code>
          ))}
        </div>
        <p className="auth-footnote">
          <LockKeyhole size={13} /> Reinicia el servidor después de guardar el
          archivo.
        </p>
      </section>
    </main>
  );
}

// Traduce errores comunes de acceso a mensajes claros en español.
function mensajeDeAutenticacion(codigoError) {
  const mensajes = {
    "auth/invalid-credential": "El correo o la contraseña no son correctos.",
    "auth/email-already-in-use": "Ya existe una cuenta con ese correo.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-email": "Escribe un correo electrónico válido.",
    "auth/too-many-requests":
      "Hubo muchos intentos. Espera un momento y vuelve a probar.",
  };
  return (
    mensajes[codigoError] ||
    "No se pudo completar el acceso. Revisa la configuración de Firebase."
  );
}

export default App;
