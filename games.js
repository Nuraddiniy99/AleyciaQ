/* ═══════════════════════════════════════════════
   21 WONDERS OF ALEYCIA - GAMES LOGIC
   ═══════════════════════════════════════════════ */

const Games = {
  /* ---------- PAGE 2: STAR NAME ---------- */
  initStarName() {
    const container = document.getElementById('star-field');
    const progress = document.getElementById('name-progress');
    container.innerHTML = ''; progress.textContent = '';
    const letters = ['A','L','E','Y','C','I','A'];
    let current = 0;
    
    letters.forEach((char, i) => {
      const el = document.createElement('div');
      el.className = 'star-letter';
      el.textContent = char;
      el.style.left = (15 + Math.random() * 70) + '%';
      el.style.top = (10 + Math.random() * 70) + '%';
      el.style.animation = `float ${3 + Math.random()*2}s infinite`;
      el.dataset.char = char;
      el.dataset.idx = i;
      el.onclick = () => {
        if (char === letters[current]) {
          el.classList.add('correct');
          current++;
          progress.textContent += char + ' ';
          App.playTone('pop');
          if (current >= letters.length) {
            setTimeout(() => App.complete(2), 500);
          }
        } else {
          el.classList.add('wrong');
          App.playTone('buzz');
          setTimeout(() => el.classList.remove('wrong'), 400);
        }
      };
      container.appendChild(el);
    });
  },

  /* ---------- PAGE 3: SLIDE PUZZLE ---------- */
  initPuzzle() {
    const canvas = document.getElementById('puzzle-canvas');
    const ctx = canvas.getContext('2d');
    const size = 3, tileSize = 100;
    let tiles = [], empty = {x:2, y:2};
    
    // Generate solved state
    for (let y=0; y<size; y++) for (let x=0; x<size; x++) {
      if (x===2 && y===2) continue;
      tiles.push({x, y, correctX: x, correctY: y, num: y*size+x+1});
    }
    
    // Shuffle
    for (let i=0; i<100; i++) {
      const neighbors = tiles.filter(t => Math.abs(t.x-empty.x)+Math.abs(t.y-empty.y)===1);
      const pick = neighbors[Math.floor(Math.random()*neighbors.length)];
      [pick.x, empty.x] = [empty.x, pick.x];
      [pick.y, empty.y] = [empty.y, pick.y];
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'https://picsum.photos/seed/aleycia3/300/400';
    img.onload = draw;
    
    function draw() {
      ctx.clearRect(0,0,300,400);
      tiles.forEach(t => {
        const sx = t.correctX * tileSize, sy = t.correctY * (400/3);
        const dx = t.x * tileSize, dy = t.y * (400/3);
        ctx.drawImage(img, sx, sy, tileSize, 400/3, dx, dy, tileSize, 400/3);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.strokeRect(dx, dy, tileSize, 400/3);
      });
    }
    
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / tileSize);
      const y = Math.floor((e.clientY - rect.top) / (400/3));
      const tile = tiles.find(t => t.x===x && t.y===y);
      if (!tile) return;
      if (Math.abs(tile.x-empty.x)+Math.abs(tile.y-empty.y)===1) {
        [tile.x, empty.x] = [empty.x, tile.x];
        [tile.y, empty.y] = [empty.y, tile.y];
        App.playTone('pop');
        draw();
        if (tiles.every(t => t.x===t.correctX && t.y===t.correctY)) {
          ctx.drawImage(img, 0, 0, 300, 400);
          setTimeout(() => App.complete(3), 500);
        }
      }
    };
  },

  /* ---------- PAGE 4: QUIZ ---------- */
  initQuiz() {
    const questions = [
      { q: 'Makanan kesukaan Aleycia?', options: ['Sayur mayur hijau', 'Fast food', 'Dessert'], correct: 0, type: 'single' },
      { q: 'Film genre favorit?', options: ['Adult romance', 'Action sci-fi', 'Comedy', 'Horror'], correct: [0,1], type: 'multi' },
      { q: 'Kegiatan kesukaan Aleycia?', options: ['Makan', 'Jalan-jalan', 'Baca', 'Gambar'], correct: 0, type: 'single' },
      { q: 'Kapan awal kita bertemu?', options: ['Not yet', '12 Maret 2023', '5 Juni 2024', '1 Agustus 2025'], correct: 0, type: 'single' }
    ];
    
    let qIndex = 0, selected = [];
    const qEl = document.getElementById('quiz-question');
    const oEl = document.getElementById('quiz-options');
    const bar = document.getElementById('quiz-bar');
    
    function render() {
      const q = questions[qIndex];
      qEl.textContent = `${qIndex+1}. ${q.q}`;
      oEl.innerHTML = '';
      bar.style.width = ((qIndex/questions.length)*100) + '%';
      selected = [];
      
      q.options.forEach((opt, i) => {
        const btn = document.createElement('div');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.style.position = 'relative';
        
        btn.onclick = (e) => {
          if (q.type === 'multi') {
            if (selected.includes(i)) {
              selected = selected.filter(x => x!==i);
              btn.classList.remove('selected');
            } else {
              selected.push(i);
              btn.classList.add('selected');
            }
            checkMulti(q);
          } else {
            if (i === q.correct) {
              btn.classList.add('correct');
              App.playTone('pop');
              nextQ();
            } else {
              btn.classList.add('wrong');
              App.playTone('buzz');
              // Runaway effect
              btn.style.left = (Math.random()*200 - 100) + 'px';
              btn.style.top = (Math.random()*100 - 50) + 'px';
              btn.classList.add('runaway');
              setTimeout(() => { btn.style.left=''; btn.style.top=''; btn.classList.remove('runaway','wrong'); }, 800);
            }
          }
        };
        oEl.appendChild(btn);
      });
    }
    
    function checkMulti(q) {
      const correct = q.correct.sort().join(',');
      const sel = selected.sort().join(',');
      if (sel === correct) {
        App.playTone('pop');
        nextQ();
      } else if (selected.length >= q.correct.length) {
        App.playTone('buzz');
        oEl.childNodes.forEach(c => c.classList.add('wrong'));
        setTimeout(() => oEl.childNodes.forEach(c => c.classList.remove('wrong','selected')), 600);
        selected = [];
      }
    }
    
    function nextQ() {
      qIndex++;
      if (qIndex >= questions.length) {
        bar.style.width = '100%';
        setTimeout(() => App.complete(4), 500);
      } else {
        setTimeout(render, 400);
      }
    }
    render();
  },

  /* ---------- PAGE 5: LOVE TANK ---------- */
  initTank() {
    let taps = 0, full = false;
    const liquid = document.getElementById('tank-liquid');
    const pct = document.getElementById('tank-percent');
    const msg = document.getElementById('tank-message');
    const container = document.getElementById('tank-container');
    
    container.onclick = () => {
      if (full) return;
      taps++;
      const percent = Math.min((taps/40)*100, 100);
      liquid.style.height = percent + '%';
      pct.textContent = Math.floor(percent) + '%';
      App.playTone('pop');
      
      if (taps >= 40 && !full) {
        full = true;
        msg.classList.remove('hidden');
        App.playTone('success');
        setTimeout(() => App.complete(5), 3000);
      }
    };
  },

  /* ---------- PAGE 6: RUNAWAY BUTTON ---------- */
  initRunaway() {
    const btn = document.getElementById('btn-runaway');
    const stage = document.getElementById('runaway-stage');
    const text = document.getElementById('runaway-text');
    let caught = 0, surrender = false;
    
    btn.classList.remove('surrender');
    text.classList.add('hidden');
    btn.style.left = '50%'; btn.style.top = '50%'; btn.style.transform = 'translate(-50%,-50%)';
    
    const moveBtn = (e) => {
      if (surrender) return;
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
      const tx = e.touches ? e.touches[0].clientX : e.clientX;
      const ty = e.touches ? e.touches[0].clientY : e.clientY;
      const dist = Math.hypot(tx-cx, ty-cy);
      
      if (dist < 120) {
        const nx = 20 + Math.random()*60;
        const ny = 20 + Math.random()*60;
        btn.style.left = nx + '%'; btn.style.top = ny + '%'; btn.style.transform = 'translate(-50%,-50%)';
        App.playTone('whoosh');
      }
    };
    
    stage.addEventListener('mousemove', moveBtn);
    stage.addEventListener('touchmove', moveBtn);
    
    btn.onclick = () => {
      if (surrender) {
        App.complete(6);
        return;
      }
      caught++;
      App.playTone('pop');
      if (caught >= 2) {
        surrender = true;
        btn.textContent = 'Oke aku pasrah 😭';
        btn.classList.add('surrender');
        text.classList.remove('hidden');
        setTimeout(() => { btn.onclick = () => App.complete(6); }, 500);
      }
    };
  },

  /* ---------- PAGE 7: SCRATCH ---------- */
  initScratch() {
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0,0,300,400);
    ctx.fillStyle = '#888';
    ctx.font = 'bold 24px Nunito';
    ctx.fillText('Gosok aku!', 90, 200);
    
    let isDrawing = false;
    const getPos = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      return {x, y};
    };
    
    const scratch = (e) => {
      if (!isDrawing) return;
      const {x,y} = getPos(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI*2);
      ctx.fill();
      
      // Check progress
      const imageData = ctx.getImageData(0,0,300,400);
      let transparent = 0;
      for (let i=3; i<imageData.data.length; i+=4) if (imageData.data[i] < 128) transparent++;
      if (transparent / (300*400) > 0.5) {
        canvas.style.pointerEvents = 'none';
        App.playTone('success');
        setTimeout(() => App.complete(7), 500);
      }
    };
    
    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('touchstart', () => isDrawing = true);
    canvas.addEventListener('touchend', () => isDrawing = false);
    canvas.addEventListener('touchmove', scratch);
  },

  /* ---------- PAGE 8: CROSSWORD ---------- */
  initCrossword() {
    const grid = document.getElementById('crossword-grid');
    grid.innerHTML = '';
    const layout = [
      ['A','L','E','Y','C'],
      ['P','','','','I'],
      ['I','','','','N'],
      ['N','','','','T'],
      ['K','','','','']
    ];
    // Actually 5x5 with words: ALEYCIA (row0), PIN (col4 down), PINK (col0 down), MEI (row2 col1-3), 2004 (row4 col1-4)
    // Simplified implementation:
    const solution = {
      '0-0':'A','0-1':'L','0-2':'E','0-3':'Y','0-4':'C',
      '1-0':'P','1-4':'I',
      '2-0':'I','2-1':'M','2-2':'E','2-3':'I','2-4':'N',
      '3-0':'N','3-4':'T',
      '4-0':'K','4-1':'2','4-2':'0','4-3':'0','4-4':'4'
    };
    
    for (let y=0; y<5; y++) {
      for (let x=0; x<5; x++) {
        const key = `${y}-${x}`;
        const cell = document.createElement('input');
        cell.className = 'cross-cell';
        cell.maxLength = 1;
        if (!solution[key]) {
          cell.classList.add('block');
          cell.disabled = true;
        }
        cell.oninput = () => {
          cell.value = cell.value.toUpperCase();
          if (cell.value === solution[key]) {
            cell.style.background = '#d4edda';
            checkWin();
          }
        };
        grid.appendChild(cell);
      }
    }
    
    function checkWin() {
      const cells = grid.querySelectorAll('input:not(.block)');
      const allCorrect = Array.from(cells).every(c => {
        const idx = Array.from(grid.children).indexOf(c);
        const x = idx % 5, y = Math.floor(idx / 5);
        return c.value.toUpperCase() === solution[`${y}-${x}`];
      });
      if (allCorrect) {
        App.playTone('success');
        setTimeout(() => App.complete(8), 500);
      }
    }
  },

  /* ---------- PAGE 9: CANDLES ---------- */
  initCandles() {
    const container = document.getElementById('candles');
    container.innerHTML = '';
    let outCount = 0;
    
    for (let i=0; i<22; i++) {
      const c = document.createElement('div');
      c.className = 'candle';
      c.onclick = () => {
        if (!c.classList.contains('out')) {
          c.classList.add('out');
          App.playTone('pop');
          outCount++;
          if (outCount >= 22) {
            App.playTone('success');
            setTimeout(() => App.complete(9), 800);
          }
        }
      };
      container.appendChild(c);
    }
    
    // Mic blow simulation
    document.getElementById('btn-mic').onclick = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({audio:true});
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        src.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        
        const check = setInterval(() => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a,b)=>a+b,0)/data.length;
          if (avg > 100) {
            const candles = container.querySelectorAll('.candle:not(.out)');
            if (candles.length > 0) {
              candles[0].classList.add('out');
              candles[0].onclick();
            }
          }
          if (outCount >= 22) clearInterval(check);
        }, 200);
      } catch(e) { alert('Mic tidak tersedia, tap lilin saja ya!'); }
    };
  },

  /* ---------- PAGE 10: JIGSAW ---------- */
  initJigsaw() {
    const dropzone = document.getElementById('jigsaw-dropzone');
    const piecesBox = document.getElementById('jigsaw-pieces');
    dropzone.innerHTML = ''; piecesBox.innerHTML = '';
    const positions = [
      {x:0,y:0},{x:100,y:0},{x:200,y:0},
      {x:0,y:100},{x:100,y:100},{x:200,y:100},
      {x:0,y:200},{x:100,y:200},{x:200,y:200}
    ];
    let placed = 0;
    
    positions.forEach((pos, i) => {
      const piece = document.createElement('div');
      piece.className = 'jigsaw-piece';
      piece.style.backgroundImage = `url(https://picsum.photos/seed/aleycia10/300/300)`;
      piece.style.backgroundPosition = `-${pos.x}px -${pos.y}px`;
      piece.dataset.x = pos.x; piece.dataset.y = pos.y;
      
      // Drag logic
      let startX, startY, origX, origY;
      piece.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX; startY = e.touches[0].clientY;
        const rect = piece.getBoundingClientRect();
        origX = rect.left; origY = rect.top;
        piece.style.position = 'fixed'; piece.style.zIndex = 1000;
      });
      piece.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        piece.style.left = (origX + dx) + 'px';
        piece.style.top = (origY + dy) + 'px';
      });
      piece.addEventListener('touchend', (e) => {
        const dzRect = dropzone.getBoundingClientRect();
        const pRect = piece.getBoundingClientRect();
        const pcx = pRect.left + pRect.width/2, pcy = pRect.top + pRect.height/2;
        
        if (pcx >= dzRect.left && pcx <= dzRect.right && pcy >= dzRect.top && pcy <= dzRect.bottom) {
          const snapX = parseInt(piece.dataset.x), snapY = parseInt(piece.dataset.y);
          piece.style.position = 'absolute'; piece.style.left = snapX+'px'; piece.style.top = snapY+'px';
          piece.style.zIndex = 1; piece.style.margin = 0;
          dropzone.appendChild(piece);
          placed++;
          App.playTone('pop');
          if (placed >= 9) {
            App.playTone('success');
            setTimeout(() => App.complete(10), 500);
          }
        } else {
          piece.style.position = ''; piece.style.left = ''; piece.style.top = ''; piece.style.zIndex = '';
          piecesBox.appendChild(piece);
        }
      });
      
      piecesBox.appendChild(piece);
    });
  },

  /* ---------- PAGE 11: CIPHER ---------- */
  initCipher() {
    const slider = document.getElementById('cipher-slider');
    const decoded = document.getElementById('cipher-decoded');
    const btn = document.getElementById('btn-cipher');
    const text = 'HRH HSHZ PU TLUZ PZABUNL WLV KPJRPAO AVKLSB VBRUZ WLV';
    
    function caesar(str, shift) {
      return str.replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0)-65-shift+26)%26+65));
    }
    
    slider.oninput = () => {
      document.getElementById('shift-val').textContent = slider.value;
      const res = caesar(text, parseInt(slider.value));
      decoded.textContent = res;
      if (slider.value === '7') {
        decoded.style.color = '#B76E79';
        btn.disabled = false;
      } else {
        decoded.style.color = '';
        btn.disabled = true;
      }
    };
    
    btn.onclick = () => {
      App.playTone('success');
      setTimeout(() => App.complete(11), 500);
    };
  },

  /* ---------- PAGE 12: BUBBLES ---------- */
  initBubbles() {
    const field = document.getElementById('bubbles-field');
    const secret = document.getElementById('bubble-secret');
    field.innerHTML = ''; secret.classList.add('hidden');
    let popped = 0, missed = 0;
    
    for (let i=0; i<22; i++) {
      const b = document.createElement('div');
      b.className = 'bubble';
      b.textContent = '❤️';
      b.style.left = (Math.random()*80 + 5) + '%';
      b.style.animationDuration = (4 + Math.random()*4) + 's';
      b.style.animationDelay = (Math.random()*2) + 's';
      
      b.addEventListener('animationend', () => {
        if (!b.popped) {
          missed++;
          b.remove();
          if (missed === 1 && popped < 22) {
            secret.classList.remove('hidden');
            App.playTone('chime');
          }
        }
      });
      
      b.onclick = () => {
        b.popped = true;
        b.style.transform = 'scale(1.5)'; b.style.opacity = '0';
        setTimeout(() => b.remove(), 200);
        popped++;
        App.playTone('pop');
        if (popped >= 22) {
          App.playTone('success');
          setTimeout(() => App.complete(12), 500);
        }
      };
      field.appendChild(b);
    }
  },

  /* ---------- PAGE 13: SLIDER ---------- */
  initSlider() {
    const after = document.getElementById('slider-after');
    const handle = document.getElementById('slider-handle');
    const container = document.querySelector('.slider-container');
    let isDragging = false;
    
    const update = (x) => {
      const rect = container.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      after.style.clipPath = `inset(0 ${100-pct}% 0 0)`;
      handle.style.left = pct + '%';
    };
    
    handle.addEventListener('touchstart', () => isDragging = true);
    document.addEventListener('touchmove', (e) => { if (isDragging) update(e.touches[0].clientX); });
    document.addEventListener('touchend', () => isDragging = false);
    
    // Auto complete after interaction
    container.addEventListener('click', () => {
      setTimeout(() => App.complete(13), 1500);
    });
  },

  /* ---------- PAGE 14: THIS OR THAT ---------- */
  initTOT() {
    const pairs = [
      {l:'🐱', r:'🐰', win:1}, {l:'🏖️', r:'🏔️', win:1},
      {l:'☕', r:'🍵', win:1}, {l:'🌅', r:'🌇', win:0},
      {l:'📚', r:'🎬', win:1}, {l:'📺', r:'📱', win:1, force:true}
    ];
    let idx = 0;
    const left = document.getElementById('tot-left');
    const right = document.getElementById('tot-right');
    const prog = document.getElementById('tot-progress');
    
    function render() {
      if (idx >= pairs.length) {
        App.complete(14); return;
      }
      const p = pairs[idx];
      left.textContent = p.l; right.textContent = p.r;
      left.className = 'tot-card left'; right.className = 'tot-card right';
      prog.textContent = `${idx+1} / ${pairs.length}`;
      
      left.onclick = () => choose(0, p);
      right.onclick = () => choose(1, p);
    }
    
    function choose(side, p) {
      if (p.force && side !== p.win) {
        // VC must be chosen
        const wrong = side === 0 ? left : right;
        wrong.textContent = '😭'; wrong.classList.add('tot-cry');
        App.playTone('buzz');
        setTimeout(() => render(), 1000);
        return;
      }
      App.playTone('pop');
      idx++;
      render();
    }
    render();
  },

  /* ---------- PAGE 15: BALLOONS ---------- */
  initBalloons() {
    const field = document.getElementById('balloons-field');
    const msg = document.getElementById('balloon-msg');
    field.innerHTML = ''; msg.classList.add('hidden');
    let popped = 0;
    
    for (let i=0; i<22; i++) {
      const b = document.createElement('div');
      const isRose = i === 21;
      b.className = 'balloon ' + (isRose ? 'rose-gold' : 'pink');
      b.style.left = (Math.random()*85 + 5) + '%';
      b.style.animationDuration = (5 + Math.random()*3) + 's';
      
      b.onclick = () => {
        if (b.popped) return;
        if (isRose && popped < 21) {
          // Must be last
          App.playTone('buzz');
          b.style.transform = 'translateX(20px)';
          setTimeout(() => b.style.transform = '', 200);
          return;
        }
        b.popped = true;
        b.style.transform = 'scale(1.3)'; b.style.opacity = '0';
        setTimeout(() => b.remove(), 300);
        popped++;
        App.playTone('pop');
        
        if (isRose) {
          msg.classList.remove('hidden');
          App.playTone('success');
          setTimeout(() => App.complete(15), 2000);
        }
      };
      field.appendChild(b);
    }
  },

  /* ---------- PAGE 16: SHAKE EGG ---------- */
  initEgg() {
    const egg = document.getElementById('egg');
    const crack = document.getElementById('egg-crack');
    const counter = document.getElementById('shake-counter');
    const fill = document.getElementById('shake-fill');
    const msg = document.getElementById('egg-msg');
    let shakes = 0, done = false;
    
    egg.classList.remove('hidden'); crack.classList.remove('show');
    msg.classList.add('hidden');
    
    const handleMotion = (e) => {
      if (done) return;
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const delta = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
      if (delta > 25) {
        shakes++;
        counter.textContent = `${shakes} / 100`;
        fill.style.width = (shakes) + '%';
        egg.classList.add('shaking');
        setTimeout(() => egg.classList.remove('shaking'), 100);
        App.playTone('pop');
        
        if (shakes >= 100) {
          done = true;
          window.removeEventListener('devicemotion', handleMotion);
          egg.classList.add('hidden');
          crack.classList.add('show');
          msg.classList.remove('hidden');
          App.playTone('success');
          setTimeout(() => App.complete(16), 1500);
        }
      }
    };
    
    // Fallback for non-shake devices: tap rapidly
    let tapFallback = 0;
    egg.onclick = () => {
      if (done) return;
      tapFallback++;
      if (tapFallback % 3 === 0) { // Every 3 taps = 1 shake
        shakes++;
        counter.textContent = `${shakes} / 100`;
        fill.style.width = (shakes) + '%';
        App.playTone('pop');
        if (shakes >= 100) {
          done = true;
          egg.classList.add('hidden');
          crack.classList.add('show');
          msg.classList.remove('hidden');
          App.playTone('success');
          setTimeout(() => App.complete(16), 1500);
        }
      }
    };
    
    window.addEventListener('devicemotion', handleMotion);
  },

  /* ---------- PAGE 17: UNSCRAMBLE ---------- */
  initUnscramble() {
    const target = document.getElementById('unscramble-target');
    const letters = document.getElementById('unscramble-letters');
    const sentence = document.getElementById('unscramble-sentence');
    target.innerHTML = ''; letters.innerHTML = ''; sentence.classList.add('hidden');
    
    const words = ['ALEYCIA','CINTA','TULUS','LANGIT','BERSAMA'];
    let currentWord = 0, built = '';
    
    function setupWord() {
      target.innerHTML = '';
      built = '';
      const word = words[currentWord];
      for (let i=0; i<word.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'unscramble-slot';
        target.appendChild(slot);
      }
      
      letters.innerHTML = '';
      const chars = word.split('').sort(() => Math.random()-0.5);
      chars.forEach(char => {
        const ch = document.createElement('div');
        ch.className = 'unscramble-letter';
        ch.textContent = char;
        ch.onclick = () => {
          const slots = target.querySelectorAll('.unscramble-slot');
          for (let s of slots) {
            if (!s.textContent) {
              s.textContent = char;
              built += char;
              ch.style.visibility = 'hidden';
              App.playTone('pop');
              check();
              break;
            }
          }
        };
        letters.appendChild(ch);
      });
    }
    
    function check() {
      if (built === words[currentWord]) {
        App.playTone('success');
        currentWord++;
        if (currentWord >= words.length) {
          target.innerHTML = ''; letters.innerHTML = '';
          sentence.classList.remove('hidden');
          setTimeout(() => App.complete(17), 1500);
        } else {
          setTimeout(setupWord, 500);
        }
      }
    }
    setupWord();
  },

  /* ---------- PAGE 18: CAROUSEL ---------- */
  initCarousel() {
    const track = document.getElementById('carousel-track');
    track.innerHTML = '';
    const secret = document.getElementById('carousel-secret');
    secret.classList.add('hidden');
    
    for (let i=0; i<10; i++) {
      const item = document.createElement('div');
      item.className = 'carousel-item';
      item.style.backgroundImage = `url(https://picsum.photos/seed/aleycia18${i}/200/260)`;
      item.style.transform = `rotateY(${(i-5)*36}deg) translateZ(250px)`;
      track.appendChild(item);
    }
    
    let angle = 0, startX = 0;
    const container = document.querySelector('.carousel-3d');
    
    container.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
    container.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - startX;
      angle += dx * 0.2;
      track.style.transform = `rotateY(${angle}deg)`;
      startX = e.touches[0].clientX;
    });
    
    // Pinch zoom on item 7 (index 6) simulation via double tap
    let lastTap = 0;
    container.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        secret.classList.remove('hidden');
        App.playTone('success');
        setTimeout(() => App.complete(18), 1000);
      }
      lastTap = now;
    });
  },

  /* ---------- PAGE 19: TIMELINE ---------- */
  initTimeline() {
    const btn = document.getElementById('btn-tl');
    const result = document.getElementById('timeline-result');
    btn.onclick = () => {
      const date = document.getElementById('tl-date').value;
      const text = document.getElementById('tl-text').value;
      if (!date && !text) return;
      
      result.classList.remove('hidden');
      result.innerHTML = `
        <h3>✨ Timeline Kita ✨</h3>
        <p>Tanggal spesial: <strong>${date || 'Setiap hari bersamamu'}</strong></p>
        <p>Nyaman sejak: <strong>${text || 'Sejak pertama kenal'}</strong></p>
        <p style="margin-top:10px;color:var(--hot-pink);">Tidak ada yang salah, semua indah 💕</p>
        <p style="font-size:0.8rem;color:#999;">...dan akan terus bertambah</p>
      `;
      App.playTone('success');
      setTimeout(() => App.complete(19), 2000);
    };
  },

  /* ---------- PAGE 20: LETTER ---------- */
  initLetter() {
    const content = document.getElementById('letter-content');
    const paragraphs = [
      "Selamat ulang tahun yang ke-22 sayangku...",
      "Kita punya banyak cerita lucu yang aku simpan selamanya...",
      "Aku minta maaf untuk semua hal yang belum sempurna...",
      "Kamu adalah alasan aku tersenyum setiap hari...",
      "Semoga tahun ini membawa kebahagiaan tak terhingga untukmu..."
    ];
    // PLACEHOLDER - GANTI DENGAN PESAN ASLI DARI KAMU
    
    let pIndex = 0, charIndex = 0;
    content.innerHTML = '';
    
    function type() {
      if (pIndex >= paragraphs.length) {
        content.querySelector('.typing')?.classList.remove('typing');
        return;
      }
      if (charIndex === 0) {
        const p = document.createElement('p');
        p.innerHTML = '<span class="typing"></span>';
        content.appendChild(p);
      }
      const span = content.lastElementChild.querySelector('span');
      const text = paragraphs[pIndex];
      
      if (charIndex < text.length) {
        span.textContent += text[charIndex];
        charIndex++;
        setTimeout(type, 40);
      } else {
        span.classList.remove('typing');
        pIndex++; charIndex = 0;
        setTimeout(type, 600);
      }
    }
    type();
    
    // Tap to speed up
    document.getElementById('page-20').onclick = () => {
      // Just visual feedback
    };
  },

  /* ---------- PAGE 21: FINALE ---------- */
  initFinale() {
    const grid = document.getElementById('wishes-grid');
    grid.innerHTML = '';
    const wishes = [
      "Sehat selalu","Bahagia","Sukses","Cinta",
      "Tawa","Impian","Ketenangan","Keberanian",
      "Persahabatan","Petualangan","Kreativitas","Kekuatan",
      "Kasih sayang","Kebijaksanaan","Kesabaran","Kejujuran",
      "Keberuntungan","Kedamaian","Kebanggaan","Kehangatan",
      "Keindahan","Keabadian"
    ];
    
    wishes.forEach((w, i) => {
      const b = document.createElement('div');
      b.className = 'wish-bubble';
      b.textContent = '🎁';
      b.onclick = () => {
        if (b.classList.contains('opened')) return;
        b.classList.add('opened'); b.textContent = '✨';
        const popup = document.createElement('div');
        popup.className = 'wish-text';
        popup.innerHTML = `<p><strong>Harapan #${i+1}</strong></p><p>${w}</p><button class="btn" style="margin-top:10px;padding:8px 16px;font-size:0.8rem;">Tutup</button>`;
        document.body.appendChild(popup);
        popup.querySelector('button').onclick = () => popup.remove();
        App.playTone('chime');
      };
      grid.appendChild(b);
    });
    
    // Fireworks
    const canvas = document.getElementById('fireworks-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    
    const particles = [];
    function createFirework() {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.5;
      const colors = ['#FF69B4','#FFD1DC','#B76E79','#FFF','#E6E6FA'];
      for (let i=0; i<30; i++) {
        particles.push({
          x, y, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4,
          life: 60, color: colors[Math.floor(Math.random()*colors.length)]
        });
      }
    }
    
    function loop() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach((p,i) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fill();
        if (p.life <= 0) particles.splice(i,1);
      });
      if (Math.random() < 0.03) createFirework();
      requestAnimationFrame(loop);
    }
    loop();
  }
};

