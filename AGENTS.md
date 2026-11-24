# Meshform Powerlifting 3D — AGENTS

## Estado

**Fase terminada:** FASE 7 (opcional) — tubería de modelos GLB con fallback procedural, más el rediseño del portador de discos pedido antes de arrancar esta fase. Después se hizo la pasada final de cierre: rack horizontal tipo Eleiko/bicicletero, branding de Meshform Studio en HUD/LED/racks/fallback, mejoras de materiales e iluminación y DPR adaptativo por FPS. Proyecto listo para publicar; FASE 6 quedó cerrada y verificada con performance/mobile, resultados con banderas, estabilización de la barra, rack de discos mejorado, audio de público y deploy en Vercel, además de las correcciones posteriores (tabla tipo *standings*, racks en línea a los costados y murmullos más audibles).

**Decisiones tomadas hasta acá** (el detalle y los motivos están en «Decisiones de setup» más abajo):

- Proyecto creado a mano (sin `npm create vite`) para conservar la carpeta `references/` con las fotos.
- Stack completo instalado de una vez, 0 vulnerabilidades. Versiones **efectivamente instaladas** (fijadas sin `^` en `package.json`, verificadas con `npm view` el 2026-11-23):

  | Paquete | Versión instalada |
  | --- | --- |
  | react / react-dom | 19.3.1 |
  | @react-three/fiber | 9.8.2 |
  | @react-three/rapier | 2.2.0 |
  | @react-three/drei | 10.7.9 |
  | @react-three/postprocessing | 3.2.2 |
  | postprocessing | 6.39.6 |
  | three / @types/three | 0.187.0 |
  | zustand | 5.1.0 |
  | gsap | 3.15.1 |
  | vite | 8.3.8 |
  | @vitejs/plugin-react | 6.3.0 |
  | tailwindcss / @tailwindcss/vite | 4.3.5 |
  | typescript | 5.9.3 |

- Renderer **WebGL por defecto**: no se usa WebGPU ni R3F v10 alpha.
- Física en metros y kg: paso fijo `1/120 s`, interpolación, gravedad `-9.81`, CCD en los cuerpos dinámicos.
- Tailwind v4 **solo en el overlay HTML**, registrado como plugin de Vite.
- Fallback sin WebGL / con `prefers-reduced-motion` y SEO básico incluidos desde la FASE 0.
- FASE 1: arena greybox con tarimas y props simples (rack, banco, línea de peso muerto), estaciones configuradas en `src/scene/stations.ts`, cámara con vuelos GSAP y órbita limitada (`src/scene/CameraRig.tsx`). Se removieron el cubo y el piso de la FASE 0. En FASE 4 las 3 tarimas se reemplazaron por una sola plataforma de competencia.
- FASE 2: barra de 20 kg con knurling procedural, discos calibrados 0.5–25 kg con `createPlate(kg)`, collares de 2.5 kg y todo con física real (CCD, masas exactas).
- FASE 3: carga por arrastre o toque, snap en la manga, discos y collares como colliders compuestos de la barra, auto-carga simétrica (100/140/200/250 kg), descarga animada al stock y overlay con peso total. La demo suelta de FASE 2 se reemplazó por un stock infinito.
- FASE 4: una sola plataforma de 3.2 x 3.2 m y 8 cm de alto (dentro de 2.5–4 m y ≤10 cm del reglamento IPF 2026), dos racks laterales con ranuras por peso, y equipamiento real por estación: rack de sentadilla con J-cups, banco con uprights y bloques bajos para peso muerto. La barra se mueve a la altura real de cada movimiento y apoya en soportes con collider.
- Verificación de las cinco fases: `npm run dev` sin errores en consola, `npm run typecheck` y `npm run build` OK. Se probó con CDP el cambio de estación, el vuelo de cámara, el arrastre de un disco de 25 kg desde el rack, la descarga, los presets de auto-carga, el reset y mobile 390×844. Quedan 2 warnings internos de librerías y 1 warning de bundle grande (detallados abajo).

**Cómo correr el proyecto:**

```bash
npm install       # solo la primera vez, o si cambia package.json
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # typecheck + build de produccion -> carpeta dist/
npm run typecheck # solo chequeo de tipos
npm run preview   # sirve dist/ localmente para probar el build
```

- Requiere Node v26.13.0 y npm 11.20.0 (entorno actual).
- En la terminal del usuario se escribe `npm`. En la shell de esta sesión, PowerShell tiene bloqueado `npm.ps1`: usar `npm.cmd`.

## Reglas de trabajo (siempre vigentes)

1. Trabajar por FASES. Al terminar cada fase: correr `npm run build` y `npm run typecheck`, arreglar errores y frenar. Explicar qué se hizo, cómo probarlo y qué debería verse. NO empezar la fase siguiente hasta que el usuario diga «seguí».
2. No instalar versiones «de memoria». Verificar siempre con `npm view <paquete> version` y revisar `peerDependencies`. Stack fijo: React 19 + @react-three/fiber v9 + @react-three/rapier v2. NUNCA R3F v10 alpha ni WebGPU: renderer WebGL por defecto.
3. Verificar que `npm run dev` corre sin errores en consola antes de dar una fase por terminada.
4. Pocas piezas: no sumar librerías que no hagan falta. Si se quiere sumar una, decírselo al usuario y explicar por qué.
5. Si algo es ambiguo, preguntar (máx. 3 preguntas juntas). Si es chico, asumir y listar el supuesto.
6. Anotar en este archivo las decisiones y convenciones a medida que se toman.

## Idioma y estilo

- Explicaciones al usuario: español simple (el usuario es frontend jr, sin experiencia en 3D ni física).
- Código, nombres de archivos, identificadores y comentarios: inglés.
- Components en PascalCase, hooks y funciones en camelCase, archivos de componentes en PascalCase, utils en camelCase.
- Un componente por archivo. Props tipadas con `type`. Sin `any`.
- R3F: geometría y materiales como JSX (`<boxGeometry />`, `<meshStandardMaterial />`), sin `new THREE.*` en el render salvo que sea estrictamente necesario.

## Decisiones de setup (FASE 0)

