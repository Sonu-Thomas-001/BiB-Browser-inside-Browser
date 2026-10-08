/**
 * BiB (Browser inside Browser) — Mini Games
 * Game 1: Click the Dot (Reflex Trainer)
 * Game 2: Browser Dino (HTML5 Canvas Runner)
 */

class MiniGamesManager {
    constructor() {
        this.dotGame = {
            score: 0,
            combo: 0,
            timeLeft: 30,
            timerId: null,
            highScore: 0,
            isRunning: false
        };

        this.dinoGame = {
            canvas: null,
            ctx: null,
            animId: null,
            isRunning: false,
            score: 0,
            highScore: 0,
            dino: { x: 40, y: 130, w: 24, h: 28, vy: 0, isGrounded: true },
            gravity: 0.65,
            obstacles: [],
            speed: 4,
            spawnTimer: 0
        };

        this.audioCtx = null;
    }

    _getAudioCtx() {
        if (!this.audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.audioCtx = new AudioCtx();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    playBeep(freq = 440, duration = 0.08, type = 'sine') {
        try {
            const ctx = this._getAudioCtx();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Ignore audio issues on restricted browser environments
        }
    }

    /* ==========================================================================
       Game 1: Click the Dot
       ========================================================================== */
    initDotGame() {
        this.dotGame.highScore = window.storageManager.get('dot_highscore', 0);
        this.updateDotScoreBoard();

        const startBtn = document.getElementById('startDotGameBtn');
        const arena = document.getElementById('dotArena');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startDotGame());
        }

        if (arena) {
            arena.addEventListener('click', (e) => {
                if (!this.dotGame.isRunning) return;
                // If clicked arena but not target, reset combo
                if (!e.target.classList.contains('dot-target')) {
                    this.dotGame.combo = 0;
                    this.playBeep(220, 0.1, 'sawtooth');
                    this.updateDotScoreBoard();
                }
            });
        }
    }

    startDotGame() {
        clearInterval(this.dotGame.timerId);
        this.dotGame.score = 0;
        this.dotGame.combo = 0;
        this.dotGame.timeLeft = 30;
        this.dotGame.isRunning = true;
        this.updateDotScoreBoard();

        const arena = document.getElementById('dotArena');
        if (!arena) return;

        arena.innerHTML = '';
        this.spawnDotTarget();

        this.dotGame.timerId = setInterval(() => {
            this.dotGame.timeLeft--;
            this.updateDotScoreBoard();

            if (this.dotGame.timeLeft <= 0) {
                this.endDotGame();
            }
        }, 1000);

        this.playBeep(520, 0.12, 'triangle');
    }

    spawnDotTarget() {
        const arena = document.getElementById('dotArena');
        if (!arena || !this.dotGame.isRunning) return;

        arena.innerHTML = '';

        const target = document.createElement('div');
        target.className = 'dot-target game-dot-target';

        const size = Math.max(24, 42 - Math.min(this.dotGame.combo, 10));
        target.style.width = `${size}px`;
        target.style.height = `${size}px`;

        const maxX = arena.clientWidth - size - 10;
        const maxY = arena.clientHeight - size - 10;

        const posX = Math.max(10, Math.floor(Math.random() * maxX));
        const posY = Math.max(10, Math.floor(Math.random() * maxY));

        target.style.left = `${posX}px`;
        target.style.top = `${posY}px`;

        // Color variation based on combo
        const hues = [340, 260, 200, 150, 45];
        const hue = hues[this.dotGame.combo % hues.length];
        target.style.background = `radial-gradient(circle, hsl(${hue}, 90%, 60%) 20%, hsl(${hue}, 90%, 40%) 100%)`;
        target.style.boxShadow = `0 0 16px hsla(${hue}, 90%, 60%, 0.7)`;

        target.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.dotGame.isRunning) return;

            this.dotGame.combo++;
            const points = 10 + this.dotGame.combo * 2;
            this.dotGame.score += points;

