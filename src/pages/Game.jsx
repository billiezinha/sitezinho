import { useState, useEffect, useRef } from 'react'
import { Heart, Trophy, RefreshCw, Gamepad2, ArrowLeft, ArrowUp, ArrowRight, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import confetti from 'canvas-confetti'

export default function Game() {
  const [gameState, setGameState] = useState('START') // START, PLAYING, DEATH, WIN
  const [deathCause, setDeathCause] = useState('') // UFPI, DISTANCIA, FALL
  const [score, setScore] = useState(0)
  
  const canvasRef = useRef(null)
  const animFrameId = useRef(null)
  const engineRef = useRef(getInitialState())

  function getInitialState() {
    const clouds = Array.from({length: 12}, () => ({
      x: Math.random() * 3000, 
      y: 10 + Math.random() * 80, 
      scale: 0.6 + Math.random() * 0.8,
      speed: 0.15 + Math.random() * 0.3
    }));
    const mountains = Array.from({length: 12}, (_, i) => ({
      x: i * 250 - 100,
      w: 300 + Math.random() * 150,
      h: 80 + Math.random() * 200,
      color: ['#8e44ad', '#2980b9', '#16a085'][i % 3] 
    }));

    return {
      keys: { left: false, right: false, up: false },
      player: { x: 50, y: 150, vx: 0, vy: 0, w: 22, h: 36, onGround: false, facingRight: true },
      camX: 0,
      deathCount: 0,
      score: 0,
      platforms: [
        { x: 0, y: 250, w: 400, h: 150 },
        { x: 450, y: 200, w: 100, h: 200 },
        { x: 600, y: 150, w: 150, h: 250 }, 
        { x: 800, y: 250, w: 350, h: 150 },
        { x: 1200, y: 200, w: 80, h: 200 },
        { x: 1350, y: 150, w: 80, h: 250 },
        { x: 1500, y: 100, w: 80, h: 300 },
        { x: 1650, y: 250, w: 400, h: 150 },
        { x: 2100, y: 200, w: 100, h: 200 },
        { x: 2250, y: 160, w: 100, h: 240 },
        { x: 2450, y: 250, w: 500, h: 150 } 
      ],
      enemies: [
        { id: 1, type: 'UFPI', x: 650, y: 126, w: 24, h: 24, vx: 0.8, leftBound: 600, rightBound: 726, alive: true, animPos: 0 },
        { id: 2, type: 'DISTANCIA', x: 830, y: 160, w: 32, h: 20, vx: -0.8, leftBound: 780, rightBound: 950, alive: true, animPos: 0 },
        { id: 3, type: 'UFPI', x: 950, y: 226, w: 24, h: 24, vx: -1, leftBound: 800, rightBound: 1126, alive: true, animPos: 0 },
        { id: 4, type: 'DISTANCIA', x: 1400, y: 80, w: 32, h: 20, vx: 1.2, leftBound: 1200, rightBound: 1550, alive: true, animPos: 0 },
        { id: 5, type: 'UFPI', x: 1750, y: 226, w: 24, h: 24, vx: 1.2, leftBound: 1650, rightBound: 2026, alive: true, animPos: 0 },
        { id: 6, type: 'DISTANCIA', x: 2280, y: 100, w: 32, h: 20, vx: -1.5, leftBound: 2150, rightBound: 2400, alive: true, animPos: 0 },
      ],
      items: [ // Cartinhas de amor colecionáveis
        { id: 1, x: 250, y: 180, w: 24, h: 24, collected: false, animPos: 0 },
        { id: 2, x: 500, y: 130, w: 24, h: 24, collected: false, animPos: 1 },
        { id: 3, x: 880, y: 100, w: 24, h: 24, collected: false, animPos: 2 },
        { id: 4, x: 1225, y: 120, w: 24, h: 24, collected: false, animPos: 3 },
        { id: 5, x: 1525, y: 50, w: 24, h: 24, collected: false, animPos: 4 },
        { id: 6, x: 1850, y: 150, w: 24, h: 24, collected: false, animPos: 5 },
        { id: 7, x: 2150, y: 120, w: 24, h: 24, collected: false, animPos: 6 },
      ],
      goal: { x: 2750, y: 214, w: 24, h: 36 }, 
      decorations: { clouds, mountains },
      particles: [],
      
      gravity: 0.55,
      jumpPower: -10, 
      accel: 0.6,
      friction: 0.82,
      maxSpeed: 4.8
    };
  }

  // === METODOS DA ENGINE ===
  const startGame = () => {
    engineRef.current = getInitialState();
    setScore(0);
    setGameState('PLAYING');
  }

  const spawnParticles = (x, y, color, count) => {
    const e = engineRef.current;
    for(let i=0; i<count; i++) {
       e.particles.push({
          x: x + Math.random()*20 - 10,
          y: y + Math.random()*10 - 5,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5 - 2,
          life: 1.0,  
          color: color,
          size: Math.random() * 4 + 3
       });
    }
  }

  const gameLoop = () => {
    if (gameState !== 'PLAYING') return;

    const e = engineRef.current;
    const p = e.player;

    if (e.keys.left) { p.vx -= e.accel; p.facingRight = false; }
    if (e.keys.right) { p.vx += e.accel; p.facingRight = true; }

    p.vx *= e.friction;
    if (p.vx > e.maxSpeed) p.vx = e.maxSpeed;
    if (p.vx < -e.maxSpeed) p.vx = -e.maxSpeed;
    if (Math.abs(p.vx) < 0.1) p.vx = 0;

    if (p.onGround && Math.abs(p.vx) > 3 && Math.random() > 0.7) {
       spawnParticles(p.x + p.w/2, p.y + p.h, '#ecf0f1', 1);
    }

    p.vy += e.gravity;

    if (e.keys.up && p.onGround) {
      p.vy = e.jumpPower;
      p.onGround = false;
      e.keys.up = false; 
      spawnParticles(p.x + p.w/2, p.y + p.h, '#ffffff', 5);
    }

    p.x += p.vx;
    if (p.x < 0) p.x = 0;

    for (let plat of e.platforms) {
      if (p.x < plat.x + plat.w && p.x + p.w > plat.x && p.y < plat.y + plat.h && p.y + p.h > plat.y) {
        if (p.vx > 0) { p.x = plat.x - p.w; p.vx = 0; } 
        else if (p.vx < 0) { p.x = plat.x + plat.w; p.vx = 0; }
      }
    }

    p.y += p.vy;
    p.onGround = false;

    for (let plat of e.platforms) {
      if (p.x < plat.x + plat.w && p.x + p.w > plat.x && p.y < plat.y + plat.h && p.y + p.h > plat.y) {
        if (p.vy > 0) { 
           p.y = plat.y - p.h; p.vy = 0; p.onGround = true;
        } else if (p.vy < 0) { 
           p.y = plat.y + plat.h; p.vy = 0;
        }
      }
    }

    // Coleta de Itens
    for (let it of e.items) {
       it.animPos += 0.1;
       if (!it.collected && p.x < it.x + it.w && p.x + p.w > it.x && p.y < it.y + it.h && p.y + p.h > it.y) {
          it.collected = true;
          e.score += 1;
          setScore(e.score);
          spawnParticles(it.x + it.w/2, it.y + it.h/2, '#ff4757', 15);
       }
    }

    // Hitboxes cravadas no chão (Inimigos)
    for (let en of e.enemies) {
      if (!en.alive) continue;
      
      en.x += en.vx;
      en.animPos += 0.2; // Apenas para animação visual, hitbox de colisão é FIXA!

      if (en.x <= en.leftBound) { en.x = en.leftBound; en.vx *= -1; }
      if (en.x >= en.rightBound) { en.x = en.rightBound; en.vx *= -1; }

      // Intersecção básica de caixas
      if (p.x < en.x + en.w && p.x + p.w > en.x && p.y < en.y + en.h && p.y + p.h > en.y) {
         
         // Pisão? (Jogador caindo e estava ANTES acima da metade do bicho)
         if (p.vy > 0 && (p.y - p.vy + p.h) <= en.y + (en.h * 0.6)) {
            en.alive = false; 
            p.vy = -9; // Pulo bônus esmagador
            
            if (en.type === 'UFPI') {
               spawnParticles(en.x + en.w/2, en.y + en.h/2, '#f1c40f', 8); 
               spawnParticles(en.x + en.w/2, en.y + en.h/2, '#e74c3c', 8); 
            } else if (en.type === 'DISTANCIA') {
               spawnParticles(en.x + en.w/2, en.y + en.h/2, '#6c5ce7', 15); // Explosão de nuvem roxa
               spawnParticles(en.x + en.w/2, en.y + en.h/2, '#ffffff', 5); 
            }
         } else {
            // Morte lateral/inferior
            setDeathCause(en.type);
            setGameState('DEATH');
            return;
         }
      }
    }

    for (let i = e.particles.length-1; i>=0; i--) {
        let pt = e.particles[i];
        pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.04;
        if (pt.life <= 0) e.particles.splice(i, 1);
    }

    for (let c of e.decorations.clouds) {
        c.x -= c.speed;
        if (c.x < -300) c.x = 3000;
    }

    if (p.y > 400) {
      setDeathCause('FALL');
      setGameState('DEATH');
      return;
    }

    let g = e.goal;
    if (p.x < g.x + g.w && p.x + p.w > g.x && p.y < g.y + g.h && p.y + p.h > g.y) {
      setGameState('WIN');
      confetti({ particleCount: 300, spread: 160, origin: { y: 0.5 }, colors: ['#ff4757', '#ffffff'] });
      return;
    }

    const targetCamX = p.x - 150; 
    if (targetCamX > e.camX) { e.camX += (targetCamX - e.camX) * 0.1; } 
    else if (targetCamX < e.camX - 100) { e.camX = targetCamX + 100; }
    if (e.camX < 0) e.camX = 0;

    draw();
    animFrameId.current = requestAnimationFrame(gameLoop);
  }

  // === DESENHO CARTOON NO CANVAS AVANÇADO ===
  
  const fillAndStroke = (ctx, fillColor, strokeColor = '#1e272e', lineWidth = 3) => {
      ctx.fillStyle = fillColor; ctx.fill();
      ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth; ctx.stroke();
  }

  const drawShadow = (ctx, x, y, width, opacity = 0.3) => {
      ctx.fillStyle = `rgba(0,0,0,${opacity})`;
      ctx.beginPath(); ctx.ellipse(x + width/2, y, width * 0.6, 4, 0, 0, Math.PI*2); ctx.fill();
  }

  const drawWesley = (ctx, x, y, width, height, vx, vy, onGround) => {
    ctx.save();
    const cx = x + width/2;
    drawShadow(ctx, x, y + height, width);
    
    let drawY = y;
    let scaleX = 1; let scaleY = 1;

    if (!onGround) {
        if (vy < 0) { scaleX = 0.9; scaleY = 1.1; drawY -= 2; }
        else { scaleX = 1.1; scaleY = 0.9; drawY += 2; }
    } else {
        if (Math.abs(vx) > 0.5) drawY -= Math.abs(Math.sin(Date.now() / 60)) * 3; // Pulo de desenho!
    }

    ctx.translate(cx, drawY + height);
    if (Math.abs(vx) > 0.5 && onGround) ctx.rotate(vx * 0.04);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-cx, -(drawY + height));

    const legSwing = onGround ? Math.sin(Date.now() / 60) * (vx * 2.5) : 0;
    
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx + 1 + legSwing, drawY + 24, 6, 12, 3) : ctx.fillRect(cx + 1 + legSwing, drawY + 24, 6, 12);
    fillAndStroke(ctx, '#0984e3');
    ctx.beginPath(); ctx.arc(cx + 4 + legSwing, drawY + 36, 4, 0, Math.PI*2); fillAndStroke(ctx, '#2d3436');
    
    const armSwing = onGround ? Math.sin(Date.now() / 60) * (vx * 2) : -2;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx + 3 - armSwing, drawY + 16, 5, 10, 2.5) : ctx.fillRect(cx + 3 - armSwing, drawY + 16, 5, 10);
    fillAndStroke(ctx, '#e17055');

    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - 7, drawY + 14, 14, 13, 4) : ctx.fillRect(cx - 7, drawY + 14, 14, 13);
    fillAndStroke(ctx, '#ff4757');

    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - 7 - legSwing, drawY + 24, 6, 12, 3) : ctx.fillRect(cx - 7 - legSwing, drawY + 24, 6, 12);
    fillAndStroke(ctx, '#74b9ff');
    ctx.beginPath(); ctx.arc(cx - 4 - legSwing, drawY + 36, 4, 0, Math.PI*2); fillAndStroke(ctx, '#2d3436');

    ctx.beginPath(); ctx.rect(cx - 2, drawY + 12, 4, 5); fillAndStroke(ctx, '#e17055');

    ctx.beginPath(); ctx.ellipse(cx, drawY + 6, 8, 8, 0, 0, Math.PI * 2); fillAndStroke(ctx, '#fab1a0');

    ctx.beginPath();
    ctx.arc(cx, drawY - 3, 9, 0, Math.PI*2);
    ctx.arc(cx - 7, drawY + 1, 6, 0, Math.PI*2);
    ctx.arc(cx + 7, drawY + 1, 6, 0, Math.PI*2);
    ctx.arc(cx - 8, drawY + 6, 5, 0, Math.PI*2);
    ctx.arc(cx + 8, drawY + 6, 5, 0, Math.PI*2);
    fillAndStroke(ctx, '#2d3436');

    ctx.beginPath(); ctx.arc(cx - 3.5, drawY + 6, 4, 0, Math.PI*2); fillAndStroke(ctx, 'white', '#2d3436', 2);
    ctx.beginPath(); ctx.arc(cx + 3.5, drawY + 6, 4, 0, Math.PI*2); fillAndStroke(ctx, 'white', '#2d3436', 2);
    ctx.beginPath(); ctx.moveTo(cx - 1, drawY + 6); ctx.lineTo(cx + 1, drawY + 6); ctx.stroke(); 
    
    ctx.fillStyle = '#2d3436';
    ctx.beginPath(); ctx.arc(cx - 3.5, drawY + 6.5, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 3.5, drawY + 6.5, 2, 0, Math.PI*2); ctx.fill();

    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - 7 + armSwing, drawY + 16, 6, 10, 3) : ctx.fillRect(cx - 7 + armSwing, drawY + 16, 6, 10);
    fillAndStroke(ctx, '#fab1a0');
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - 8 + armSwing, drawY + 14, 8, 5, 2) : ctx.fillRect(cx - 8 + armSwing, drawY + 14, 8, 5);
    fillAndStroke(ctx, '#ff4757');

    ctx.restore();
  }

  const drawEnemyUFPI = (ctx, x, y, width, height, animPos) => {
    ctx.save();
    drawShadow(ctx, x, y + height, width);

    const visY = y - Math.abs(Math.sin(animPos)) * 5; 
    
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, visY, width, height, 4) : ctx.fillRect(x, visY, width, height);
    fillAndStroke(ctx, '#f1c40f', '#2d3436', 3.5); 
    
    ctx.beginPath(); ctx.moveTo(x + width - 6, visY); ctx.lineTo(x + width, visY + 6); ctx.lineTo(x + width - 6, visY + 6); ctx.closePath();
    fillAndStroke(ctx, '#f39c12', '#2d3436', 2.5);

    ctx.lineWidth = 2.5; ctx.strokeStyle = '#2d3436';
    ctx.beginPath(); ctx.moveTo(x + 4, visY + 6); ctx.lineTo(x + width - 10, visY + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 4, visY + 10); ctx.lineTo(x + width - 4, visY + 10); ctx.stroke();

    ctx.save();
    ctx.translate(x + 12, visY + 8);
    ctx.rotate(-0.2 + Math.sin(Date.now()/150)*0.2); 
    ctx.fillStyle = '#ff4757'; ctx.font = '900 10px "Comic Sans MS", "Arial Black"'; ctx.textAlign = 'center';
    ctx.fillText('UFPI', 0, 7);
    ctx.restore();

    ctx.beginPath(); ctx.ellipse(x + 7, visY + 21, 5, 4, 0, 0, Math.PI*2); fillAndStroke(ctx, 'white', '#2d3436', 2.5);
    ctx.beginPath(); ctx.ellipse(x + 17, visY + 21, 5, 4, 0, 0, Math.PI*2); fillAndStroke(ctx, 'white', '#2d3436', 2.5);
    
    ctx.fillStyle = '#e84118'; 
    ctx.beginPath(); ctx.arc(x + 7, visY + 21.5, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 17, visY + 21.5, 2, 0, Math.PI*2); ctx.fill();

    ctx.lineWidth = 3.5; ctx.strokeStyle = '#2d3436';
    ctx.beginPath(); ctx.moveTo(x + 2, visY + 18); ctx.lineTo(x + 12, visY + 21); ctx.lineTo(x + 22, visY + 18); ctx.stroke();

    if (Math.sin(animPos) > 0) {
        ctx.fillStyle = '#74b9ff'; ctx.beginPath(); ctx.arc(x + width + 3, visY + 7, 2.5, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  const drawEnemyDistancia = (ctx, x, y, width, height, animPos) => {
    ctx.save();
    // A sombra da distância é esparsa/fraca porque ela levita muito
    drawShadow(ctx, x, y + height, width, 0.15);

    // Nuvem de tempestade triste levitando
    const visY = y + Math.sin(animPos * 0.8) * 6; // Bóia macio
    const cx = x + width/2;

    ctx.beginPath();
    ctx.arc(cx - 6, visY + 6, 10, 0, Math.PI*2);
    ctx.arc(cx, visY + 2, 14, 0, Math.PI*2);
    ctx.arc(cx + 6, visY + 6, 10, 0, Math.PI*2);
    fillAndStroke(ctx, '#6c5ce7', '#2d3436', 3);

    // Placa acoplada nela (KM)
    ctx.beginPath(); ctx.rect(cx - 10, visY - 14, 20, 12); fillAndStroke(ctx, '#d63031', '#2d3436', 2.5);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 9px Arial'; ctx.fillText('400', cx, visY - 5);

    // Olhinhos tristes fundos
    ctx.beginPath(); ctx.ellipse(cx - 5, visY + 10, 2.5, 1.5, Math.PI*0.1, 0, Math.PI*2); fillAndStroke(ctx, '#fdcb6e', '#2d3436', 1.5);
    ctx.beginPath(); ctx.ellipse(cx + 5, visY + 10, 2.5, 1.5, -Math.PI*0.1, 0, Math.PI*2); fillAndStroke(ctx, '#fdcb6e', '#2d3436', 1.5);
    
    // Raio saindo debaixo!
    ctx.beginPath();
    ctx.moveTo(cx, visY + 18); ctx.lineTo(cx - 4, visY + 26); ctx.lineTo(cx + 2, visY + 26); ctx.lineTo(cx - 2, visY + 34);
    fillAndStroke(ctx, '#f1c40f', '#2d3436', 2);

    ctx.restore();
  }

  const drawItemMail = (ctx, x, y, width, height, animPos) => {
    ctx.save();
    const visY = y + Math.sin(animPos) * 4;
    ctx.font = '24px "Comic Sans MS"';
    ctx.textAlign = 'center'; ctx.textBaseline='top';
    
    ctx.fillStyle = '#ff4757';
    // Sombra grossa
    ctx.filter = 'drop-shadow(0px 4px 0px #2d3436)'; 
    ctx.fillText('💌', x + width/2, visY);
    ctx.restore();
  }

  const drawJoao = (ctx, x, y, width, height) => {
    ctx.save();
    const cx = x + width/2;

    drawShadow(ctx, x, y + height, width);

    const bobY = Math.sin(Date.now() / 250) * 2; 
    const drawY = y + bobY;

    // Bracos abertos ao maximo
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - 18, drawY + 11, 14, 5, 2.5) : ctx.fillRect(cx - 18, drawY + 11, 14, 5);
    ctx.fillStyle = '#ffeaa7'; ctx.fill(); ctx.stroke();
    
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - 6, drawY + 26, 5, 11, 2) : ctx.fillRect(cx - 6, drawY + 26, 5, 11);
    fillAndStroke(ctx, '#0984e3');
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx + 1, drawY + 26, 5, 11, 2) : ctx.fillRect(cx + 1, drawY + 26, 5, 11);
    fillAndStroke(ctx, '#74b9ff');

    ctx.beginPath(); ctx.arc(cx - 3.5, drawY + 36, 4, 0, Math.PI*2); fillAndStroke(ctx, '#2d3436');
    ctx.beginPath(); ctx.arc(cx + 3.5, drawY + 36, 4, 0, Math.PI*2); fillAndStroke(ctx, '#2d3436');

    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - 7, drawY + 14, 14, 14, 4) : ctx.fillRect(cx - 7, drawY + 14, 14, 14);
    fillAndStroke(ctx, '#ecf0f1');

    ctx.beginPath(); ctx.rect(cx - 2, drawY + 12, 4, 5); fillAndStroke(ctx, '#ffeaa7');

    ctx.beginPath(); ctx.ellipse(cx, drawY + 5, 8, 9, 0, 0, Math.PI * 2); 
    fillAndStroke(ctx, '#ffeaa7');

    ctx.fillStyle = '#83633e';
    ctx.strokeStyle = '#2d3436'; ctx.lineWidth = 3.5;

    ctx.beginPath(); ctx.ellipse(cx - 9, drawY + 12, 6, 9, 0.2, 0, Math.PI*2); fillAndStroke(ctx, '#83633e');
    ctx.beginPath(); ctx.ellipse(cx + 9, drawY + 12, 6, 9, -0.2, 0, Math.PI*2); fillAndStroke(ctx, '#83633e');

    ctx.beginPath(); ctx.arc(cx, drawY - 3, 9, 0, Math.PI*2); fillAndStroke(ctx, '#83633e');
    ctx.beginPath(); ctx.arc(cx - 6, drawY, 6, 0, Math.PI*2); fillAndStroke(ctx, '#83633e');
    ctx.beginPath(); ctx.arc(cx + 6, drawY, 6, 0, Math.PI*2); fillAndStroke(ctx, '#83633e');

    ctx.strokeStyle = '#2d3436'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx - 3, drawY + 5.5, 2, Math.PI + 0.3, -0.3); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 3, drawY + 5.5, 2, Math.PI + 0.3, -0.3); ctx.stroke();
    
    ctx.fillStyle = '#ff7675';
    ctx.beginPath(); ctx.ellipse(cx - 5, drawY + 8, 2.5, 1.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 5, drawY + 8, 2.5, 1.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, drawY + 8, 3, 0, Math.PI); ctx.lineTo(cx-3, drawY+8); fillAndStroke(ctx, '#d63031', '#2d3436', 2); 

    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx + 4, drawY + 11, 14, 5, 2.5) : ctx.fillRect(cx + 4, drawY + 11, 14, 5);
    ctx.fillStyle = '#ffeaa7'; ctx.fill(); ctx.stroke();

    const beat = 1 + Math.abs(Math.sin(Date.now() / 150)) * 0.4;
    ctx.translate(cx, drawY - 26);
    ctx.scale(beat, beat);
    ctx.font = '900 30px "Comic Sans MS"';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff4757'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5;
    ctx.fillText('❤️', 0, 0); ctx.strokeText('❤️', 0, 0); 
    ctx.scale(1/beat, 1/beat);
    ctx.translate(-cx, -(drawY - 26));

    ctx.restore();
  }

  // === RENDER ===
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const e = engineRef.current;
    const p = e.player;

    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#74b9ff'); skyGrad.addColorStop(1, '#a29bfe');
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate((canvas.width/2) - (e.camX * 0.05), 100);
    ctx.rotate(Date.now() / 3000);
    ctx.fillStyle = 'rgba(255, 234, 167, 0.4)';
    for(let i=0; i<12; i++) {
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-20, 200); ctx.lineTo(20, 200); ctx.fill(); ctx.rotate((Math.PI*2)/12);
    }
    ctx.beginPath(); ctx.arc(0,0, 40, 0, Math.PI*2); fillAndStroke(ctx, '#ffeaa7', 'transparent', 0);
    ctx.restore();

    ctx.save();
    ctx.translate(-e.camX * 0.1, 0);
    for(let c of e.decorations.clouds) {
        ctx.beginPath();
        ctx.arc(c.x, c.y+5*c.scale, 40 * c.scale, 0, Math.PI*2);
        ctx.arc(c.x + 30*c.scale, c.y - 15*c.scale + 5*c.scale, 35 * c.scale, 0, Math.PI*2);
        ctx.arc(c.x + 60*c.scale, c.y + 5*c.scale, 30 * c.scale, 0, Math.PI*2);
        fillAndStroke(ctx, 'rgba(0,0,0,0.1)', 'transparent', 0);

        ctx.beginPath();
        ctx.arc(c.x, c.y, 40 * c.scale, 0, Math.PI*2);
        ctx.arc(c.x + 30*c.scale, c.y - 15*c.scale, 35 * c.scale, 0, Math.PI*2);
        ctx.arc(c.x + 60*c.scale, c.y, 30 * c.scale, 0, Math.PI*2);
        fillAndStroke(ctx, '#ffffff', '#2d3436', 3.5);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-e.camX * 0.3, 0);
    for(let m of e.decorations.mountains) {
       ctx.beginPath(); ctx.moveTo(m.x, canvas.height); ctx.lineTo(m.x + m.w/2, canvas.height - m.h); ctx.lineTo(m.x + m.w, canvas.height); fillAndStroke(ctx, m.color, '#2d3436', 4);
       ctx.beginPath(); ctx.moveTo(m.x + m.w/2, canvas.height - m.h); ctx.lineTo(m.x + m.w/2 - 20, canvas.height - m.h + 40); ctx.lineTo(m.x + m.w/2, canvas.height - m.h + 50); ctx.lineTo(m.x + m.w/2 + 20, canvas.height - m.h + 40); fillAndStroke(ctx, '#fff', '#2d3436', 3.5);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-e.camX, 0);

    for (let plat of e.platforms) {
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(plat.x, plat.y, plat.w, plat.h + 20, 6) : ctx.fillRect(plat.x, plat.y, plat.w, plat.h + 20);
      fillAndStroke(ctx, '#e67e22', '#2d3436', 4);
      
      ctx.fillStyle = '#d35400';
      for(let tx = plat.x + 20; tx < plat.x + plat.w - 20; tx += 45) {
          ctx.beginPath(); ctx.arc(tx, plat.y + 25, 6, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(tx + 15, plat.y + 60, 4, 0, Math.PI*2); ctx.fill();
      }

      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(plat.x - 4, plat.y - 4, plat.w + 8, 20, 10) : ctx.fillRect(plat.x - 4, plat.y - 4, plat.w + 8, 20);
      fillAndStroke(ctx, '#55efc4', '#2d3436', 4); 
      for(let bx = 10; bx < plat.w - 10; bx += 35) {
          ctx.beginPath(); ctx.arc(plat.x + bx + 5, plat.y + 16, 8, 0, Math.PI);
          fillAndStroke(ctx, '#55efc4', '#2d3436', 3);
      }
    }

    // Desenhar Itens Colecionáveis
    for (let it of e.items) {
       if (!it.collected) {
           drawItemMail(ctx, it.x, it.y, it.w, it.h, it.animPos);
       }
    }

    // Desenhar Inimigos Variados
    for (let en of e.enemies) {
        if (en.alive) {
            if (en.type === 'UFPI') drawEnemyUFPI(ctx, en.x, en.y, en.w, en.h, en.animPos);
            else if (en.type === 'DISTANCIA') drawEnemyDistancia(ctx, en.x, en.y, en.w, en.h, en.animPos);
        }
    }

    for (let pt of e.particles) {
       ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2); ctx.globalAlpha = pt.life; fillAndStroke(ctx, pt.color, '#2d3436', 2.5);
    }
    ctx.globalAlpha = 1.0;

    drawJoao(ctx, e.goal.x, e.goal.y + 10, e.goal.w, e.goal.h);

    ctx.beginPath(); ctx.rect(e.goal.x - 20, e.goal.y + 45, 60, 15); fillAndStroke(ctx, '#ff4757', '#2d3436', 4);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px "Courier New"'; ctx.textAlign = 'center'; ctx.fillText('WIN', e.goal.x + 10, e.goal.y + 56);

    drawWesley(ctx, p.x, p.y, p.w, p.h, p.vx, p.vy, p.onGround);

    ctx.restore();
  }

  // === HOOKS ===

  useEffect(() => {
    if (gameState === 'PLAYING') {
      animFrameId.current = requestAnimationFrame(gameLoop);
    } else if (gameState === 'START') {
       requestAnimationFrame(() => {
          if (canvasRef.current) draw()
       });
    }
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    }
  }, [gameState])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = engineRef.current.keys;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.up = true;
    }
    const handleKeyUp = (e) => {
      const keys = engineRef.current.keys;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.up = false;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
  }, [])

  const handleTouch = (btn, state) => (e) => {
    e.preventDefault();
    engineRef.current.keys[btn] = state;
  }

  return (
    <div className="min-h-screen bg-[#2d3436] flex flex-col items-center justify-center p-2 relative overflow-hidden font-sans select-none fill-neutral">
      
      <div className="absolute top-4 left-4 z-50">
        <Link to="/" className="text-white hover:text-[#ffeaa7] flex items-center gap-2 bg-[#2d3436] px-4 py-2 rounded-full transition-all shadow-[0_4px_0_#1e272e] border-2 border-[#1e272e] active:translate-y-1 active:shadow-none">
          <ArrowLeft size={20} strokeWidth={3} /> <span className="font-black tracking-widest uppercase">Sair</span>
        </Link>
      </div>

      <div className="w-full max-w-[600px] mb-3 mt-10 sm:mt-0 flex items-center justify-between z-10 px-2">
        <h2 className="text-3xl text-[#ffeaa7] drop-shadow-[0_4px_0_#1e272e] font-black uppercase flex items-center gap-2" style={{letterSpacing: '0.1em'}}>
          Aventura <Gamepad2 size={32} className="text-[#ff7675]" />
        </h2>
        {/* SCORE DE ITENS */}
        <div className="bg-[#1e272e] border-4 border-[#2d3436] rounded-full px-4 py-1 flex items-center gap-2 shadow-[0_6px_0_black]">
           <Mail size={24} className="text-[#ff7675]" fill="#ff7675" />
           <span className="text-white font-black text-2xl pt-1 leading-none">{score}</span>
        </div>
      </div>

      <div className="w-full max-w-[600px] relative bg-[#74b9ff] border-[8px] border-[#1e272e] rounded-3xl overflow-hidden shadow-[0_15px_0_#1e272e]">
        
        <canvas 
          ref={canvasRef}
          width={400} 
          height={300} 
          className="w-full h-[45vh] sm:h-[55vh] object-cover block"
          style={{ imageRendering: 'pixelated' }}
        />

        {gameState === 'START' && (
          <div className="absolute inset-0 bg-[#74b9ff]/90 flex flex-col items-center justify-center z-20 p-6 text-center border-[8px] border-[#1e272e] m-2 rounded-2xl">
             <Trophy size={70} className="text-[#ffeaa7] drop-shadow-[0_6px_0_#1e272e] animate-bounce" />
             <h3 className="text-4xl font-black text-white mb-2 uppercase drop-shadow-[0_4px_0_#1e272e]">Vai Lá!</h3>
             <p className="text-white text-[15px] font-bold mb-6 max-w-sm drop-shadow-[0_2px_0_black]">
               Pule na <b className="text-[#ff4757]">UFPI</b> e destrua a terrível <b className="text-[#6c5ce7]">Distância!</b> Colecione <b className="text-[#ff7675]">Cartinhas de Amor</b> no caminho e me encontre!
             </p>
             <button onClick={startGame} className="bg-[#ff7675] hover:bg-[#ff4757] text-white font-black text-3xl py-4 px-12 rounded-full shadow-[0_8px_0_#d63031] border-[5px] border-[#2d3436] active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest hover:scale-105">
               JOGAR
             </button>
          </div>
        )}

        {gameState === 'DEATH' && (
          <div className="absolute inset-0 bg-[#d63031] flex flex-col items-center justify-center z-20 p-6 text-center border-[8px] border-[#1e272e] m-2 rounded-2xl">
             <h3 className="text-[5rem] font-black text-[#ffeaa7] mb-1 uppercase drop-shadow-[0_6px_0_#1e272e]" style={{lineHeight: '1'}}>VIXE!</h3>
             <p className="text-white text-xl font-bold mb-8 drop-shadow-[0_3px_0_#2d3436]">
               {deathCause === 'UFPI' && 'A UFPI te pegou! Tente pular nela com classe.'}
               {deathCause === 'DISTANCIA' && 'A Distância te venceu... Pule nela para acabar com a saudade!'}
               {deathCause === 'FALL' && 'Você caiu no abismo! Cuidado com os buracos.'}
             </p>
             <button onClick={startGame} className="bg-white hover:bg-neutral-200 text-[#2d3436] font-black text-2xl py-4 px-10 rounded-full flex gap-3 items-center shadow-[0_8px_0_#b2bec3] border-[4px] border-[#2d3436] active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest">
               <RefreshCw size={28} className="animate-spin" /> Reviver
             </button>
          </div>
        )}

        {gameState === 'WIN' && (
          <div className="absolute inset-0 bg-[#0984e3] flex flex-col items-center justify-center z-50 p-6 text-center border-[8px] border-[#1e272e] m-2 rounded-2xl">
             <Heart size={90} className="text-[#ff4757] mb-4 fill-[#ff4757] animate-bounce drop-shadow-[0_6px_0_#2d3436]" />
             <h3 className="text-5xl font-black text-[#ffeaa7] mb-3 uppercase drop-shadow-[0_5px_0_#2d3436]">VITÓRIA!</h3>
             <p className="text-white text-lg font-bold mb-2 max-w-sm drop-shadow-[0_2px_0_black]">
               Você recolheu <span className="text-[#ffeaa7] text-2xl font-black mx-1">{score}</span> cartinhas de amor!
             </p>
             <p className="text-white text-base font-bold mb-8 max-w-sm drop-shadow-[0_2px_0_black] opacity-80">
               Pode fechar o jogo e me cobrar a Carta Física agora mesmo!
             </p>
             <Link to="/" className="text-white font-black text-lg uppercase underline decoration-4 hover:decoration-[#ff7675] hover:text-[#ff7675] transition-colors">
                Retornar ao Aplicativo
             </Link>
          </div>
        )}

      </div>

      <div className="w-full max-w-[600px] mt-8 px-4 flex justify-between items-end gap-4 select-none touch-none h-28 relative z-10">
         <div className="flex gap-4">
            <button 
              onPointerDown={handleTouch('left', true)} onPointerUp={handleTouch('left', false)} onPointerLeave={handleTouch('left', false)} onContextMenu={e => e.preventDefault()}
              className="w-20 h-20 bg-[#f1c40f] border-4 border-[#2d3436] rounded-2xl flex items-center justify-center text-[#2d3436] shadow-[0_8px_0_#f39c12] active:translate-y-2 active:shadow-none touch-none transition-transform"
            >
               <ArrowLeft size={44} strokeWidth={4} />
            </button>
            <button 
              onPointerDown={handleTouch('right', true)} onPointerUp={handleTouch('right', false)} onPointerLeave={handleTouch('right', false)} onContextMenu={e => e.preventDefault()}
              className="w-20 h-20 bg-[#f1c40f] border-4 border-[#2d3436] rounded-2xl flex items-center justify-center text-[#2d3436] shadow-[0_8px_0_#f39c12] active:translate-y-2 active:shadow-none touch-none transition-transform"
            >
               <ArrowRight size={44} strokeWidth={4} />
            </button>
         </div>
         <div className="flex pb-2">
            <button 
              onPointerDown={handleTouch('up', true)} onPointerUp={handleTouch('up', false)} onPointerLeave={handleTouch('up', false)} onContextMenu={e => e.preventDefault()}
              className="w-24 h-24 bg-[#ff7675] border-4 border-[#2d3436] rounded-full flex items-center justify-center text-[#2d3436] shadow-[0_10px_0_#d63031] active:translate-y-2 active:shadow-none touch-none transition-transform"
            >
               <ArrowUp size={56} strokeWidth={4} />
            </button>
         </div>
      </div>

    </div>
  )
}