- Proyecto creado manualmente (sin `npm create vite`) para no borrar la carpeta `references/` que ya existía con imágenes de referencia.
- Entorno: Node v26.13.0, npm 11.20.0. PowerShell del sistema tiene deshabilitado `npm.ps1`: usar siempre `npm.cmd` desde la shell (el usuario puede usar `npm` normal en su terminal).
- Versiones verificadas con `npm view` el 2026-11-23. Se fijaron versiones exactas en `package.json` (sin `^`) para que el build sea reproducible:

  | Paquete | Versión | Motivo / peers |
  | --- | --- | --- |
  | react / react-dom | 19.3.1 | R3F 9 pide `react >=19 <19.4` |
  | @react-three/fiber | 9.8.2 | peer de drei y rapier v2 |
  | @react-three/rapier | 2.2.0 | peers: react ^19, three >=0.159, fiber ^9.0.4 |
  | @react-three/drei | 10.7.9 | peers: react ^19, three >=0.159, fiber ^9 |
  | @react-three/postprocessing | 3.2.2 | peer: fiber >=9.7.0, postprocessing ^6.36.0 |
  | postprocessing | 6.39.6 | peer directo del paquete anterior |
  | three / @types/three | 0.187.0 | tipos alineados con la lib |
  | zustand | 5.1.0 | estado global mínimo |
  | gsap | 3.15.1 | cámara y UI (fases siguientes) |
  | vite | 8.3.8 | plugin-react 6 pide vite ^8 |
  | @vitejs/plugin-react | 6.3.0 | — |
  | tailwindcss / @tailwindcss/vite | 4.3.5 | v4 se configura con plugin de Vite, no con `tailwind.config.js` |
  | typescript | 5.9.3 | se eligió el último estable de la serie 5 (la latest global es 7.0.2, demasiado reciente para este toolchain) |

- Todas las dependencias del stack se instalaron en FASE 0 (setup) para detectar incompatibilidades de peers de una vez. No se agregó ninguna librería fuera del stack pedido.
- Tailwind v4 se usa SOLO en el overlay HTML. Se importa con `@import "tailwindcss";` en `src/index.css` y se registra como plugin en `vite.config.ts`.
- WebGL por defecto: `<Canvas>` sin `gl` custom (no WebGPU). DPR limitado a `[1, 2]` desde ya.
- Física: `timeStep={1 / 120}`, `interpolate`, gravedad real `-9.81 m/s²`. Rapier usa metros y kg.
- Fallback incluido desde FASE 0 (requisito base): sin WebGL o con `prefers-reduced-motion`, se muestra `public/fallback.svg` + descripción, sin canvas.
- SEO base desde FASE 0: `<title>`, meta description, Open Graph, `<h1>` en el DOM (dentro del overlay React) y `<noscript>` con contenido real.
- `public/favicon.svg` + `<link rel="icon">` en `index.html`: sin esto, el navegador pedía `/favicon.ico` y generaba un 404 en consola.
- `shadows="percentage"` en el `<Canvas>`: en three 0.187 se removió `PCFSoftShadowMap` y el default de R3F generaba un warning.
- Verificación de FASE 0: `npm run dev` levantado en `127.0.0.1:5173`, revisado con Edge headless vía CDP (scripts temporarios fuera del repo, sin instalar dependencias nuevas): 0 errores de consola, `<h1>` presente y `<canvas>` montado. Quedan 2 warnings internos de librerías (THREE.Clock deprecated desde R3F y firma deprecated de `init()` en rapier3d-compat 0.19.2): no son del código propio y no se pueden arreglar desde la app sin bajar versiones.
- El build muestra un warning de chunk >500 kB (three + rapier en un solo bundle). Es esperable en esta fase; se atacará en FASE 6 con lazy loading del 3D.

## Decisiones de FASE 1 (greybox)

- `src/scene/stations.ts` es la única fuente de verdad de las estaciones: id, etiqueta, centro, cámara por defecto, punto de mirada y color de acento. La UI y la cámara leen de ahí.
- Las 3 tarimas miden 2.6 x 2.6 m y tienen 0.15 m de alto (`src/scene/dimensions.ts`). Van separadas en X (-3.4, 0, 3.4) para que cada estación tenga su propio espacio.
- `CameraRig` no mueve la cámara con teletransporte: interpola parámetros orbitales (azimuth, polar, radio) con GSAP y en cada frame arma la posición con `Spherical` alrededor del punto de mirada. Así el vuelo y la órbita usan el mismo mecanismo y no se pelean.
- Órbita limitada: azimuth ±55° alrededor del ángulo propio de cada estación, polar entre 35° y 85°, radio entre 2.6 y 8 m. Mouse: arrastre + rueda. Touch: arrastre con un dedo + pellizco con dos.
- El drag de cámara usa eventos nativos `pointer` sobre el canvas con `setPointerCapture` y `touch-action: none`. En FASE 3 se desactiva mientras se arrastra un disco (`src/physics/interaction.ts`) para que no compita.
- Los props de las estaciones (rack, banco, línea) son solo visuales por ahora: no tienen collider. Los soportes reales con altura regulable llegan en FASE 4.
- La tarima y el piso sí tienen `CuboidCollider` fijos: cuando aparezca la barra en FASE 2 ya va a poder apoyarse.
- El overlay de estaciones usa `aria-pressed` y botones nativos, así que funciona con teclado y con touch sin lógica extra.

## Decisiones de FASE 2 (barra y discos)

