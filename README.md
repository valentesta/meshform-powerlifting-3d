# Meshform Powerlifting 3D

Demo interactiva de powerlifting con React 19, Three.js y física Rapier. Carga discos calibrados en la barra, cambiá entre sentadilla, banco y peso muerto, y recorré el escenario con la cámara 360°.

## Correr en local

Requiere Node 26.13.0 o superior.

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173`.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run typecheck` | Chequeo de tipos (sin generar archivos) |
| `npm run build` | Typecheck + build de producción en `dist/` |
| `npm run preview` | Sirve `dist/` localmente |

## Controles

- **Cámara:** arrastrar con mouse o un dedo para girar 360°; rueda o pellizco para acercar/alejar. El botón **Camera** vuelve al encuadre de la estación.
- **Carga:** arrastrar un disco desde el rack hasta la barra, o tocarlo. Tocar un disco cargado lo devuelve al rack.
- **Quick load:** presets de 100, 140, 200 y 250 kg.
- **Results:** tabla scrolleable con los 12 finalistas por sexo del Sheffield V 2026, estilo *standings* (`PLACE / NAME / CLASS / SQUAT / BENCH / DEADLIFT / TOTAL / % OF WR`) y banderas. La pantalla LED del escenario también cambia de página con la rueda o arrastrando sobre ella.
- **Sound on/off:** activa o silencia el audio (ambiente de arena, voces del público, golpes de discos, aplausos). El audio arranca recién después del primer clic o tecla, como exigen los navegadores.

## Marca y presentación

El logo de **Meshform Studio** es procedural (canvas, sin imágenes ni fuentes externas) y aparece en el HUD, en la base de la pantalla LED, en los portadores de discos, en el combo rack y en la imagen de fallback. Los portadores son racks horizontales estilo Eleiko / estacionamiento de bicis: los discos quedan separados por arcos y se cargan por los pernos cromados.

La iluminación usa reflejos de estudio generados en memoria (`Environment` + `Lightformer`), sombras de contacto estáticas y una exposición levemente más alta. La resolución se ajusta sola según los FPS reales (`PerformanceMonitor`), así que en equipos lentos baja el DPR y en móvil también se reducen partículas y sombras.

## Deploy en Vercel

El proyecto ya incluye `vercel.json`:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

En Vercel: **Add New → Project → Import Git Repository → Deploy**. No hacen falta variables de entorno.

Demo publicada: **https://meshform-powerlifting-3d.vercel.app**. El deploy se hizo con `npx vercel@66.6.0 --prod --yes` desde esta carpeta (sin repo git, Vercel vinculó el proyecto `meshform-powerlifting-3d`). Para actualizar: correr `npm run build` y después `npx vercel@66.6.0 --prod --yes`.

## Modelos GLB opcionales (FASE 7)

La escena usa geometría procedural por defecto, así que funciona sin archivos binarios. Para reemplazar un objeto por un modelo propio:

1. Guardar los archivos en `public/models/` con estos nombres:

   | Objeto | Archivo |
   | --- | --- |
   | Portador de discos | `plate-rack.glb` |
   | Combo rack (sentadilla) | `combo-rack-squat.glb` |
   | Combo rack (banco) | `combo-rack-bench.glb` |

2. Crear `.env.local` con `VITE_USE_GLB=1`.
3. Reiniciar `npm run dev` o volver a deployar.

Si un archivo no existe, se sigue viendo la geometría procedural: no hay pantalla en blanco ni error. Los modelos se cargan con el `useGLTF` de drei (ya instalado) y se clonan, así que el mismo rack se puede usar a ambos lados de la tarima. Los colliders y las posiciones de carga no cambian: el GLB solo reemplaza la malla visible.

## Datos y fuentes

- Resultados: [OpenIPF Sheffield V 2026](https://www.openipf.org/m/ipf/2608), finales del 21/11/2026.
- Medidas de discos y barra: technical rules IPF 2026 y size chart de discos calibrados ATX.
- Las banderas se dibujan con canvas (no hay archivos de imagen ni librerías extra).
