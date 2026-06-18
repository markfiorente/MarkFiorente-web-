# markfiorente.com

Sitio estático de presentación profesional de **MarkFiorente** (Mark Gómez):
desarrollo web senior, UX y estrategia digital.

## Stack

- HTML / CSS / JS **vanilla** — sin frameworks, bundlers ni CMS.
- [Three.js](https://threejs.org/) (CDN) — fondo *flow field* animado del hero.
- [GSAP](https://gsap.com/) + ScrollTrigger (CDN) — animaciones de entrada y reveals.
- Ruido simplex implementado *inline* en `js/flowfield.js` (sin dependencias extra).

## Estructura

```
index.html          Markup: nav + 6 secciones (Hero, Servicios, Proceso,
                    Casos, Sobre mí, Contacto) + footer.
css/styles.css      Estilos, mobile-first. Paleta en variables CSS (:root).
js/flowfield.js     Fondo Three.js del hero (líneas que se dibujan solas).
js/main.js          Animaciones GSAP, ScrollTrigger, nav y scroll suave.
```

## Cómo verlo

Abre `index.html` directamente en el navegador (doble clic). Los CDN y las rutas
relativas funcionan en modo `file://`, así que no se requiere servidor local.

Si prefieres un servidor estático:

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Paleta

| Variable        | Color     | Uso                       |
|-----------------|-----------|---------------------------|
| `--c-primary`   | `#454c9b` | Azul/violeta principal    |
| `--c-accent`    | `#da3c8e` | Magenta acento            |
| `--c-second`    | `#6fc1ed` | Azul claro secundario     |
| `--c-bg`        | `#0a0a0f` | Fondo base                |

## Contenido pendiente (TODO)

- **Casos seleccionados** (`index.html`, sección `#casos`): hay 3 tarjetas
  placeholder marcadas con `<!-- TODO -->`. Reemplazar título, resumen, resultado,
  enlace e imagen (`.case__media`) por proyectos reales.
- **Sobre mí** y **Contacto**: copy provisional en tono de marca; ajustar datos
  cuando estén definidos.

## Accesibilidad

- Respeta `prefers-reduced-motion`: si está activo, no se inicia la animación 3D
  y el contenido se muestra sin animaciones, totalmente legible.
- El render del hero se pausa cuando la sección sale del viewport o la pestaña
  queda en segundo plano.
