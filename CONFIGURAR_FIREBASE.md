# Configurar Firebase para Ad Pizza

## 1. Crear el proyecto

1. Abre [Firebase Console](https://console.firebase.google.com/) e inicia sesión con Google.
2. Crea un proyecto para Ad Pizza.
3. En el resumen del proyecto, agrega una aplicación web con el botón `</>`.
4. Registra la app y copia los valores del objeto `firebaseConfig`.

## 2. Completar las variables de la app

Abre `.env.local` en la carpeta del proyecto y pega los valores correspondientes, sin comillas:

```env
VITE_FIREBASE_API_KEY=pega_aqui_apiKey
VITE_FIREBASE_AUTH_DOMAIN=pega_aqui_authDomain
VITE_FIREBASE_PROJECT_ID=pega_aqui_projectId
VITE_FIREBASE_MESSAGING_SENDER_ID=pega_aqui_messagingSenderId
VITE_FIREBASE_APP_ID=pega_aqui_appId
```

No uses comillas, comas ni espacios alrededor del `=`. Este archivo no es JavaScript; si pegas el objeto `firebaseConfig` tal cual, la app no conecta y puede quedar en blanco.

Guarda el archivo. `.env.local` está excluido de Git; no necesitas enviarme sus valores por chat. El control de acceso lo protegen Authentication y las reglas de Firestore.

## 3. Activar el inicio de sesión

1. En Firebase Console abre `Authentication` > `Comenzar`.
2. En `Método de acceso`, activa `Correo electrónico/Contraseña`.
3. Guarda la configuración. La pantalla de acceso de la app permite iniciar sesión o crear la primera cuenta.
4. Después de crear las cuentas del equipo, puedes desactivar el registro desde Firebase Authentication si no quieres permitir cuentas nuevas.

## 4. Crear Firestore y reglas

1. En Firebase Console abre `Firestore Database` > `Crear base de datos`.
2. Elige una ubicación apropiada para el negocio. La ubicación de la base de datos no se puede cambiar después de crearla.
3. Abre la pestaña `Reglas`, copia el contenido de `firestore.rules` y publícalo.
4. Estas reglas permiten leer y modificar productos y ventas solo a usuarios que hayan iniciado sesión.

## 5. Iniciar la app y crear productos

En la terminal, dentro de la carpeta del proyecto:

```bash
npm run dev
```

Abre la dirección local que muestre Vite. Si el servidor ya estaba activo, detenlo y vuelve a iniciarlo después de llenar `.env.local`.

Inicia sesión y entra a `Productos`. La app lee la colección `productos` de Firestore en tiempo real. Desde el formulario puedes agregar, editar, activar/desactivar o eliminar registros; ventas y administración muestran el mismo catálogo.

## Campos que guarda cada producto

`nombre`, `descripcion`, `categoria`, `precioOriginal`, `precio`, `emoji`, `color`, `tag`, `activo`, `creadoEn` y `actualizadoEn`. Ambos precios se pueden editar en el formulario. `precio` es el precio de venta que usa la pantalla de ventas.

Las ventas se guardan en la colección `ventas` con una copia de los productos, cantidades, precios, subtotal, costo de envío, total, modalidad de entrega, método de pago, fecha y usuario que la registró. Publica las reglas actualizadas de `firestore.rules` en Firebase Console antes de cobrar.

El formulario de productos tiene un buscador de emojis en español. No requiere Firebase Storage ni habilitar el plan Blaze. Los registros que todavía tengan los campos antiguos `imageUrl` e `imagePath` se seguirán leyendo, pero la app solo mostrará el emoji.

La versión actual protege la colección para usuarios autenticados. Cualquier cuenta creada en el mismo proyecto Firebase podrá administrar el catálogo; si necesitas separar administradores y cajeros, hay que agregar roles y reglas por rol.

## 6. Publicar en Vercel

1. Crea un proyecto en Vercel e importa el repositorio de GitHub que contiene esta app, o despliega la carpeta con Vercel CLI.
2. En `Settings` > `Environment Variables`, agrega las variables Firebase que aparecen en `.env.example`. La app usa `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID` y `VITE_FIREBASE_APP_ID`.
3. Asigna las variables a `Production` y, si usarás previews, también a `Preview`.
4. Despliega el proyecto. Vercel ejecuta `npm run build` y publica `dist` según `vercel.json`.
5. Cuando tengas el dominio `*.vercel.app`, agrégalo en Firebase Console > `Authentication` > `Settings` > `Authorized domains`; de lo contrario Firebase Authentication puede rechazar el inicio de sesión desde la app publicada.

No subas `.env.local` al repositorio. Vite incluye las variables `VITE_*` en el código que recibe el navegador, por lo que no deben contener secretos privados; la protección de los datos depende de las reglas de Firestore y de Authentication.
