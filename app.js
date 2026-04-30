/* ═══════════════════════════════════════════════
   21 WONDERS OF ALEYCIA - CORE ENGINE
   ═══════════════════════════════════════════════ */

// ⚠️ DEV OVERRIDE - UBAH KE true UNTUK BYPASS TIME LOCK
const DEV_MODE = false;

const App = {
  current: 0,
  unlocked: [0],
  games: {},
  audioCtx: null,
  bgm: null,
  
  init() {
    this.bgm = document.getElementById('bgm');
    this.renderDots();
    this.setupAudio();
    this.checkTimeLock();
    this.setupGlobalEvents();
    
    // Dev bypass
    if (DEV_MODE) {
      this.unlocked = Array.from({length: 22}, (_,i) => i);
      this.renderDots();
    }
  },

  /* ---------- TIME LOCK ---------- */
  checkTimeLock() {
    const unlockDate = new Date('2026-05-01T00:01:00+07:00');
    const now = new Date();
    const btn = document.getElementById('btn-enter');
    const cd = document.getElementById('countdown');
    
    if (DEV_MODE || now >= unlockDate) {
      cd.textContent = "00:00:00:00";
      btn.classList.remove('hidden');
      return;
    }
    
    const update = () => {
      const diff = unlockDate - new Date();
      if (diff <= 0) {
        cd.textContent = "00:00:00:00";
        btn.classList.remove('hidden');
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      cd.textContent = `${String(d).padStart(2,'0')}:${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };
    update();
    setInterval(update, 1000);
  },

  unlock() {
    this.playTone('chime');
    this.goTo(1);
  },

  /* ---------- ROUTER ---------- */
  goTo(n) {
    if (!this.unlocked.includes(n) && !DEV_MODE) return;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${n}`).classList.add('active');
    this.current = n;
    document.getElementById('nav-page').textContent = `${n} / 21`;
    document.getElementById('nav-prev').disabled = n <= 1;
    document.getElementById('nav-next').disabled = !this.unlocked.includes(n+1) && n < 21;
    this.renderDots();
    
    // Page specific init
    if (n === 2) Games.initStarName();
    if (n === 3) Games.initPuzzle();
    if (n === 4) Games.initQuiz();
    if (n === 5) Games.initTank();
    if (n === 6) Games.initRunaway();
    if (n === 7) Games.initScratch();
    if (n === 8) Games.initCrossword();
    if (n === 9) Games.initCandles();
    if (n === 10) Games.initJigsaw();
    if (n === 11) Games.initCipher();
    if (n === 12) Games.initBubbles();
    if (n === 13) Games.initSlider();
    if (n === 14) Games.initTOT();
    if (n === 15) Games.initBalloons();
    if (n === 16) Games.initEgg();
    if (n === 17) Games.initUnscramble();
    if (n === 18) Games.initCarousel();
    if (n === 19) Games.initTimeline();
    if (n === 20) Games.initLetter();
    if (n === 21) Games.initFinale();
    
    if (n > 0) this.playTone('whoosh');
  },

  next() { if (this.current < 21) this.goTo(this.current + 1); },
  prev() { if (this.current > 1) this.goTo(this.current - 1); },

  complete(n) {
    if (!this.unlocked.includes(n+1) && n < 21) {
      this.unlocked.push(n+1);
      this.renderDots();
      document.getElementById('nav-next').disabled = false;
      this.playTone('success');
      if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
      
      // Auto advance after delay
      setTimeout(() => {
        confettiBurst();
        setTimeout(() => this.goTo(n+1), 800);
      }, 600);
    }
  },

  renderDots() {
    const container = document.getElementById('progress-dots');
    container.innerHTML = '';
    for (let i = 1; i <= 21; i++) {
      const d = document.createElement('div');
      d.className = 'dot';
      if (i === this.current) d.classList.add('active');
      if (!this.unlocked.includes(i)) d.classList.add('locked');
      container.appendChild(d);
    }
  },

  /* ---------- AUDIO ENGINE ---------- */
  setupAudio() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { console.log('Web Audio not supported'); }
  },

  playTone(type) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    switch(type) {
      case 'chime':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.1);
        osc.frequency.setValueAtTime(784, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now); osc.stop(now + 0.6);
        break;
      case 'pop':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
        break;
      case 'success':
        [523, 659, 784, 1047].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.2, now + i*0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i*0.1 + 0.3);
          o.start(now + i*0.1); o.stop(now + i*0.1 + 0.3);
        });
        break;
      case 'whoosh':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
        break;
      case 'buzz':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
        break;
    }
  },

  startBGM() {
    if (this.bgm && this.bgm.paused) {
      this.bgm.volume = 0.3;
      this.bgm.play().catch(() => {});
    }
  },

  /* ---------- UTILS ---------- */
  setupGlobalEvents() {
    // First interaction unlocks audio
    document.addEventListener('click', () => {
      this.startBGM();
      if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
    }, { once: true });
  },

  saveReply() {
    const val = document.getElementById('letter-reply').value;
    localStorage.setItem('aleycia_reply', val);
    alert('Balasan tersimpan! 💌');
  },

  restart() {
    if (confirm('Ulangi dari awal?')) {
      this.current = 0;
      this.unlocked = [0];
      this.goTo(0);
    }
  },

  saveMemory() {
    alert('Screenshot layar ini untuk kenangan! 📸\n(Alt: Ctrl+S untuk save halaman)');
  }
};

/* ---------- PARTICLES ---------- */
function confettiBurst() {
  const colors = ['#FF69B4', '#FFD1DC', '#B76E79', '#FFF0F5', '#E6E6FA'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:fixed;width:8px;height:8px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:50%;pointer-events:none;z-index:999;left:50%;top:50%;`;
    document.body.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * 200;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    p.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${tx}px,${ty}px) scale(0)`, opacity: 0 }], { duration: 800, easing: 'cubic-bezier(0.25,1,0.5,1)' }).onfinish = () => p.remove();
  }
}

// Init
window.addEventListener('DOMContentLoaded', () => App.init());
