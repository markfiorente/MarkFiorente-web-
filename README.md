# markfiorente.com

Sitio de presentación profesional de **MarkFiorente** (Mark Gómez): desarrollo
web senior, UX y estrategia digital.

## Stack

- **HTML/CSS/JS vanilla** en un único archivo autocontenido: `index.html`.
- [Three.js](https://threejs.org/) (CDN) — fondo de constelación de partículas.
- [GSAP](https://gsap.com/) + ScrollTrigger (CDN) — animaciones y reveals.
- Tipografía: Playfair Display + Inter (Google Fonts).

## Cómo verlo

Abre `index.html` directamente en el navegador (doble clic). Necesita conexión a
internet para cargar las fuentes y las librerías desde su CDN.

O con un servidor estático local:

```bash
python3 -m http.server 8000   # luego abre http://localhost:8000
```

## Marca

| Token       | Color     | Uso                     |
|-------------|-----------|-------------------------|
| `--orange`  | `#ff7a1a` | Acento principal        |
| `--warm`    | `#ffd0a6` | Texto cálido/destacado  |
| `--bg`      | `#111214` | Fondo base              |
| `--surface` | `#1c1e20` | Tarjetas / superficies  |

## Contacto

- Email: **hablemos@markfiorente.com**
- WhatsApp: botón flotante → **+57 316 473 7941**

## Pendientes (TODO)

- **Proyectos**: los 3 casos usan copy de ejemplo; reemplazar por proyectos reales
  (y enlazarlos si corresponde).
- **Redes**: los enlaces de LinkedIn y GitHub apuntan a `#`; poner las URLs reales.
- **Formulario**: hoy solo muestra confirmación en el cliente (no envía). Conectar
  a un servicio (por ejemplo Formspree) o dejar el contacto por email/WhatsApp.