- Verificación con el reglamento oficial **IPF 2026** (vigente desde 01/03/2026, v3): barra ≤ 2.2 m, distancia entre caras de collar 1.31–1.32 m, diámetro del eje 28–29 mm, diámetro de manga 50–52 mm, barra + collares 25 kg, discos grandes ≤ 45 cm, agujero 52–53 mm, marcas de agarre a 81 cm. Fuente: `https://www.powerlifting.sport/rules/codes/info/technical-rules`.
- **Supuesto listado:** el usuario pidió «agujero de 50 mm», pero eso es el diámetro de la manga. Se usa agujero de **52.5 mm** (dentro de 52–53 mm de IPF) para que el disco entre realmente en la manga de 50 mm.
- **Paleta elegida por el usuario:** se usa su lista (25 rojo, 20 azul, 15 amarillo, 10 verde, 5 blanco; fraccionarios 2.5 rojo, 2 azul, 1.5 amarillo, 1 verde, 0.5 blanco). Ojo: es convención IWF; IPF 2026 solo fija 25 rojo / 20 azul / 15 amarillo y deja «10 kg y menos a cualquier color». Además IPF usa 1.25 kg en vez de 1 kg y los discos 2/1.5/1/0.5 son solo para intentos de récord. Queda documentado, no es un error de código.
- `createPlate(kg)` en `src/objects/createPlate.ts` devuelve una spec inmutable (diámetro, espesor, color, label, holeRadius). Diámetros: 450 mm para 5–25 kg; 210/195/180/160/135 mm para 2.5/2/1.5/1/0.5 kg. Espesor calculado con densidad del acero (7850 kg/m³), con mínimo de 6 mm para que los discos livianos no queden invisibles.
- Knurling: `src/objects/knurling.ts` genera un **normal map procedural** con canvas (patrón de rombos + derivadas finitas), sin archivos de imagen. Se repite 4x24 en el eje.
- Grabado «MESHFORM»: textura de canvas transparente con contorno oscuro (legible también en discos blancos) aplicada en dos planos apenas separados de cada cara del disco. No es texto 3D real: es relieve simulado, suficiente para esta fase.
- Masa física exacta: cada disco lleva `mass={kg}` en su `CylinderCollider`; los collares `mass={2.5}`; la barra usa tres colliders compuestos con una densidad calculada para sumar exactamente 20 kg. Todo con `ccd` activo.
- Demo de FASE 2: una barra, 10 discos (uno por peso) y 2 collares sueltos en el piso frente a la tarima SQUAT. El botón «Reset physics» remonta el grupo con `key={physicsResetToken}` para respawnear. En FASE 3 esa demo se reemplazó por el stock infinito y la carga real por manga.
- Giro de discos: en FASE 2 los discos sueltos se spawneaban acostados (eje vertical) para que no rueden solos. En FASE 3 el asistente de carga alinea el eje con la manga (eje horizontal).

## Decisiones de FASE 3 (carga y descarga)

- **Stock infinito:** los 10 discos y 2 collares del estante son solo visuales (sin `RigidBody`). Al arrastrarlos se crea un «fantasma» y, al soltarlo sobre la manga, ese fantasma se convierte en un collider de la barra. El stock nunca se agota. Es el supuesto que ya estaba previsto en FASE 2.
- El arrastre usa un plano horizontal a la altura de la barra (`0.525 m`). Se considera snap si el punto está a menos de 0.6 m en Z y 1.25 m en X del centro de la barra; el lado (left/right) lo decide el signo de X. Un **toque sin movimiento** carga en el lado derecho por defecto, así funciona también en touch.
- Mientras se arrastra un disco, `src/physics/interaction.ts` bloquea el drag de cámara de `CameraRig` para que no compitan por el mismo puntero.
- Las guias de carga/descarga se animan en `useFrame` con `startedAt` + `duration` e interpolan posición y quaternión (`GuideGhost`), sin sumar librerías ni meter GSAP en el ciclo de física. Al terminar, `completeGuide` agrega o quita el item del store.
- **Colliders compuestos:** cada disco/collar cargado es un `CylinderCollider` hijo del `RigidBody` de la barra, con `mass={kg}` y rotado 90° en Z para alinear su eje con la manga. La masa del cuerpo crece sola: 20 kg de barra + discos + 2.5 kg por collar. Por eso el overlay muestra el peso total correcto sin tener que recalcular la física a mano.
- La barra descansa sobre **dos soportes fijos temporales** en FASE 3, a 0.525 m de altura. Eso deja libre el disco grande (radio 0.225 m) por encima del piso. En FASE 4 se reemplazan por los soportes reales de cada estación.
- **Descarga:** clickear un disco o collar cargado lo anima de vuelta a su posición del stock. No se suelta como cuerpo dinámico para no acumular objetos sueltos en el piso. `Unload all` hace lo mismo en cascada, y `Reset` remonta `LoadingScene` y limpia el store (`useLoadingStore`).
- **Auto-carga:** los botones 100/140/200/250 kg descuentan los 25 kg de barra + collares, reparten el resto en mitades simétricas y llenan cada manga de mayor a menor disco, con los collares al final. Las guias arrancan escalonadas 170 ms. Ojo: hay que ordenar con `sort((a, b) => b - a)`; usar `reverse()` sobre `PLATE_WEIGHTS` cargaba de menor a mayor y dejaba pesos parciales (bug detectado y corregido en esta fase).
- El overlay muestra peso total y peso por lado (`L` / `R`), además de los botones de estación, presets, descarga, reset y cámara.
- En móvil los presets de auto-carga funcionan igual (verificado con viewport 390x844). El arrastre de discos depende del encuadre de cámara; se afinará en FASE 6 junto con performance/mobile.

## Decisiones de FASE 4 (plataforma y estaciones)

