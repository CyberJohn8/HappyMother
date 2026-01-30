const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.strokeStyle = "white";
ctx.lineWidth = 2;

let branches = [];

function Branch(x, y, length, angle, depth) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.angle = angle;
    this.depth = depth;
    this.progress = 0;
}

Branch.prototype.draw = function () {
    if (this.progress < this.length) {
        this.progress += 2;

        const x2 = this.x + Math.cos(this.angle) * this.progress;
        const y2 = this.y + Math.sin(this.angle) * this.progress;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    } else if (!this.done && this.depth > 0) {
        this.done = true;

        const x2 = this.x + Math.cos(this.angle) * this.length;
        const y2 = this.y + Math.sin(this.angle) * this.length;

        branches.push(
            new Branch(x2, y2, this.length * 0.7, this.angle - Math.PI / 6, this.depth - 1),
            new Branch(x2, y2, this.length * 0.7, this.angle + Math.PI / 6, this.depth - 1)
        );
    }
};

function animate() {
    requestAnimationFrame(animate);

    branches.forEach(branch => branch.draw());
}

// Rama inicial (tronco)
branches.push(
    new Branch(
        canvas.width / 2,
        canvas.height,
        120,
        -Math.PI / 2,
        9
    )
);

animate();
