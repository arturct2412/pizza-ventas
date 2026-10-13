import { Component } from "react";
import { AlertCircle, RotateCw } from "lucide-react";

// Captura errores de renderizado para mostrar una explicación en vez de dejar la página vacía.
class ErrorBoundary extends Component {
  // Conserva el error que provocó el fallo de la interfaz.
  state = { error: null };

  // Cambia el estado del límite para renderizar la pantalla de recuperación.
  static getDerivedStateFromError(error) {
    return { error };
  }

  // Registra el error completo en la consola para facilitar el diagnóstico.
  componentDidCatch(error, informacion) {
    console.error(
      "Error capturado por la interfaz:",
      error,
      informacion.componentStack,
    );
  }

  // Recarga la app para volver a intentar mostrar la pantalla.
  recargarPagina = () => {
    window.location.reload();
  };

  // Muestra el contenido normal o una pantalla que explica cómo recuperarse.
  render() {
    if (this.state.error) {
      return (
        <main className="auth-screen">
          <section className="auth-card">
            <div className="auth-logo">
              <AlertCircle size={23} />
              <span>
                ad<span>pizza</span>
              </span>
            </div>
            <p className="auth-eyebrow">ERROR DE LA INTERFAZ</p>
            <h1>La página encontró un error</h1>
            <p className="auth-description">
              Recarga la aplicación. Si vuelve a ocurrir, copia este mensaje
              para encontrar la causa:
            </p>
            <pre className="interface-error-details">
              {this.state.error.message || String(this.state.error)}
            </pre>
            <button className="auth-submit" onClick={this.recargarPagina}>
              <RotateCw size={16} /> Recargar página
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