- El usuario pidió una puesta en escena de competencia real. Se corroboró con el reglamento **IPF 2026**: plataforma de 2.5–4.0 m de lado, **≤10 cm** de altura, superficie plana y alfombrada (no goma). Se eligió **3.2 x 3.2 m x 0.06 m** con superficie textil y franja de marca. Después se ajustó a **60 mm**, igual que la plataforma Eleiko IPF, y se agregaron dos alas laterales de goma amortiguadora (~1.35 m cada una) para los racks de discos: el conjunto mide ~5.2 m de ancho, como el equipo real.
- Antes se usaban 3 tarimas separadas (FASE 1). Se reemplazan por **una sola plataforma central**, como en un campeonato: al cambiar de estación cambia el equipamiento y la altura de la barra, no el lugar.
- Se consultaron fichas de racks de competencia (Eleiko WPPO, EliteFTS Heavy Duty Meet Storage Rack). Se usa **un rack a cada lado de la plataforma** con los discos parados en ranuras separadas por peso y lugar para los collares. Cada rack tiene un juego completo de 0.5–25 kg; el disco cargado vuelve al rack del lado correspondiente.
- Los discos del rack quedan parados por peso, con el eje hacia la cámara (eje Z local) y los racks ligeramente girados hacia la plataforma. En el reglamento los discos se guardan de canto con el normal hacia la barra; acá se giran un poco para que los colores se lean desde la cámara frontal (licencia visual pedida por el usuario). El stock sigue siendo infinito y visual.
- Altura real de la barra por estación, medida desde el piso: sentadilla **1.36 m** (J-cups del combo rack), banco **1.16 m** (mismos uprights), peso muerto **0.285 m** (radio de un disco de 450 mm sobre la tarima de 60 mm). En peso muerto hay dos apoyos bajos solo para la barra vacía; se ocultan en cuanto hay discos cargados, porque los discos apoyan directo en la tarima.
- `src/scene/stations.ts` es la única fuente de verdad: ahora incluye `bar` por estación. `getBarPosition(id)` la usan la escena, la física y el store, así que el snap y las guias siguen a la barra cuando cambia de estación.
- `Barbell` se remonta con `key={activeStation}` para que el cuerpo rígido nazca en la nueva altura. El peso cargado se conserva al cambiar de estación.
- `StationProps` ahora tiene `RigidBody` con colliders en los apoyos, por eso se movió **dentro de `<Physics>`** en `Scene.tsx` (fuera daba el error `useRapier must be used within <Physics />`).
- No se agregaron librerías nuevas. Se reutiliza la textura procedural de `MESHFORM` (`plateTexture.ts`) para la marca en la tarima.
- **Refinamiento profesional (mismo FASE 4, a pedido del usuario):** se investigaron(IPF 2026 + fichas Eleiko/Rogue/ATX) las medidas reales. Barra: eje 28–29 mm, manga 50 mm, between-collars 1.31 m, marcas de agarre a 810 mm, knurl central de 120 mm y dos zonas de 160 mm, hombro cónico y surcos en la manga. Rack de sentadilla: montantes cuadrados de 75 mm con agujeros cada 25–50 mm, base ancha, J-cups en U con forro y safety straps. Banco: almohadilla 1.22 x 0.30 m con la cara superior a **0.43 m del piso** (IPF 420–450 mm), brazos de seguridad y uprights con J-cups. Racks de discos: cuadro de acero con 4 postes, pernos cromados y divisores por peso; grandes arriba y cambios abajo.
- **Bug del disco al medio (arreglado):** `nextPlateX` devuelve `null` cuando la manga se llena, pero el código convertía ese `null` en `x = 0` y el Fantasma se confirmaba en el centro de la barra. Ahora `Drag.targetX` es `number | null`, el commit se descarta si no hay lugar, y `autoLoad` saltea items sin slot. Verificado: 24 toques cargan 17 discos de 25 kg por lado (445 kg total) y el siguiente toque no cambia el peso ni genera disco central.
- El overlay pasó los botones al fondo (`mt-auto`) porque con el nuevo encuadre quedaban tapando los discos del rack derecho y los clicks caían en el preset `200`. Cámaras alejadas (radio ~7 m) para que ambos racks entren en cuadro.
- **Combo rack real (pedido del usuario):** se reemplazaron `SquatRack.tsx` y `CompetitionBench.tsx` por un único `ComboRack.tsx`, como el Eleiko IPF Competition Combo Rack que se usa en Sheffield V. Los mismos montantes de 75 mm con agujeros sostienen los J-cups de sentadilla y banco; el pad y los brazos de seguridad aparecen solo en banco, y las safety straps solo en sentadilla. El pad queda a 0.43 m del piso. La barra de sentadilla pasó de z=-0.35 a z=0 para estar sobre el mismo rack; todo el snap lee `stations.ts`, así que no hizo falta tocar la física.
- **Racks de discos elevados:** se mantuvo la posición de los pernos (para no romper el drag) pero se cambió la base por un cuadro abierto con patas y se agregaron pernos con leve inclinación y punta redonda cromada, imitando los tubos curvados del rack Eleiko. Cada peso lleva una etiqueta numérica procedural.

## Decisiones de FASE 5 (look dev)

- El usuario pasó 11 fotos nuevas y pidió el venue tipo Sheffield V. **Ningún modelo de esta sesión tiene soporte de imágenes**, ni el principal ni los subagentes: las fotos no se pudieron ver. El diseño surgió de research web (página oficial de Sheffield V, SBD, Eleiko, IPF 2026 y cobertura de la edición anterior) y del OCR de los overlays de broadcast de las propias fotos. En el último pedido el usuario dejó un croquis (`references/Lugar de la compe powerlifting.png`); se leyó con OCR local (RapidOCR en temp, **no** dependencia del proyecto): dice `publico` arriba y a los lados, `Rack, sentadilla, peso muerto, banca` al centro y `pantalla con las clasificaciones de los top` abajo/al frente.
- Datos confirmados usados: escenario oscuro, wordmark gris claro, rojo SBD `#e40521`, equipamiento charcoal con cromo, tarima Eleiko de 60 mm, combo rack, tabla IPF con `RANK / SCORE / TOTAL`, público en gradas y beams de luz. **No se usaron logos reales**: el wordmark propio es `MESHFORM V` y la tabla usa nombres ficticios.
- `Venue.tsx` agrega: LED wall ancha, público instanciado (~500 siluetas + puntitos de celulares) y dos trusses con fixtures emisivos. La posición de la pantalla y el panel de jueces se corrigieron después (ver «Correcciones finales»).
- `venueTextures.ts` genera el contenido del LED y de la tabla con canvas, sin archivos de imagen ni librerías nuevas. Las texturas se cachean en módulo.
- El scoreboard físico lateral y el panel de jueces se corrigieron primero y después se eliminaron del todo en el refinamiento final; la única tabla visible es la del LED.
- **Postprocesado:** `EffectComposer` con `Bloom` (threshold 0.6, intensity 1.05, mipmap blur) y `Vignette` suave (offset 0.34, darkness 0.45). Ojo: en `@react-three/postprocessing` 3.2.2 la prop es `enableNormalPass`, **no** `disableNormalPass` (ese nombre viejo rompe el typecheck). No se agregó ninguna librería: ya estaban en el stack.
- **Partículas:** `<Sparkles>` de drei, 70 motas cálidas en un volumen de 9 x 4.5 x 5 m sobre la tarima, opacidad 0.32. Es polvo en el aire, no nieve.
- **Audio WebAudio nativo** (`src/audio/audioEngine.ts` + `useAudioFeedback.ts`): ambiente de arena, golpe metálico por disco, click de collar y aplauso cuando caen 3+ discos seguidos. Se desbloquea con el primer `pointerdown`/`keydown`, tiene botón **Sound on/off** en el overlay y no usa archivos ni librerías. Los efectos se disparan desde un `subscribe` al store, no desde los componentes 3D.
- **Ajuste de luminancia:** el primer render medía ~0.07 de luminancia media en LED/scoreboard y el público casi no se veía. Se subieron los colores de las texturas procedurales, el fondo del LED, el brillo de las siluetas, la cantidad de luces de celular (1 cada 7 butacas) y el radio de los fixtures. Sin tocar la física ni la cámara.
- **Bugs de carga encontrados y corregidos al probar (pedido del usuario):**
  1. Cargar el collar **antes** que los discos dejaba el collar solapado con el primer disco. Se agregó `reflowCollars()` en `loadingSpecs.ts`: cada vez que cambian los discos, los collares se recolocan por fuera de la manga.
  2. Cargar a mano mientras una autocarga tenía guias en vuelo podía duplicar un disco en la misma X. `completeGuide()` ahora **recalcula** la X al aterrizar (`nextPlateX`) en vez de confiar en la X guardada en la guía, y `autoLoad` saltea las guías sin slot. Verificado: doble preset, carga manual durante preset, descarga durante preset y manga llena (445 kg, 0 solapes, 0 discos en el centro).
