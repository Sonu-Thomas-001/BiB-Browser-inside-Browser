/**
 * BiB 2.0 — Arcade Mini Games
 * Clean, restrained Apple-style Click the Dot and Canvas Dino Runner
 */

"use strict";

(function (window) {
    class GamesManager {
        constructor() {
            this.audioCtx = null;
            this.dotState = {
                score: 0,
                combo: 0,
                timeLeft: 30,
                timerId: null,
                isRunning: false,
                highScore: window.BiB.Storage.get("dot_highscore", 0)
            };

            this.dinoState = {
                canvas: null,
                ctx: null,
                animId: null,
                isRunning: false,
                score: 0,
                highScore: window.BiB.Storage.get("dino_highscore", 0),
                dino: { x: 40, y: 130, w: 22, h: 26, vy: 0, isGrounded: true },
                gravity: 0.65,
                obstacles: [],
                speed: 4,
                spawnTimer: 0
            };
        }

        _getAudio() {
            if (!this.audioCtx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.audioCtx = new AudioCtx();
            }
            if (this.audioCtx && this.audioCtx.state === "suspended") {
                this.audioCtx.resume();
            }
            return this.audioCtx;
        }

        playTone(freq = 440, duration = 0.08, type = "sine") {
            try {
                const ctx = this._getAudio();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(0.06, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + duration);
            } catch (e) {
                // Ignore audio sandbox restrictions
            }
        }

        /* Click the Dot */
        initDotGame() {
            this.dotState.highScore = window.BiB.Storage.get("dot_highscore", 0);
            this.renderDotScore();

            const startBtn = document.getElementById("startDotBtn");
            const arena = document.getElementById("dotArena");

            if (startBtn) startBtn.addEventListener("click", () => this.startDotGame());
            if (arena) {
                arena.addEventListener("click", (e) => {
                    if (!this.dotState.isRunning) return;
                    if (!e.target.classList.contains("dot-target")) {
                        this.dotState.combo = 0;
                        this.renderDotScore();
                    }
                });
            }
        }

        startDotGame() {
            clearInterval(this.dotState.timerId);
            this.dotState.score = 0;
            this.dotState.combo = 0;
            this.dotState.timeLeft = 30;
            this.dotState.isRunning = true;
            this.renderDotScore();

            const arena = document.getElementById("dotArena");
            if (!arena) return;

            arena.innerHTML = "";
            this.spawnDot();

            this.dotState.timerId = setInterval(() => {
                this.dotState.timeLeft--;
                this.renderDotScore();
                if (this.dotState.timeLeft <= 0) {
                    this.endDotGame();
                }
            }, 1000);

            this.playTone(520, 0.1, "sine");
        }

        spawnDot() {
            const arena = document.getElementById("dotArena");
            if (!arena || !this.dotState.isRunning) return;

            arena.innerHTML = "";
            const dot = document.createElement("div");
            dot.className = "dot-target";

            const size = Math.max(26, 40 - Math.min(this.dotState.combo, 8));
            dot.style.position = "absolute";
            dot.style.width = `${size}px`;
            dot.style.height = `${size}px`;
            dot.style.borderRadius = "50%";
            dot.style.backgroundColor = "var(--color-accent)";
            dot.style.cursor = "pointer";
            dot.style.transition = "transform 60ms";

            const maxX = arena.clientWidth - size - 12;
            const maxY = arena.clientHeight - size - 12;
            const x = Math.max(8, Math.floor(Math.random() * maxX));
            const y = Math.max(8, Math.floor(Math.random() * maxY));

            dot.style.left = `${x}px`;
            dot.style.top = `${y}px`;

            dot.addEventListener("click", (e) => {
                e.stopPropagation();
                if (!this.dotState.isRunning) return;
                this.dotState.combo++;
                this.dotState.score += (10 + this.dotState.combo * 2);
                this.playTone(440 + this.dotState.combo * 30, 0.06, "sine");
                this.renderDotScore();
                this.spawnDot();
            });

            arena.appendChild(dot);
        }

        endDotGame() {
            clearInterval(this.dotState.timerId);
            this.dotState.isRunning = false;

            if (this.dotState.score > this.dotState.highScore) {
                this.dotState.highScore = this.dotState.score;
                window.BiB.Storage.set("dot_highscore", this.dotState.highScore);
            }

            const arena = document.getElementById("dotArena");
            if (arena) {
                arena.innerHTML = `
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;">
                        <h4 style="font-size:18px;color:var(--color-text);">Round Finished</h4>
                        <p style="font-size:14px;color:var(--color-text-secondary);">Score: <strong style="color:var(--color-accent);">${this.dotState.score}</strong> pts (Best: ${this.dotState.highScore})</p>
                        <button class="btn btn-primary" id="retryDotBtn" style="margin-top:6px;">Play Again</button>
                    </div>
                `;
                const retry = document.getElementById("retryDotBtn");
                if (retry) retry.addEventListener("click", () => this.startDotGame());
            }

            this.renderDotScore();
        }

        renderDotScore() {
            const scoreEl = document.getElementById("dotScore");
            const timerEl = document.getElementById("dotTimer");
            const bestEl = document.getElementById("dotBest");

            if (scoreEl) scoreEl.textContent = this.dotState.score;
            if (timerEl) timerEl.textContent = `${this.dotState.timeLeft}s`;
            if (bestEl) bestEl.textContent = this.dotState.highScore;
        }

        /* Dino Runner */
        initDinoGame() {
            const canvas = document.getElementById("dinoCanvas");
            if (!canvas) return;
            this.dinoState.canvas = canvas;
            this.dinoState.ctx = canvas.getContext("2d");
            this.dinoState.highScore = window.BiB.Storage.get("dino_highscore", 0);

            const startBtn = document.getElementById("startDinoBtn");
            if (startBtn) startBtn.addEventListener("click", () => this.startDinoGame());

            window.addEventListener("keydown", (e) => {
                if (e.code === "Space" && document.getElementById("dinoCanvas")) {
                    if (this.dinoState.isRunning) {
                        e.preventDefault();
                        this.jumpDino();
                    }
                }
            });

            canvas.addEventListener("click", () => {
                if (this.dinoState.isRunning) this.jumpDino();
                else this.startDinoGame();
            });

            this.drawInitialDino();
        }

        drawInitialDino() {
            const { ctx, canvas } = this.dinoState;
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#E5E5EA";
            ctx.fillRect(0, 158, canvas.width, 2);

            ctx.fillStyle = "#0071E3";
            ctx.beginPath();
            ctx.roundRect(40, 132, 22, 26, [3, 3, 1, 1]);
            ctx.fill();

            ctx.fillStyle = "#86868B";
            ctx.font = "13px -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Press Space or Click to Jump", canvas.width / 2, 85);
        }

        startDinoGame() {
            cancelAnimationFrame(this.dinoState.animId);
            this.dinoState.isRunning = true;
            this.dinoState.score = 0;
            this.dinoState.speed = 4.2;
            this.dinoState.obstacles = [];
            this.dinoState.spawnTimer = 0;
            this.dinoState.dino = { x: 40, y: 132, w: 22, h: 26, vy: 0, isGrounded: true };

            this.playTone(580, 0.08, "sine");
            this.loopDino();
        }

        jumpDino() {
            if (this.dinoState.dino.isGrounded) {
                this.dinoState.dino.vy = -11.5;
                this.dinoState.dino.isGrounded = false;
                this.playTone(360, 0.06, "square");
            }
        }

        loopDino() {
            if (!this.dinoState.isRunning) return;

            const { dino, canvas } = this.dinoState;
            dino.vy += this.dinoState.gravity;
            dino.y += dino.vy;

            if (dino.y >= 132) {
                dino.y = 132;
                dino.vy = 0;
                dino.isGrounded = true;
            }

            this.dinoState.score++;
            if (this.dinoState.score % 250 === 0) {
                this.dinoState.speed += 0.3;
            }

            this.dinoState.spawnTimer++;
            if (this.dinoState.spawnTimer > 85) {
                if (Math.random() > 0.35) {
                    const h = 20 + Math.floor(Math.random() * 16);
                    this.dinoState.obstacles.push({
                        x: canvas.width + 10,
                        y: 158 - h,
                        w: 15,
                        h: h
                    });
                    this.dinoState.spawnTimer = 0;
                }
            }

            for (let i = this.dinoState.obstacles.length - 1; i >= 0; i--) {
                const obs = this.dinoState.obstacles[i];
                obs.x -= this.dinoState.speed;

                // Collision
                if (
                    dino.x < obs.x + obs.w &&
                    dino.x + dino.w > obs.x &&
                    dino.y < obs.y + obs.h &&
                    dino.y + dino.h > obs.y
                ) {
                    this.endDinoGame();
                    return;
                }

                if (obs.x + obs.w < -10) {
                    this.dinoState.obstacles.splice(i, 1);
                }
            }

            this.renderDino();
            this.dinoState.animId = requestAnimationFrame(() => this.loopDino());
        }

        renderDino() {
            const { ctx, canvas, dino, obstacles } = this.dinoState;
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Ground
            ctx.fillStyle = "#E5E5EA";
            ctx.fillRect(0, 158, canvas.width, 2);

            // Dino
            ctx.fillStyle = "#0071E3";
            ctx.beginPath();
            ctx.roundRect(dino.x, dino.y, dino.w, dino.h, [3, 3, 1, 1]);
            ctx.fill();

            // Obstacles
            ctx.fillStyle = "#34C759";
            obstacles.forEach(o => {
                ctx.beginPath();
                ctx.roundRect(o.x, o.y, o.w, o.h, [2, 2, 0, 0]);
                ctx.fill();
            });

            // Score counter in canvas top-right
            ctx.fillStyle = "#86868B";
            ctx.font = "12px -apple-system, sans-serif";
            ctx.textAlign = "right";
            ctx.fillText(`${this.dinoState.score}`, canvas.width - 16, 24);
        }

        endDinoGame() {
            this.dinoState.isRunning = false;
            cancelAnimationFrame(this.dinoState.animId);
            this.playTone(180, 0.2, "sawtooth");

            if (this.dinoState.score > this.dinoState.highScore) {
                this.dinoState.highScore = this.dinoState.score;
                window.BiB.Storage.set("dino_highscore", this.dinoState.highScore);
            }

            const { ctx, canvas } = this.dinoState;
            if (ctx && canvas) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "#1D1D1F";
                ctx.font = "bold 18px -apple-system, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("Game Over", canvas.width / 2, 75);

                ctx.fillStyle = "#6E6E73";
                ctx.font = "13px -apple-system, sans-serif";
                ctx.fillText(`Score: ${this.dinoState.score} • Best: ${this.dinoState.highScore}`, canvas.width / 2, 102);

                ctx.fillStyle = "#0071E3";
                ctx.font = "12px -apple-system, sans-serif";
                ctx.fillText("Click canvas to restart", canvas.width / 2, 130);
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Games = new GamesManager();
})(window);
