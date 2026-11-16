# Brasil Trip 🇧🇷 — Alojamientos en familia

Aplicación web para que **la familia** investigue, organice y compare
alojamientos (Airbnb) en distintas ciudades de Brasil y decida junta qué
reservar. Pública por enlace, **sin cuentas ni registros**: lo que uno marca,
todos lo ven al instante.

## Qué hace

- **Destinos**: ciudades investigadas (Maceió, Búzios, etc.) con portada,
  región, coordenadas (mapa) y sus alojamientos. La gestión de ciudades y
  alojamientos vive **únicamente desde el panel Admin** (`/admin`).
- **Alojamientos**: precio total (USD), precio por persona calculado,
  distancia a la playa, capacidad, habitaciones, baños, piscina/cochera/
  parrilla/A-C, **Mi puntuación (1-10, obligatoria)**, calificación de
  Airbnb opcional, observaciones, días disponibles (rangos de fechas).
- **Estado familiar compartido** (tiempo real): pendiente / favorita /
  descartada. Se ve al instante en todas las pantallas.
- **Filtros combinables** + ordenamientos + **calendario de disponibilidad**
  (solo muestra los libres en TODOS los días elegidos).
- **Comparador**: hasta 3 alojamientos lado a lado (también dentro de la
  página, con buscador).
- **Mapa** (Leaflet + OpenStreetMap): pines por ciudad con imagen al tocarlos.
- **Tema claro/oscuro** con botón 🌙 en la barra.

## Stack

React 19 + Vite 8 · CSS tradicional (sin frameworks) · **Firebase** (Cloud
Firestore + Hosting vía GitHub Actions) · React Leaflet · sin backend propio,
sin Authentication, sin Firebase Storage (imágenes por URL).

## Estructura

```
src/
  components/   Tarjetas, filtros, calendario, tabs de estado, skeletons…
  pages/        Inicio, Destinos, Detalle de ciudad, Alojamientos, Ficha,
                Comparador, Mapa, Admin (+ AdminCiudades / AdminAlojamientos)
  layout/       Layout (navbar centrado + tema)
  context/      Tema, comparador
  services/     Firebase (firestore.js: CRUD, observers en tiempo real)
  utils/        Formato ($, fechas), filtrado compartido, imágenes (fallback)
  styles/       CSS por ámbito (app, layout, home, forms, admin, map…)
firestore.rules Reglas de Firestore (lectura/escritura pública por enlace,
                con validaciones mínimas)
```

## Desarrollo local

```bash
npm ci
npm run dev        # http://localhost:5173
npm run lint       # ESLint
npm run build      # genera dist/
```

Requiere `.env.local` con las variables `VITE_FIREBASE_*` (ver `.env.example`).
`.env.production` está en el repo a propósito: son identificadores públicos
de cliente de Firebase, no secretos.

## Deploy (automático)

Push a `main` → GitHub Actions (`npm ci` → `npm run lint` → `npm run build`)
→ despliegue a Firebase Hosting (https://vacacionescortinas.web.app).

Si un push no dispara el workflow, entrá a la pestaña **Actions** del repo y
pulsá **Run workflow** (el workflow ahora admite `workflow_dispatch`).

## Firebase Console (ya configurado)

- Proyecto: `vacacionescortinas` (Spark, gratis).
- Firestore: colecciones `cities`, `accommodations`, `accommodationStatuses`.
- Hosting: deploy vía GitHub Actions.
- Reglas: `firestore.rules` (escritura pública por enlace; lectura validada,
  estados solo `pending|favorite|discarded`, alojamiento debe apuntar
  a ciudad existente y `myRating` 1-10).

## Privacidad / seguridad

La app es pública por enlace. **Cualquiera con el enlace puede crear, editar
o borrar contenido** (no hay cuentas). Es intencional para una app familiar;
las decisiones familiares (favorita/pendiente/descartada) son compartidas.

## Funciones admin (solo por enlace `/admin`)

- Panel **Alojamientos**: crear, editar, eliminar alojamientos, con
  disponibilidad por rangos de fechas.
- Panel **Ciudades**: crear, editar (coordenadas para el mapa), eliminar
  (borra en cascada sus alojamientos).