- En dev, después de que Vite optimiza `@react-three/drei` y `@react-three/postprocessing`, aparece el warning `THREE.WARNING: Multiple instances of Three.js being imported.` Es un artefacto del optimizer en desarrollo; no aparece errores en consola ni afecta al build de producción. Se documenta para no confundirlo con un bug.

## Refinamiento final de FASE 5 (pedido del usuario)

- **Pantalla grande con resultados reales:** se descartaron los nombres ficticios y el scoreboard físico lateral. `getResultsTexture()` dibuja en el LED las 6 mejores mujeres y los 6 mejores hombres de la competencia real del sábado 21/11/2026. Fuente: `https://www.openipf.org/m/ipf/2608`, consultado el 23/11/2026. Se muestran mejor squat/bench/deadlift, total y puntos GoodLift; no se usaron logos reales.
- **Luces de juez sacadas:** se eliminó `JudgeLights` y su panel rojo/blanco del todo, porque el usuario no sabía qué era y no le gustaba. Quedan los beam/spots rojos del venue, que son iluminación de escenario, no señal de jueces.
- **Gradas y público mejoradas:** ahora hay 8 filas traseras + 5 laterales por lado con InstancedMesh de cuerpo, cabeza y luces de celular, escalas y colores determinísticos, y bloques de grada escalonados. El público subcuenta por encima del LED y en los laterales; sigue siendo barato en draw calls.
- **Audio rediseñado:** el golpe de disco ya no es un beep: combina un thud grave, parciales metálicos inarmónicos, ruido de contacto, slap de piso y rebote; el peso cambia tono y volumen. El collar tiene doble click, la descarga tiene un whoosh corto y el aplauso mezcla subida de ruido rosa con ~22 paladas distribuidas. Ambiente = murmuración con LFO lenta, aire, pad cálido y hum eléctrico. Todo pasa por compresor + reverb convolucional generado en memoria: 0 archivos y 0 librerías nuevas.
- **Discos más profesionales:** paleta IPF levemente oscurecida para que se lea el relieve; `getPlateFaceTexture(kg, color)` genera por peso una cara con anillos mecanizados, marca, número grande y `CALIBRATED`; `PlateVisual` suma borde negro, anillo decorativo y cubo cromado. `getPlateLabelTexture()` se conserva solo para la marca de la tarima en `Stage.tsx`.
- **HUD rearmado:** tarjeta de marca + total con barras L/R arriba, y panel inferior con 3 grupos (Station / Quick load / Controls). Los presets ahora dicen `100 kg`, `200 kg`, etc., y se marcan como activos cuando el total coincide. `Camera` reemplaza a `Reset camera`. Mantiene `aria-pressed`, `aria-live`, `progressbar`, foco visible y targets táctiles grandes; en móvil el panel pasa a 2 columnas.

## Correcciones finales (pedido del usuario)

- **Cámara 360 real:** se sacó el límite de ±55° de azimuth en `CameraRig.tsx`. El drag horizontal ya no tiene tope y puede dar vueltas infinitas; el polar queda entre 12° y 88° para no atravesar el piso. El vuelo entre estaciones usa `shortestAngle()` para no girar de más. Radio máximo subido a 10 m. Verificado con CDP: 8 drags seguidos recorrieron varias vueltas completas y la cámara pasó por ambos lados de la tarima.
- **Pantalla al frente:** según el croquis del usuario, el LED de resultados se movió de z=-5.4 a **z=+5.2 con rotation Y=π**, mirando a la cámara inicial. Las cámaras de las 3 estaciones se pasaron al lado del público (z negativo). Se agregaron marco, base y dos bloques de grada delanteros a los costados de la pantalla. El OCR del screenshot confirmó que `SHEFFIELD V 2026` y los nombres/top se leen de frente.
- **Racks de discos reorientados:** `RACK_YAW` ahora apunta ~π para que las caras y las etiquetas de peso miren a la cámara inicial (antes miraban al lado contrario). El drag sigue funcionando igual porque usa proyección de pantalla.
- **Combo rack rebuild:** la barra atravesaba los montantes porque estaban en z=0, el mismo plano que la barra, y los J-cups estaban a x=±0.75 (sobre la manga, donde cargan los discos). Ahora los montantes están en **z=-0.42** y los J-cups en **x=±0.62** (bajo el eje), con brazo en diagonal desde el montante hasta el cradle. La barra apoya en el collider del J-cup (medido en y=1.37 para sentadilla, 1.17 para banco) y los discos cargan por fuera del hook.
- **Banco y straps:** se sacaron las dos losas raras que hacían de patas y se reemplazaron por **un pedestal central con base en T**, pad IPF de 1.24 x 0.31 m con cara superior a 0.43 m, brazos de seguridad con postes cromados y puntas rojas, y straps de webbing colgantes para sentadilla. Todo con medidas de competition combo rack (montantes 75 mm, crossmembers traseros, feet delanteros/traseros).
- **Discos con tamaños reales:** antes todos los discos grandes medían 450 mm. Ahora `createPlate.ts` usa el size chart IPF/ATX verificado: 25 y 20 kg = 450 mm, 15 = 400 mm, 10 = 325 mm, 5 = 227 mm, y los change plates bajan a 210/195/180/160/135 mm. Espesores reales (23.1/19.2/18.4/18.4/18.8 mm) en vez de densidad estimada; la masa física sigue siendo exacta porque Rapier usa `mass={kg}`. Fuente: size chart de ATX calibrated IPF y technical rules IPF 2026, consultados el 23/11/2026.
- La manga llena pasó de 445 kg a **395 kg** por el espesor real de los discos; sigue sin generar discos en el centro ni solapes. Es el comportamiento correcto con discos calibrados.

## Verificación de FASE 5

