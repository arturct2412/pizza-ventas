// Devuelve la fecha actual con el formato local usado en las páginas.
export function obtenerFechaActual() {
  const ahora = new Date();
  const zonaBolivia = "America/La_Paz";

  return {
    larga: ahora.toLocaleDateString("es-BO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: zonaBolivia,
    }),
    encabezado: ahora
      .toLocaleDateString("es-BO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: zonaBolivia,
      })
      .toLocaleUpperCase("es-BO"),
    anio: ahora.toLocaleDateString("es-BO", {
      year: "numeric",
      timeZone: zonaBolivia,
    }),
  };
}
