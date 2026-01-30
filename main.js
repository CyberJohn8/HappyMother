/* =====================================================
   CONFIGURACIÓN DEL CANVAS PRINCIPAL
===================================================== */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* =====================================================
   CANVAS AUXILIAR (ÁRBOL CONGELADO)
   → Evita que el árbol se redibuje infinitamente
===================================================== */
const treeCanvas = document.createElement("canvas");
const treeCtx = treeCanvas.getContext("2d");

treeCanvas.width = canvas.width;
treeCanvas.height = canvas.height;

let treeFinished = false;

/* =====================================================
   VARIABLES DE ESTADO
===================================================== */
let state = "heart"; // heart → sink → tree → text
let heartY = canvas.height * 0.4;
let groundY = canvas.height * 0.78;
let sinkSpeed = 2.5;
let pulse = 1;
let wind = 0;

/* =====================================================
   ELEMENTOS DEL ÁRBOL
===================================================== */
let branches = [];
let leaves = [];
let flowers = [];

/* =====================================================
   TEXTO FINAL (MULTILÍNEA + EFECTO ESCRITURA)
===================================================== */
const finalTextLines = [
  "Happy Birthday Mommy 🌱💖",
  "This time I did remember that it's the 8th",
  "",
  "",
  "",
  ""
];

let currentLine = 0;
let currentChar = 0;
let textTimer = 0;

/* =====================================================
   ESTRELLAS CON MOVIMIENTO SUAVE
===================================================== */
let stars = Array.from({ length: 150 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.5,
  speed: Math.random() * 0.3 + 0.1,
  drift: Math.random() * 0.15 - 0.075
}));

function drawStars() {
  ctx.fillStyle = "white";

  stars.forEach(s => {
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();

    // Movimiento
    s.y += s.speed;
    s.x += s.drift;

    // Reciclaje
    if (s.y > canvas.height) {
      s.y = -5;
      s.x = Math.random() * canvas.width;
    }
  });

  ctx.globalAlpha = 1;
}

/* =====================================================
   CORAZÓN SEMILLA
===================================================== */
function drawHeart(x, y, size, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.strokeStyle = "#ff5c8a";
  ctx.lineWidth = 4;
  ctx.shadowColor = "rgba(255,90,140,0.6)";
  ctx.shadowBlur = 12;

  ctx.beginPath();
  ctx.moveTo(0, -size / 4);
  ctx.bezierCurveTo(size / 2, -size / 2, size, size / 4, 0, size);
  ctx.bezierCurveTo(-size, size / 4, -size / 2, -size / 2, 0, -size / 4);
  ctx.stroke();

  ctx.restore();
}

/* =====================================================
   HOJAS
===================================================== */
function drawLeaf(leaf, context = ctx) {
  context.save();
  context.translate(leaf.x, leaf.y);
  context.rotate(leaf.angle);

  context.fillStyle = "rgba(90,160,110,0.75)";
  context.beginPath();
  context.ellipse(0, 0, leaf.size, leaf.size * 1.6, 0, 0, Math.PI * 2);
  context.fill();

  context.restore();
}

/* =====================================================
   FLORES DE CORAZÓN
===================================================== */
function drawFlower(f, context = ctx) {
  context.fillStyle = "rgba(255,100,150,0.8)";
  context.beginPath();
  context.moveTo(f.x, f.y);
  context.bezierCurveTo(
    f.x + f.s, f.y - f.s,
    f.x + f.s * 2, f.y + f.s / 2,
    f.x, f.y + f.s * 2
  );
  context.bezierCurveTo(
    f.x - f.s * 2, f.y + f.s / 2,
    f.x - f.s, f.y - f.s,
    f.x, f.y
  );
  context.fill();
}

/* =====================================================
   RAMAS DEL ÁRBOL
===================================================== */
function Branch(x, y, length, angle, depth, curve) {
  this.x = x;
  this.y = y;
  this.length = length;
  this.angle = angle;
  this.depth = depth;
  this.curve = curve;
  this.progress = 0;
  this.done = false;
}