- `npm run typecheck` y `npm run build` OK (sigue el warning de bundle >500 kB, se ataca en FASE 6).
- `npm run dev` levantado en `127.0.0.1:5173` sin errores en consola; quedan los 2 warnings internos conocidos de THREE.Clock y rapier.
- Con CDP se verificó después del refinamiento: arrastre real de 25 kg, llenado de manga hasta 395 kg sin disco central, toque extra sin cambio, presets 100/140/200/250, cambio de las 3 estaciones, descarga completa, toggle de sonido, mobile 390x844 con preset funcional. 0 errores.
- Después de las correcciones finales se repitió la regression con proyección de pantalla desde el store de R3F: cámara 360 (8 drags, vueltas completas y `Camera` vuelve a [0.9, 3, -6.4]), barra apoyada en los J-cups (y=1.37 sentadilla / 1.17 banco), LED leído por OCR desde la cámara inicial, drag/presets/estaciones/descarga/móvil OK. 0 errores.
- Se instrumentó WebAudio con CDP: antes del gesto 0 contextos; después del preset 100 kg, 1 `AudioContext`, 44 osciladores, 45 buffer sources, 45 filtros y 1 convolver. Confirma que el nuevo grafo suena y se descarta el build silencioso.
- Se midió la imagen renderizada por `gl.readPixels` por regiones (LED, público, centro, piso) para ajustar el brillo sin poder ver las fotos.

## Decisiones de FASE 6

- **Barra estable con carga pesada:** `Barbell.tsx` mantiene física real (gravedad, contacto con los J-cups, rotación y rebote), pero agrega `linearDamping={0.9}`, `angularDamping={1.5}` y un `useBeforePhysicsStep` que aplica un impulso suave **solo en X/Z** hacia la columna de la estación, con ganancia 12 y amortiguación 5. No toca Y: la barra puede subir, caer y golpear. Los J-cups llevan dos paredes laterales con collider para que no se escape un hook durante la carga. Verificado: 250 kg y 395 kg quedan en X=0, Z=0 e Y≈1.37, sin drift.
- **Resultados reales y scrolleables:** `src/data/results.ts` tiene las 12 mujeres y los 12 hombres finales de Sheffield V 2026 (OpenIPF, kg, consultado el 23/11/2026). `venueTextures.ts` dibuja 6 por página, con bandera, nombre, SQ/BP/DL, total y GLP. El LED pasa de página con rueda o arrastre vertical y tiene auto-scroll cada 8 s que se pausa al pasar el mouse. `src/ui/ResultsPanel.tsx` abre una tabla accesible con `role="dialog"`, pestañas Women/Men, 12 filas scrolleables, `Escape` para cerrar y banderas en cada fila. `Overlay` muestra además una bandera por nación participante.
- **Banderas sin librerías:** `src/data/flags.ts` dibuja las 12 banderas presentes (CAN, BEL, NZL, USA, ITA, FRA, ENG, SWE, POL, TTO, ALG, NOR) con canvas. `FlagIcon` reutiliza el mismo dibujo en HTML, así que no hay imágenes nuevas ni dependencias. No se usaron logos reales.
- **Rack de discos:** se rearmó `PlateRack.tsx` como árbol de competencia: discos grandes (5–25 kg) abajo, change plates (0.5–2.5 kg) en una fila alta separada, collares al final de esa fila, cuadro de 4 postes, divisores y pernos cromados con punta redonda. `dimensions.ts` separa los centros (0.32 m y 0.92 m) para que los discos chicos ya no queden superpuestos con los grandes. **Supuesto:** el usuario pasó `references/SOPORTE DE DISCOS.png`, pero el modelo no pudo ver imágenes; OCR/OpenCV no dio una lectura confiable. Se siguió el estándar IPF/Eleiko de bandeja baja + change plates altos, sin tocar las posiciones que usa el drag.
- **Audio de competencia:** `audioEngine.ts` suma `playCrowdTalk()` (sílabas filtradas, sin voces ni archivos), `playCheer()` (aplausos + silbidor ascendente) y un `setTimeout` que reparte murmuraciones y reacciones cada 2.6–6.8 s. `useAudioFeedback.ts` dispara un cheer grande al pasar 200 kg totales. Sigue siendo WebAudio puro, con mute y socket único.
- **Performance y fallback:** `App.tsx` carga `Scene` con `lazy()`/`Suspense`, así que Three/Rapier/postprocessing no bloquean el primer paint ni el fallback sin WebGL / `prefers-reduced-motion`. `scene/performance.ts` baja DPR a `[1, 1.25]`, shadow map a 512 y Sparkles a 28 en pantallas angostas o dispositivos de 4 núcleos / 4 GB. El chunk inicial pasó de 3.65 MB a 638 kB (gzip 182 kB); el 3D queda en un chunk aparte de 3.03 MB.
- **SEO y deploy:** `index.html` agrega `robots`, `og:site_name`, `og:locale`, `og:image`, Twitter cards y `<meta name="description">` existente. `vercel.json` fija Vite, `npm run build` y `dist`. Se agregó `README.md` con controles y pasos de deploy. No se sumaron librerías nuevas.

## Verificación de FASE 6

- `npm run typecheck` y `npm run build` OK. Sigue el warning de chunk >500 kB, ahora limitado al chunk lazy del 3D; es esperable porque three + rapier + postprocessing viajan juntos.
- `npm run dev` levantado en `127.0.0.1:5173` y verificado con Edge headless + CDP: 0 errores de consola. Quedan los warnings internos conocidos de `THREE.Clock` y rapier, más el de múltiples copias de three del optimizer en dev.
- Regression CDP: barra en X=0/Z=0 e Y=1.37 con preset de 250 kg y con manga llena a 395 kg; panel de resultados con 12 filas, 12 banderas, scroll real, pestaña Men y cierre con `Escape`; LED cambia de página con rueda; audio con 1 `AudioContext`, 199 osciladores, 214 buffer sources y 1 convolver, con actividad de público después de 9 s; mobile 390×844 con preset 200 kg y panel de resultados funcional. 0 errores.

## Correcciones pedidas después de FASE 6