            this.playBeep(440 + this.dotGame.combo * 30, 0.08, 'sine');
            this.updateDotScoreBoard();
            this.spawnDotTarget();
        });

        arena.appendChild(target);
    }

    endDotGame() {
        clearInterval(this.dotGame.timerId);
        this.dotGame.isRunning = false;

        if (this.dotGame.score > this.dotGame.highScore) {
            this.dotGame.highScore = this.dotGame.score;
            window.storageManager.set('dot_highscore', this.dotGame.highScore);
            if (window.notificationManager) {
                window.notificationManager.show(`🎉 New Click the Dot Record: ${this.dotGame.highScore} pts!`, 'success');
            }
        }

        const arena = document.getElementById('dotArena');
        if (arena) {
            arena.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;text-align:center;">
                    <h3 style="font-size:22px;color:var(--text-primary);">Time's Up! ⏱️</h3>
                    <p style="font-size:16px;color:var(--text-secondary);">Final Score: <strong style="color:var(--accent);">${this.dotGame.score}</strong> points</p>
                    <p style="font-size:13px;color:var(--text-muted);">Best: ${this.dotGame.highScore} points</p>
                    <button id="retryDotBtn" class="bib-btn bib-btn-primary" style="margin-top:8px;">Play Again</button>
                </div>
            `;
            const retryBtn = document.getElementById('retryDotBtn');
            if (retryBtn) retryBtn.addEventListener('click', () => this.startDotGame());
        }

        this.updateDotScoreBoard();
    }

    updateDotScoreBoard() {
        const scoreEl = document.getElementById('dotScore');
        const timerEl = document.getElementById('dotTimer');
        const comboEl = document.getElementById('dotCombo');
        const highEl = document.getElementById('dotHighScore');

        if (scoreEl) scoreEl.textContent = this.dotGame.score;
        if (timerEl) timerEl.textContent = `${this.dotGame.timeLeft}s`;
        if (comboEl) comboEl.textContent = `${this.dotGame.combo}x`;
        if (highEl) highEl.textContent = this.dotGame.highScore;
    }

    /* ==========================================================================
       Game 2: Browser Dino Runner
       ========================================================================== */
    initDinoGame() {
        this.dinoGame.canvas = document.getElementById('dinoCanvas');
        if (!this.dinoGame.canvas) return;
        this.dinoGame.ctx = this.dinoGame.canvas.getContext('2d');
        this.dinoGame.highScore = window.storageManager.get('dino_highscore', 0);

        this.updateDinoScoreBoard();

        const startBtn = document.getElementById('startDinoBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startDinoGame());
        }

        // Spacebar or Click to jump
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && document.getElementById('dinoCanvas')) {
                // Prevent scrolling page down
                if (this.dinoGame.isRunning) {
                    e.preventDefault();
                    this.jumpDino();
                }
            }
        });

        this.dinoGame.canvas.addEventListener('click', () => {
            if (this.dinoGame.isRunning) {
                this.jumpDino();
            } else {
                this.startDinoGame();
            }
        });

        this.drawInitialDinoScreen();
    }

    drawInitialDinoScreen() {
        const { ctx, canvas } = this.dinoGame;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Ground line
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, 158, canvas.width, 2);

        // Dino placeholder
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(40, 130, 24, 28);

        // Start prompt
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE or Click to Jump', canvas.width / 2, 85);
    }

    startDinoGame() {
        cancelAnimationFrame(this.dinoGame.animId);
        this.dinoGame.isRunning = true;
        this.dinoGame.score = 0;
        this.dinoGame.speed = 4.2;
        this.dinoGame.spawnTimer = 0;
        this.dinoGame.obstacles = [];
        this.dinoGame.dino = { x: 40, y: 130, w: 24, h: 28, vy: 0, isGrounded: true };

        this.playBeep(580, 0.1, 'sine');
        this.loopDino();
    }

    jumpDino() {
        if (this.dinoGame.dino.isGrounded) {
            this.dinoGame.dino.vy = -11.5;
            this.dinoGame.dino.isGrounded = false;
            this.playBeep(380, 0.08, 'square');
        }
    }

    loopDino() {
        if (!this.dinoGame.isRunning) return;

        this.updateDino();
        this.renderDino();

        this.dinoGame.animId = requestAnimationFrame(() => this.loopDino());
    }

    updateDino() {
        const dino = this.dinoGame.dino;

        // Apply physics
        dino.vy += this.dinoGame.gravity;
        dino.y += dino.vy;

        // Ground constraint
        if (dino.y >= 130) {
            dino.y = 130;
            dino.vy = 0;
            dino.isGrounded = true;
        }

        // Increment score
        this.dinoGame.score += 1;
        if (this.dinoGame.score % 200 === 0) {
            this.dinoGame.speed += 0.35; // Accelerate smoothly
            this.playBeep(880, 0.1, 'sine');
        }
        this.updateDinoScoreBoard();

        // Spawn obstacles
        this.dinoGame.spawnTimer++;
        if (this.dinoGame.spawnTimer > Math.max(45, 95 - Math.floor(this.dinoGame.speed * 4))) {
            if (Math.random() > 0.3) {
                const height = 22 + Math.floor(Math.random() * 18);
                this.dinoGame.obstacles.push({
                    x: this.dinoGame.canvas.width + 10,
                    y: 158 - height,
                    w: 16,
                    h: height
                });
                this.dinoGame.spawnTimer = 0;
            }
        }

        // Move obstacles and test collision
        for (let i = this.dinoGame.obstacles.length - 1; i >= 0; i--) {
            const obs = this.dinoGame.obstacles[i];
            obs.x -= this.dinoGame.speed;

            // Bounding box collision detection
            if (
                dino.x < obs.x + obs.w &&
                dino.x + dino.w > obs.x &&
                dino.y < obs.y + obs.h &&
                dino.y + dino.h > obs.y
            ) {
                this.endDinoGame();
                return;
            }

            // Remove off-screen obstacles
            if (obs.x + obs.w < -10) {
                this.dinoGame.obstacles.splice(i, 1);
            }
        }
    }

    renderDino() {
        const { ctx, canvas, dino, obstacles } = this.dinoGame;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Ground
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 158, canvas.width, 2);

        // Running ground tick marks
        ctx.fillStyle = '#64748b';
        const offset = (this.dinoGame.score * this.dinoGame.speed) % 30;
        for (let x = -offset; x < canvas.width; x += 30) {
            ctx.fillRect(x, 163, 12, 1.5);
        }

        // Draw Dino
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.roundRect(dino.x, dino.y, dino.w, dino.h, [4, 4, 1, 1]);
        ctx.fill();

        // Dino eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(dino.x + 16, dino.y + 4, 3, 3);

        // Draw Obstacles (Cacti)
        ctx.fillStyle = '#10b981';
        obstacles.forEach(obs => {
            ctx.beginPath();
            ctx.roundRect(obs.x, obs.y, obs.w, obs.h, [3, 3, 0, 0]);
            ctx.fill();
        });
    }

    endDinoGame() {
        this.dinoGame.isRunning = false;
        cancelAnimationFrame(this.dinoGame.animId);
        this.playBeep(160, 0.25, 'sawtooth');

        if (this.dinoGame.score > this.dinoGame.highScore) {
            this.dinoGame.highScore = this.dinoGame.score;
            window.storageManager.set('dino_highscore', this.dinoGame.highScore);
            if (window.notificationManager) {
                window.notificationManager.show(`🦖 New Dino High Score: ${this.dinoGame.highScore}!`, 'success');
            }
        }

        const { ctx, canvas } = this.dinoGame;
        if (ctx && canvas) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#f87171';
            ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, 75);

            ctx.fillStyle = '#ffffff';
            ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText(`Score: ${this.dinoGame.score}   •   Best: ${this.dinoGame.highScore}`, canvas.width / 2, 105);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText('Click canvas to restart', canvas.width / 2, 130);
        }

        this.updateDinoScoreBoard();
    }

    updateDinoScoreBoard() {
        const scoreEl = document.getElementById('dinoScore');
        const highEl = document.getElementById('dinoHighScore');
        if (scoreEl) scoreEl.textContent = this.dinoGame.score;
        if (highEl) highEl.textContent = this.dinoGame.highScore;
    }
}

// Export singleton instance
window.miniGamesManager = new MiniGamesManager();
