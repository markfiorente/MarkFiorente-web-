/* ===========================================================
   MarkFiorente — flowfield.js
   Fondo Three.js del hero: flow field con ruido (líneas que se
   dibujan solas, lentas y continuas, sin interacción con cursor).
   Sin dependencias extra: ruido simplex implementado inline.
   =========================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.getElementById("flowfield");

  // Sin Three.js o con reduced-motion: el canvas queda como fondo sólido.
  if (!canvas || reduceMotion || typeof THREE === "undefined") {
    return;
  }

  /* ---------- Ruido simplex 2D (compacto, dominio público) ---------- */
  var SimplexNoise = (function () {
    var grad3 = [
      1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
      1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
      0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
    ];
    var p = [];
    for (var i = 0; i < 256; i++) p[i] = Math.floor(Math.random() * 256);
    var perm = new Array(512), permMod12 = new Array(512);
    for (var j = 0; j < 512; j++) {
      perm[j] = p[j & 255];
      permMod12[j] = perm[j] % 12;
    }
    var F2 = 0.5 * (Math.sqrt(3) - 1);
    var G2 = (3 - Math.sqrt(3)) / 6;

    function noise2D(xin, yin) {
      var n0, n1, n2;
      var s = (xin + yin) * F2;
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var t = (i + j) * G2;
      var x0 = xin - (i - t);
      var y0 = yin - (j - t);
      var i1, j1;
      if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
      var x1 = x0 - i1 + G2;
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1 + 2 * G2;
      var y2 = y0 - 1 + 2 * G2;
      var ii = i & 255, jj = j & 255;
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 < 0) n0 = 0;
      else {
        var gi0 = permMod12[ii + perm[jj]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0);
      }
      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 < 0) n1 = 0;
      else {
        var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 < 0) n2 = 0;
      else {
        var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
      }
      return 70 * (n0 + n1 + n2);
    }
    return { noise2D: noise2D };
  })();

  /* ---------- Setup Three.js ---------- */
  var w = window.innerWidth;
  var h = window.innerHeight;

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x0a0a0f, 1);

  // Cámara ortográfica: 1 unidad = 1 px, origen en el centro.
  var camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, -100, 100);
  var scene = new THREE.Scene();

  /* ---------- Parámetros del flow field ---------- */
  var TRAIL = 90;                 // puntos por línea (largo del trazo)
  var NOISE_SCALE = 0.0013;       // escala espacial del ruido (suavidad)
  var SPEED = 0.6;                // velocidad de avance (lenta)
  var TIME_FLOW = 0.00006;        // deriva temporal del campo
  var MAX_OPACITY = 0.22;         // pico de opacidad (rango brief 0.15–0.25)
  var LINE_COLOR = new THREE.Color(0x6fc1ed); // azul claro secundario

  // Densidad baja: escala con el área pero con techo.
  var count = Math.round((w * h) / 18000);
  count = Math.max(34, Math.min(count, 110));

  var tracers = [];

  function spawnPosition() {
    return {
      x: (Math.random() - 0.5) * w,
      y: (Math.random() - 0.5) * h
    };
  }

  function createTracer() {
    var positions = new Float32Array(TRAIL * 3);
    var colors = new Float32Array(TRAIL * 3);
    // Degradado cabeza→cola (efecto cometa): la cabeza brilla, la cola se apaga.
    // Con AdditiveBlending la intensidad del color actúa como opacidad efectiva.
    for (var k = 0; k < TRAIL; k++) {
      var fade = (1 - k / (TRAIL - 1)) * MAX_OPACITY;
      colors[k * 3] = LINE_COLOR.r * fade;
      colors[k * 3 + 1] = LINE_COLOR.g * fade;
      colors[k * 3 + 2] = LINE_COLOR.b * fade;
    }
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    var material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false
    });

    var line = new THREE.Line(geometry, material);
    scene.add(line);

    var start = spawnPosition();
    var pts = [];
    for (var k = 0; k < TRAIL; k++) pts.push({ x: start.x, y: start.y });

    return {
      line: line,
      positions: positions,
      pts: pts,
      x: start.x,
      y: start.y,
      life: 0,
      maxLife: 300 + Math.random() * 400
    };
  }

  function resetTracer(t) {
    var start = spawnPosition();
    t.x = start.x;
    t.y = start.y;
    t.life = 0;
    t.maxLife = 300 + Math.random() * 400;
    for (var k = 0; k < TRAIL; k++) {
      t.pts[k].x = start.x;
      t.pts[k].y = start.y;
    }
  }

  for (var c = 0; c < count; c++) tracers.push(createTracer());

  /* ---------- Animación ---------- */
  var time = 0;
  var running = true;
  var rafId = null;

  function updateTracer(t) {
    var angle = SimplexNoise.noise2D(
      t.x * NOISE_SCALE,
      t.y * NOISE_SCALE + time * TIME_FLOW
    ) * Math.PI * 2;

    t.x += Math.cos(angle) * SPEED;
    t.y += Math.sin(angle) * SPEED;
    t.life++;

    // Trail: desplazar la cola y añadir la cabeza.
    for (var k = t.pts.length - 1; k > 0; k--) {
      t.pts[k].x = t.pts[k - 1].x;
      t.pts[k].y = t.pts[k - 1].y;
    }
    t.pts[0].x = t.x;
    t.pts[0].y = t.y;

    var margin = 80;
    var off = t.x < -w / 2 - margin || t.x > w / 2 + margin ||
              t.y < -h / 2 - margin || t.y > h / 2 + margin;
    if (off || t.life > t.maxLife) {
      resetTracer(t);
    }

    for (var m = 0; m < t.pts.length; m++) {
      t.positions[m * 3] = t.pts[m].x;
      t.positions[m * 3 + 1] = t.pts[m].y;
      t.positions[m * 3 + 2] = 0;
    }
    t.line.geometry.attributes.position.needsUpdate = true;
  }

  function render() {
    time += 1;
    for (var i = 0; i < tracers.length; i++) updateTracer(tracers[i]);
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(render);
  }

  function start() {
    if (!running) return;
    if (rafId === null) rafId = requestAnimationFrame(render);
  }
  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  /* ---------- Resize ---------- */
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      w = window.innerWidth;
      h = window.innerHeight;
      renderer.setSize(w, h);
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
    }, 150);
  });

  /* ---------- Pausar cuando el hero sale del viewport ---------- */
  var hero = document.getElementById("hero");
  if ("IntersectionObserver" in window && hero) {
    var io = new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      running = visible;
      if (visible) start();
      else stop();
    }, { threshold: 0.01 });
    io.observe(hero);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (running) start();
  });

  // Arranque inmediato (el canvas carga antes que el texto).
  start();
})();