- **Tabla según `references/NUEVA TABLA.png`:** el usuario pasó una segunda imagen porque la primera repetía `BENCH`. El OCR de la nueva imagen dio el formato exacto: encabezado `MF / STANDINGS` con bloque rojo a la derecha, y columnas `PLACE / NAME / CLASS / SQUAT / BENCH / DEADLIFT / TOTAL / % OF WR`. Se rehízo `venueTextures.ts` con dos tablas apiladas ( Women y Men ), 6 filas por página y bandera delante del nombre. `ResultsPanel.tsx` usa las mismas columnas y ahora forcea scroll con `max-h-[46vh]` (verificado: 486 px de contenido en 372 px de contenedor).
- **Datos de la tabla:** `src/data/results.ts` incorpora `className` y `wr`. Los valores de `% OF WR` de los 12 hombres y las primeras mujeres salen del OCR de la imagen; los que el OCR no leyó se marcan con `*` y son estimados a partir de la escala visible. Se conservan los mejores intentos del CSV oficial de OpenIPF. El orden de mujeres sigue el de la imagen de referencia (Sonita primera); el de hombres coincide con el puesto oficial.
- **Bandera de EE.UU.:** `flags.ts` dibuja ahora 7 franjas rojas anchas, cantón azul grande y 6 estrellas grandes en vez de estrellas diminutas. Medido con canvas de 32×20: 151 px rojos, 100 azules y 5 blancos, contra 640 px totales. El borde de todas las banderas subió a 0.6 de opacidad.
- **Portadores de discos:** en `dimensions.ts` los racks pasaron de mirar al público (`yaw ≈ π`) a **alinearse en línea recta sobre los costados** (`left: π/2`, `right: -π/2`), con los pernos apuntando hacia la barra. Verificado en escena: grupos en x=±2.75, z=0.15, yaw=±1.571. `positions.ts` centra la fila de change plates y corrige el comment viejo que decía que los grandes iban arriba.
- **Murmullos de competencia:** `audioEngine.ts` sube el loop de multitud (lowpass 620 Hz, ganancia 0.14), agrega una segunda capa *babble* con bandpass 780 Hz y LFO de 0.31 Hz, y hace que los syllables aparezcan cada 1.2–3.4 s con ganancia 0.035–0.065. Medido con CDP: después de desbloquear hay 58 buffer sources; 6 s después, 60, confirmando que siguen entrando voces del público.

## Verificación de las correcciones

- `npm run typecheck` y `npm run build` OK después de cada cambio.
- `npm run dev` + CDP con 0 errores. La textura del LED se dibujó en un canvas temporal y se leyó por OCR: `MF / STANDINGS`, `PLACE / NAME / CLASS / SQUAT / BENCH / DEADLIFT / TOTAL / % OF WR`, y filas reales (`SONITA MULUH 84+KG 330.5 160 282.5 773 99.9`). El panel HTML tiene 12 filas, 12 banderas, scroll real y cierra con `Escape`.
- La rueda sobre el LED sigue cambiando de página (0 → 1). Audio: 1 `AudioContext`, 1 convolver y actividad nueva de crowd en el tiempo. Mobile 390×844 con preset 100 kg OK.

## Portador de discos rediseñado (pedido posterior a FASE 6)

- El usuario pidió cambiar **solo el objeto** por el modelo de `references/PORTADOR DE DISCOS.png` / `references/portador de disocs.jpg`, manteniendo la posición ya aprobada: `x=±2.75`, `z=0.15`, `yaw=±1.571`, pernos hacia la barra. No se tocaron `rackSlot()`, `stockPlatePosition()` ni el drag.
- **Supuesto:** el modelo no puede ver imágenes (confirmado al intentar leer ambos archivos) y el OCR solo reconoció marcas de disco (`15`, `10`, `GERSEG`). Se rediseñó el rack como árbol de competencia: skids bajos con rueditas, marcos laterales en A con riel superior, rieles de apoyo, pernos cromados con punta redonda y manguito negro, divisores con tapa del color de cada disco y plaquetas de peso más grandes. Si el usuario describe otra forma, se ajusta solo `PlateRack.tsx`.
- Verificado: drag real de 25 kg (20 → 45 kg), manga llena a 395 kg, presets 100/200/250, las 3 estaciones, descarga completa y 0 errores de consola.

## Decisiones de FASE 7 (modelos GLB opcionales)

- No se modelaron GLB en Blender porque no hay assets ni forma de generarlos acá. En cambio se armó **la tubería completa para usarlos**: el proyecto sigue igual sin archivos binarios y el usuario puede droppear modelos después.
- `src/scene/modelAssets.ts` es el manifiesto: rutas `/models/plate-rack.glb`, `/models/combo-rack-squat.glb` y `/models/combo-rack-bench.glb`. Se activa con `VITE_USE_GLB=1` en `.env.local`; por defecto está apagado.
- `src/objects/GlbModel.tsx` hace un `HEAD` previo y revisa el `content-type` (Vite y Vercel responden `index.html` con status 200 para rutas inexistentes, así que mirar solo `response.ok` daría un falso positivo). Si el archivo no es un modelo, renderiza los hijos: la geometría procedural queda como fallback. El modelo se clona con `scene.clone(true)` para que el mismo GLB sirva para ambos racks.
- Se integró en `PlateRack.tsx` y `ComboRack.tsx`. Los colliders, las alturas de barra y las posiciones de carga siguen siendo procedurales: un GLB solo cambia la malla visible.
- No se agregaron librerías: se usa `useGLTF` de drei (ya en el stack). El chunk lazy del 3D pasó de ~3.03 MB a ~3.11 MB por el loader de GLTF; el bundle inicial no cambió.
- Verificado con `npm run typecheck`, `npm run build`, dev + CDP: 0 errores y la misma regresión de carga/estaciones/descarga que en FASE 6.

## Pasada final de cierre (pedido del usuario)