Branch.prototype.draw = function (context = ctx) {
  if (this.done) return;

  wind += 0.003;
  const sway = Math.sin(wind + this.y * 0.02) * 0.05;
  const angle = this.angle + sway;

  this.progress += 2;

  context.strokeStyle = "rgba(120,80,40,0.65)";
  context.lineWidth = this.depth;
  context.lineCap = "round";

  context.beginPath();
  context.moveTo(this.x, this.y);

  const cx = this.x + Math.cos(angle) * this.progress * 0.5 + this.curve;
  const cy = this.y + Math.sin(angle) * this.progress * 0.5;
  const x2 = this.x + Math.cos(angle) * this.progress;
  const y2 = this.y + Math.sin(angle) * this.progress;

  context.quadraticCurveTo(cx, cy, x2, y2);
  context.stroke();

  if (this.progress >= this.length) {
    this.done = true;

    if (this.depth > 0) {
      branches.push(
        new Branch(x2, y2, this.length * 0.75, angle - Math.PI / 6, this.depth - 1, this.curve * 0.6),
        new Branch(x2, y2, this.length * 0.75, angle + Math.PI / 6, this.depth - 1, -this.curve * 0.6)
      );
    }

    if (this.depth <= 2) {
      leaves.push({ x: x2, y: y2, size: 4, angle: Math.random() });
      if (Math.random() < 0.25) flowers.push({ x: x2, y: y2, s: 3 });
    }
  }
};

/* =====================================================
   TEXTO FINAL (EFECTO VIDEO)
===================================================== */
function drawFinalText() {
  // Fondo oscuro para legibilidad
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, groundY + 40, canvas.width, 240);

  ctx.fillStyle = "white";
  ctx.font = "24px serif";
  ctx.textAlign = "center";

  let y = groundY + 90;

  for (let i = 0; i < currentLine; i++) {
    ctx.fillText(finalTextLines[i], canvas.width / 2, y);
    y += 32;
  }

  if (currentLine < finalTextLines.length) {
    let line = finalTextLines[currentLine];
    ctx.fillText(line.substring(0, currentChar), canvas.width / 2, y);

    textTimer++;
    if (textTimer > 3) {
      currentChar++;
      textTimer = 0;

      if (currentChar > line.length) {
        currentChar = 0;
        currentLine++;
      }
    }
  }
}

/* =====================================================
   LOOP PRINCIPAL
===================================================== */
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawStars();

  // Suelo
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();

  if (state === "heart") {
    pulse = 1 + Math.sin(Date.now() * 0.005) * 0.06;
    drawHeart(canvas.width / 2, heartY, 40, pulse);
  }

  if (state === "sink") {
    heartY += sinkSpeed;
    if (heartY < groundY) {
      drawHeart(canvas.width / 2, heartY, 40, 1);
    } else {
      state = "tree";
      branches.push(new Branch(canvas.width / 2, groundY, 150, -Math.PI / 2, 11, 40));
    }
  }

  if (state === "tree") {
    // Dibuja progresivamente en treeCanvas
    branches.forEach(b => b.draw(treeCtx));
    leaves.forEach(l => drawLeaf(l, treeCtx));
    flowers.forEach(f => drawFlower(f, treeCtx));
  
    // Dibuja el treeCanvas en el canvas principal cada frame
    ctx.drawImage(treeCanvas, 0, 0);
  
    if (!treeFinished && branches.every(b => b.done)) {
      treeFinished = true;
      state = "text";
    }
  }
  
  // Si el árbol ya terminó, solo dibuja treeCanvas
  if (treeFinished && state !== "tree") {
    ctx.drawImage(treeCanvas, 0, 0);
  }
  

  if (treeFinished) {
    ctx.drawImage(treeCanvas, 0, 0);
  }

  if (state === "text") {
    drawFinalText();
  }

  requestAnimationFrame(animate);
}

/* =====================================================
   INTERACCIÓN
===================================================== */
canvas.addEventListener("click", () => {
  if (state === "heart") state = "sink";
});

animate();