- El usuario pidió publicar para su estudio, sumar publicidad de Meshform Studio, mejorar materiales/sombras/ambiente y fluidez (FPS).
- **Portador horizontal:** era árbol vertical; no gustó. Se rehízo `PlateRack.tsx` como rack horizontal estilo Eleiko/bicicletero: dos skids largos, marcos cuadrados en los extremos, rieles de guardado frontales/traseros en dos alturas y **arcos invertidos entre ranuras** que separan los discos como un estacionamiento de bicis. Posición, yaw, `rackSlot()` y drag intactos. Fuente visual: ficha Eleiko 3085119-060 más la frase del usuario («tipo donde dejan las bicis»).
- **Branding:** `brandTextures.ts` genera un logo procedural (bloque rojo + «MESHFORM» + «3D POWERLIFTING STUDIO») sin imágenes ni fuentes nuevas. Se muestra en el HUD, en la base del LED, en ambos racks de discos y en el combo rack (con placa de fondo), además del `fallback.svg`. Verificado por OCR: `MESHFORM STUDIO · SHEFFIELD V 2026`, `3D POWERLIFTING STUDIO` y `MESHFORM` en la escena.
- **Calidad:** `Scene.tsx` ahora usa `Environment` con tres `Lightformer` procedurales (reflejos de estudio, una sola render), `ContactShadows` estática (un frame), `toneMappingExposure=1.12`, directional con shadow map 2048 en desktop / 512 en low power y spotlights rojo/azul. No se bajó ningún HDR ni se sumaron librerías.
- **Fluidez:** `PerformanceMonitor` de drei ajusta el DPR en caliente según FPS real (baja de 0.25 en 0.25 hasta el piso, sube cuando hay margen; `onFallback` fija 1 o 1.25). Se mantienen DPR máximo 2 en desktop y 1.25 en low power, Sparkles reducidos y shadow map chico en móvil.
- No se agregaron librerías. Typecheck y build OK; CDP con 0 errores; regresión de carga/presets/estaciones/descarga y mobile 390×844 OK. En headless el FPS quedó ~125 (antes ~138) con los nuevos efectos; en pantallas reales el DPR adaptativo compensa.
- **Deploy publicado:** el usuario autorizó el login y se subió todo con `npx vercel@66.6.0 --prod --yes` (CLI temporal vía npx, no se agregó a `package.json`). Proyecto `meshform-powerlifting-3d` en la cuenta `valentins-projects-98b809e3`. URL pública: `https://meshform-powerlifting-3d.vercel.app`. Verificado con CDP sobre la URL de producción: título, `<h1>`, canvas 1256x708, marca en el HUD, 12 botones y 0 errores. Respuesta HTTP 200 sin login.

## Integración con la web del estudio y cierre de marca (pedido posterior)

- El usuario pidió que la demo aparezca en los proyectos de su página `https://meshform-theta.vercel.app/en` y que se suba a su GitHub.
- **Web del estudio:** el proyecto de Vercel `meshform` está linkeado a `https://github.com/valentesta/meshform-web` (privado, branch `main`). Se clonó en temp, se agregó la demo como **segundo caso destacado** en `components/sections/Work.tsx` con dos capturas reales (`public/work/powerlifting-intro.webp` y `powerlifting-loaded.webp`, generadas con CDP desde la demo publicada) y textos EN/ES en `messages/*.json`. El link está en `lib/site.ts` (`cases.powerlifting`). Commit `2a24ab0` pusheado a `main`; la web ya muestra el caso en `/en` y `/es`.
- **Ojo con Vercel + Git:** el primer commit tenía autor `Valen <studiomeshform@gmail.com>` y Vercel lo bloqueó con «couldn't find a Git account for the commit author». Se corrigió con `git commit --amend --author="valentesta <181296513+valentesta@users.noreply.github.com>"` + push forzado; los builds siguientes quedaron READY. Para futuros commits en `meshform-web`, usar ese author o el email de la cuenta de GitHub.
- **Repo de la demo:** se creó `https://github.com/valentesta/meshform-powerlifting-3d` (público, branch `main`) y se subió el proyecto completo con commit `98fa2de`, incluida la carpeta `references/` (14.89 MB) porque AGENTS prohíbe tocarla. El código de la web del estudio sigue en su repo separado.
- **Menos publicidad:** el usuario pidió reducirla y dejar lo esencial. Se reemplazó el logo procedural anterior (bloque rojo + «MESHFORM» + «3D POWERLIFTING STUDIO») por el **mark real de Meshform**: triángulo alámbrico verde menta `#5cffb0` y la palabra `meshform` en minúsculas, copiando el path de `brand/meshform-mark.svg` y `components/ui/Logo.tsx` del repo de la web. Se sacaron las placas de marca de `PlateRack.tsx` y `ComboRack.tsx`, se achicó la base del LED en `Venue.tsx` (de 3.2x0.8 a 2.1x0.525) y se simplificó el `fallback.svg`. Quedan solo el HUD, la base del LED, el stamp de los discos y el fallback; se conservan `MESHFORM V` en el encabezado de resultados y `MESHFORM` grabado en los discos como marca de producto.
- Verificación: `npm run typecheck` y `npm run build` OK (sigue el warning del chunk lazy 3D). Demo redeployada en `https://meshform-powerlifting-3d.vercel.app` (bundle `index-DJUeNGhX.js`); CDP sobre producción: `<h1>` `meshform 3D`, mark SVG presente en el DOM, canvas 1256x708, 12 botones y **0 errores**. La web del estudio respondió con el nuevo caso y sus capturas. No se agregaron librerías.

## Estructura

```
src/scene        -> Canvas, luces, piso, estaciones, Venue, venueTextures, performance, capability checks
src/objects      -> Barbell, Plate, PlateRack, JCup, RackUpright, ComboRack, DeadliftSupports (fases 2 y 4)
src/physics      -> grab, loading, autoload, interaction (fases 3 y 4)
src/data         -> resultados reales y banderas procedurales (fase 6)
src/state        -> zustand store
src/ui           -> overlay HTML, Fallback, FlagIcon, ResultsPanel
src/audio        -> WebAudio (fases 5 y 6)
public/models    -> GLB futuros (fase 7)
references       -> fotos de referencia del usuario (no tocar)
art              -> assets gráficos
```

## Roadmap de fases

- [x] FASE 0 — Setup: Vite + React 19 + TS, dependencias verificadas, AGENTS.md, cubo con física que cae.
- [x] FASE 1 — Greybox: tarima, 3 estaciones, cámaras, luces base.
- [x] FASE 2 — Barra y discos: `createPlate(kg)`, knurling, collares, física en piso.
- [x] FASE 3 — Carga y descarga: drag, snap, colliders compuestos, auto-carga, overlay.
- [x] FASE 4 — Estaciones: rack, banco, plataforma, apoyo real de la barra.
- [x] FASE 5 — Look dev: venue Sheffield V con resultados reales en el LED, gradas/público, discos profesionales, bloom + partículas + audio de gimnasio, HUD nuevo y 2 bugs de carga corregidos.
- [x] FASE 6 — Performance/mobile, SEO, accesibilidad, fallback, deploy Vercel, estabilización de carga, banderas y audio de público.
- [x] FASE 7 (opcional) — Tubería de GLB opcionales con fallback procedural (los archivos `.glb` los puede aportar el usuario; no se modelaron en Blender).
