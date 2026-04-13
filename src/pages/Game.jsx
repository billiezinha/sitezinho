import { useState, useEffect, useRef } from 'react'
import { Heart, Trophy, RefreshCw, Gamepad2, ArrowLeft, ArrowUp, ArrowRight, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import confetti from 'canvas-confetti'

export default function Game() {
  const [gameState, setGameState] = useState('START') 
  const [deathCause, setDeathCause] = useState('') 
  const [score, setScore] = useState(0)
  
  const canvasRef = useRef(null)
  const animFrameId = useRef(null)
  const engineRef = useRef(getInitialState())

  function getInitialState() {
    const stars = Array.from({length: 60}, () => ({ 
      x: Math.random() * 3000, 
      y: Math.random() * 150, 
      r: Math.random() * 1.5,
      twinkle: Math.random() * Math.PI * 2
    }));
    const clouds = Array.from({length: 12}, () => ({
      x: Math.random() * 3000, 
      y: 10 + Math.random() * 80, 
      scale: 0.6 + Math.random() * 0.8,
      speed: 0.1 + Math.random() * 0.2
    }));
    const mountains = Array.from({length: 12}, (_, i) => ({
      x: i * 250 - 100,
      w: 300 + Math.random() * 150,
      h: 80 + Math.random() * 200,
      color: ['#190b28', '#2d1445', '#1a2440'][i % 3] 
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
        { id: 1, type: 'UFPI', x: 650, y: 126, w: 24, h: 24, vx: 0.6, leftBound: 600, rightBound: 726, alive: true, animPos: 0 },
        { id: 2, type: 'DISTANCIA', x: 830, y: 160, w: 32, h: 20, vx: -0.6, leftBound: 780, rightBound: 950, alive: true, animPos: 0 },
        { id: 3, type: 'UFPI', x: 950, y: 226, w: 24, h: 24, vx: -0.8, leftBound: 800, rightBound: 1126, alive: true, animPos: 0 },
        { id: 4, type: 'DISTANCIA', x: 1400, y: 80, w: 32, h: 20, vx: 0.9, leftBound: 1200, rightBound: 1550, alive: true, animPos: 0 },
        { id: 5, type: 'UFPI', x: 1750, y: 226, w: 24, h: 24, vx: 1.0, leftBound: 1650, rightBound: 2026, alive: true, animPos: 0 },
        { id: 6, type: 'DISTANCIA', x: 2280, y: 100, w: 32, h: 20, vx: -1.2, leftBound: 2150, rightBound: 2400, alive: true, animPos: 0 },
      ],
      items: [
        { id: 1, x: 250, y: 180, w: 24, h: 24, collected: false, animPos: 0 },
        { id: 2, x: 500, y: 130, w: 24, h: 24, collected: false, animPos: 1 },
        { id: 3, x: 880, y: 100, w: 24, h: 24, collected: false, animPos: 2 },
        { id: 4, x: 1225, y: 120, w: 24, h: 24, collected: false, animPos: 3 },
        { id: 5, x: 1525, y: 50, w: 24, h: 24, collected: false, animPos: 4 },
        { id: 6, x: 1850, y: 150, w: 24, h: 24, collected: false, animPos: 5 },
        { id: 7, x: 2150, y: 120, w: 24, h: 24, collected: false, animPos: 6 },
      ],
      goal: { x: 2750, y: 214, w: 24, h: 36 }, 
      decorations: { stars, clouds, mountains },
      particles: [],
      
      gravity: 0.55,
      jumpPower: -9.5, 
      accel: 0.45,
      friction: 0.84,
      maxSpeed: 4.1
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
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 2,
          life: 1.0,  
          color: color,
          size: Math.random() * 4 + 2
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
       spawnParticles(p.x + p.w/2, p.y + p.h, 'rgba(255,255,255,0.4)', 1);
    }

    p.vy += e.gravity;

    if (e.keys.up && p.onGround) {
      p.vy = e.jumpPower;
      p.onGround = false;
      e.keys.up = false; 
      spawnParticles(p.x + p.w/2, p.y + p.h, 'rgba(255,255,255,0.6)', 5);
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

    for (let it of e.items) {
       it.animPos += 0.1;
       if (!it.collected && p.x < it.x + it.w && p.x + p.w > it.x && p.y < it.y + it.h && p.y + p.h > it.y) {
          it.collected = true;
          e.score += 1;
          setScore(e.score);
          spawnParticles(it.x + it.w/2, it.y + it.h/2, '#ff4757', 15);
       }
    }

    for (let en of e.enemies) {
      if (!en.alive) continue;
      en.x += en.vx;
      en.animPos += 0.2; 
      if (en.x <= en.leftBound) { en.x = en.leftBound; en.vx *= -1; }
      if (en.x >= en.rightBound) { en.x = en.rightBound; en.vx *= -1; }

      if (p.x < en.x + en.w && p.x + p.w > en.x && p.y < en.y + en.h && p.y + p.h > en.y) {
         if (p.vy > 0 && (p.y - p.vy + p.h) <= en.y + (en.h * 0.6)) {
            en.alive = false; 
            p.vy = -8.5; // Pulo bônus macio
            
            if (en.type === 'UFPI') {
               spawnParticles(en.x + en.w/2, en.y + en.h/2, '#f1c40f', 8); 
               spawnParticles(en.x + en.w/2, en.y + en.h/2, '#e74c3c', 8); 
            } else if (en.type === 'DISTANCIA') {
               spawnParticles(en.x + en.w/2, en.y + en.h/2, '#8e44ad', 15);
               spawnParticles(en.x + en.w/2, en.y + en.h/2, '#ffffff', 5); 
            }
         } else {
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
    if (targetCamX > e.camX) { e.camX += (targetCamX - e.camX) * 0.08; } 
    else if (targetCamX < e.camX - 100) { e.camX = targetCamX + 100; }
    if (e.camX < 0) e.camX = 0;

    draw();
    animFrameId.current = requestAnimationFrame(gameLoop);
  }

  // === RENDERIZAÇÃO FOFA E REALISTA (Rayman 2.5D Style) ===
  
  const drawComplex = (ctx, drawPathFn, fillColor, strokeColor = '#111', lineWidth = 2.5, isGlow = false, glowColor = 'rgba(255,255,255,0.8)') => {
      ctx.beginPath();
      drawPathFn();
      if (isGlow) { ctx.shadowBlur = 15; ctx.shadowColor = glowColor; }
      ctx.fillStyle = fillColor; ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth; ctx.stroke();
  }

  const drawShadow = (ctx, x, y, width, opacity = 0.35) => {
      ctx.fillStyle = `rgba(0,0,0,${opacity})`;
      ctx.beginPath(); ctx.ellipse(x + width/2, y, width * 0.6, 3.5, 0, 0, Math.PI*2); ctx.fill();
  }

  // Wesley Clássico e Fofinho de Volta!
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
        if (Math.abs(vx) > 0.5) drawY -= Math.abs(Math.sin(Date.now() / 70)) * 2.5; 
    }

    ctx.translate(cx, drawY + height);
    if (Math.abs(vx) > 0.5 && onGround) ctx.rotate(vx * 0.04);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-cx, -(drawY + height));

    const legSwing = onGround ? Math.sin(Date.now() / 80) * (vx * 3) : 0;
    
    // Shader customizado para o look fofinho realista do Wesley (Baseado na Foto)!
    const jeansVibrant = '#0984e3';
    const shirtGreen = '#2d4a22'; // Verde Musgo
    const skinWesley = '#e6b89c'; // Tom de pele dourado de sol

    // Perna Traseira
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx + 1 + legSwing, drawY + 24, 6, 12, 3) : ctx.fillRect(cx + 1 + legSwing, drawY + 24, 6, 12)), jeansVibrant);
    drawComplex(ctx, () => ctx.arc(cx + 4 + legSwing, drawY + 36, 4, 0, Math.PI*2), '#2d3436');
    
    // Braço Traseiro
    const armSwing = onGround ? Math.sin(Date.now() / 80) * (vx * 2.5) : -2;
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx + 3 - armSwing, drawY + 16, 5, 10, 2.5) : ctx.fillRect(cx + 3 - armSwing, drawY + 16, 5, 10)), skinWesley);

    // Corpo de Camisa Verde Musgo
    const shirtGrad = ctx.createLinearGradient(cx - 7, drawY + 14, cx + 7, drawY + 27);
    shirtGrad.addColorStop(0, '#3a5a2e'); shirtGrad.addColorStop(1, '#1b3213');
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx - 7, drawY + 14, 14, 13, 4) : ctx.fillRect(cx - 7, drawY + 14, 14, 13)), shirtGrad);

    // Alça da Bolsa Creme cruzada
    drawComplex(ctx, () => { ctx.moveTo(cx - 4, drawY + 14); ctx.lineTo(cx - 1, drawY + 14); ctx.lineTo(cx + 7, drawY + 27); ctx.lineTo(cx + 4, drawY + 27); ctx.closePath(); }, '#f5f6fa', 'transparent', 0);

    // Perna Frente
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx - 7 - legSwing, drawY + 24, 6, 12, 3) : ctx.fillRect(cx - 7 - legSwing, drawY + 24, 6, 12)), '#74b9ff');
    drawComplex(ctx, () => ctx.arc(cx - 4 - legSwing, drawY + 36, 4, 0, Math.PI*2), '#2d3436');

    // Pescoço e Cabeça 
    drawComplex(ctx, () => ctx.rect(cx - 2, drawY + 12, 4, 5), skinWesley);
    drawComplex(ctx, () => ctx.ellipse(cx, drawY + 6, 8, 8, 0, 0, Math.PI * 2), skinWesley);

    // Cabelo Todo Crespinho macio 
    const hairBlack = '#171515';
    drawComplex(ctx, () => {
        ctx.arc(cx, drawY - 4, 8, 0, Math.PI*2); // Volume no topo
        ctx.arc(cx - 5, drawY - 2, 7, 0, Math.PI*2); 
        ctx.arc(cx + 5, drawY - 2, 7, 0, Math.PI*2); 
        ctx.arc(cx - 9, drawY + 5, 4, 0, Math.PI*2); // Fiozinhos soltos nas laterais
        ctx.arc(cx + 9, drawY + 5, 3, 0, Math.PI*2);
    }, hairBlack, 'transparent', 0);
    // Detalhes redondinhos dos cachos p/ fora
    ctx.fillStyle = hairBlack;
    ctx.beginPath(); ctx.arc(cx-3, drawY-10, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+4, drawY-8, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx-6, drawY-5, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+7, drawY-5, 3, 0, Math.PI*2); ctx.fill();

    // BANDANA (Faixa Azul Escura Estampada na testa)
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx - 8, drawY, 16, 4, 1) : ctx.fillRect(cx - 8, drawY, 16, 4)), '#2c2c54');
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - 4, drawY + 2, 1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 4, drawY + 2, 0.8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, drawY + 2, 1.2, 0, Math.PI*2); ctx.fill();

    // Bigodinho fininho da foto!
    drawComplex(ctx, () => { ctx.moveTo(cx - 3, drawY + 9); ctx.lineTo(cx + 3, drawY + 9); }, 'transparent', '#5c4033', 1);

    // Olhinhos Pretos por trás do óculos
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(cx - 3.5, drawY + 6.5, 1.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 3.5, drawY + 6.5, 1.2, 0, Math.PI*2); ctx.fill();

    // Óculos Redondos Enormes (Aro Preto)
    drawComplex(ctx, () => ctx.arc(cx - 3.5, drawY + 6, 4, 0, Math.PI*2), 'rgba(255,255,255,0.05)', '#111', 1.5);
    drawComplex(ctx, () => ctx.arc(cx + 3.5, drawY + 6, 4, 0, Math.PI*2), 'rgba(255,255,255,0.05)', '#111', 1.5);
    ctx.beginPath(); ctx.moveTo(cx - 1, drawY + 6); ctx.lineTo(cx + 1, drawY + 6); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.stroke(); 

    // Braço Frontal e Manga
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx - 7 + armSwing, drawY + 16, 6, 10, 3) : ctx.fillRect(cx - 7 + armSwing, drawY + 16, 6, 10)), skinWesley);
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx - 8 + armSwing, drawY + 14, 8, 5, 2) : ctx.fillRect(cx - 8 + armSwing, drawY + 14, 8, 5)), shirtGreen);

    ctx.restore();
  }

  // UFPI FOFA MAS IRRITADA (Papéis com Iluminação Suave)
  const drawEnemyUFPI = (ctx, x, y, width, height, animPos) => {
    ctx.save();
    drawShadow(ctx, x, y + height, width);
    const visY = y - Math.abs(Math.sin(animPos)) * 4; 
    
    const paperGrad = ctx.createLinearGradient(x, visY, x, visY + height);
    paperGrad.addColorStop(0, '#fdfaf6'); paperGrad.addColorStop(1, '#f1c40f');
    
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(x, visY, width, height, 4) : ctx.fillRect(x, visY, width, height)), paperGrad);
    drawComplex(ctx, () => { ctx.moveTo(x + width - 6, visY); ctx.lineTo(x + width, visY + 6); ctx.lineTo(x + width - 6, visY + 6); ctx.closePath(); }, '#f39c12', '#111', 2);

    ctx.lineWidth = 2.5; ctx.strokeStyle = '#2d3436';
    ctx.beginPath(); ctx.moveTo(x + 4, visY + 6); ctx.lineTo(x + width - 10, visY + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 4, visY + 10); ctx.lineTo(x + width - 4, visY + 10); ctx.stroke();

    ctx.save();
    ctx.translate(x + 12, visY + 8);
    ctx.rotate(-0.2 + Math.sin(Date.now()/150)*0.2); 
    ctx.fillStyle = '#ff4757'; ctx.font = '900 10px "Comic Sans MS", "Arial Black"'; ctx.textAlign = 'center'; ctx.fillText('UFPI', 0, 7);
    ctx.restore();

    // Olhos googly assustados/focados
    drawComplex(ctx, () => ctx.ellipse(x + 7, visY + 21, 5, 4, 0, 0, Math.PI*2), 'white');
    drawComplex(ctx, () => ctx.ellipse(x + 17, visY + 21, 5, 4, 0, 0, Math.PI*2), 'white');
    ctx.fillStyle = '#e84118'; ctx.beginPath(); ctx.arc(x + 7, visY + 21.5, 2, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(x + 17, visY + 21.5, 2, 0, Math.PI*2); ctx.fill();
    ctx.lineWidth = 3.5; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(x + 2, visY + 18); ctx.lineTo(x + 12, visY + 21); ctx.lineTo(x + 22, visY + 18); ctx.stroke();
    ctx.restore();
  }

  // DISTÂNCIA: NUVEM ROXINHA MELANCÓLICA E INFLADA (Fofona!)
  const drawEnemyDistancia = (ctx, x, y, width, height, animPos) => {
    ctx.save();
    drawShadow(ctx, x, y + height, width, 0.15);
    const visY = y + Math.sin(animPos * 0.8) * 4; 
    const cx = x + width/2;

    const cloudGrad = ctx.createLinearGradient(0, visY, 0, visY+height);
    cloudGrad.addColorStop(0, '#a29bfe'); cloudGrad.addColorStop(1, '#6c5ce7'); 
    
    drawComplex(ctx, () => {
        ctx.arc(cx - 8, visY + 6, 12, 0, Math.PI*2);
        ctx.arc(cx, visY + 2, 16, 0, Math.PI*2);
        ctx.arc(cx + 8, visY + 6, 12, 0, Math.PI*2);
    }, cloudGrad, '#190a2a', 2.5, true, 'rgba(108, 92, 231, 0.5)'); // Roxo iluminado gordinho

    // Placa redondinha cainda
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx - 10, visY - 14, 20, 12, 3) : ctx.fillRect(cx - 10, visY - 14, 20, 12)), '#d63031', '#111', 2);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 9px Arial'; ctx.fillText('400', cx, visY - 5);

    // Olhinhos fechados chorando/tristes
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx - 5, visY + 10, 3, 0, Math.PI, true); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 5, visY + 10, 3, 0, Math.PI, true); ctx.stroke();
    
    // Raio fofinho curvo embaixo
    drawComplex(ctx, () => {
        ctx.moveTo(cx, visY + 18); ctx.quadraticCurveTo(cx - 6, visY + 23, cx + 2, visY + 26);
        ctx.quadraticCurveTo(cx - 4, visY + 30, cx - 2, visY + 34); ctx.quadraticCurveTo(cx + 4, visY + 28, cx, visY + 18);
    }, '#f1c40f', '#111', 2, true, '#f1c40f');

    ctx.restore();
  }

  const drawItemMail = (ctx, x, y, width, height, animPos) => {
    ctx.save();
    const visY = y + Math.sin(animPos) * 3;
    ctx.font = '24px "Comic Sans MS"';
    ctx.textAlign = 'center'; ctx.textBaseline='top';
    ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(255, 71, 87, 0.9)';
    ctx.fillText('💌', x + width/2, visY);
    ctx.restore();
  }

  // JOÃO: ESTÉTICA REDONDINHA FOFA BASEADA NA FOTO NOVA (Regatinha Ciano e Cachos Livres)
  const drawJoao = (ctx, x, y, width, height) => {
    ctx.save();
    const cx = x + width/2;
    drawShadow(ctx, x, y + height, width);
    const bobY = Math.sin(Date.now() / 300) * 1.5; 
    const drawY = y + bobY;

    // Tom de pele claro (Fofinho)
    const skinGrad = ctx.createRadialGradient(cx, drawY+5, 0, cx, drawY+5, 15);
    skinGrad.addColorStop(0, '#fdfbfb'); skinGrad.addColorStop(1, '#e3cbb0');

    // Braço Esquerdo (Pele)
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx - 16, drawY + 11, 12, 5, 2.5) : ctx.fillRect(cx - 16, drawY + 11, 12, 5)), skinGrad); 

    // Shorts simples cinza escuro
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx - 6, drawY + 26, 5, 11, 2) : ctx.fillRect(cx - 6, drawY + 26, 5, 11)), '#57606f'); 
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx + 1, drawY + 26, 5, 11, 2) : ctx.fillRect(cx + 1, drawY + 26, 5, 11)), '#57606f'); 
    drawComplex(ctx, () => ctx.arc(cx - 3.5, drawY + 36, 4, 0, Math.PI*2), '#111'); 
    drawComplex(ctx, () => ctx.arc(cx + 3.5, drawY + 36, 4, 0, Math.PI*2), '#111');

    // Regata Ciano Vibrante com textura pontilhada de Laranja
    const cyanShirt = '#48dbfb';
    const orangeStripe = '#ff9f43';
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx - 7, drawY + 14, 14, 14, 4) : ctx.fillRect(cx - 7, drawY + 14, 14, 14)), cyanShirt);
    
    // Alças da regata nos ombros
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx - 7, drawY + 12, 4, 3, 1) : ctx.fillRect(cx - 7, drawY + 12, 4, 3)), cyanShirt);
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx + 3, drawY + 12, 4, 3, 1) : ctx.fillRect(cx + 3, drawY + 12, 4, 3)), cyanShirt);

    // Listras Laranjas tracejadas da Blusa
    ctx.strokeStyle = orangeStripe; ctx.lineWidth = 1.5; ctx.setLineDash([2, 1]);
    ctx.beginPath(); ctx.moveTo(cx - 5, drawY + 15); ctx.lineTo(cx - 5, drawY + 26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 5, drawY + 15); ctx.lineTo(cx + 5, drawY + 26); ctx.stroke();
    ctx.setLineDash([]); // reset dash

    // Corpo gordinho cabeca e pescoço
    drawComplex(ctx, () => ctx.rect(cx - 2, drawY + 12, 4, 5), skinGrad);
    drawComplex(ctx, () => ctx.ellipse(cx, drawY + 5, 8, 9, 0, 0, Math.PI * 2), skinGrad);

    // Cabelo Crespo Volumoso (Messy Curls para todo lado!) Fofos e super escuros
    const hairDark = '#101010';
    drawComplex(ctx, () => {
        ctx.arc(cx, drawY - 7, 9, 0, Math.PI*2); 
        ctx.arc(cx - 6, drawY - 4, 8, 0, Math.PI*2);
        ctx.arc(cx + 6, drawY - 4, 8, 0, Math.PI*2); 
        ctx.arc(cx - 9, drawY + 1, 6, 0, Math.PI*2); 
        ctx.arc(cx + 9, drawY + 1, 6, 0, Math.PI*2);
        // Franja bagunçada super preenchida e esferas soltas!
        ctx.arc(cx, drawY - 11, 4, 0, Math.PI*2);
        ctx.arc(cx - 5, drawY - 11, 5, 0, Math.PI*2);
        ctx.arc(cx + 6, drawY - 10, 4, 0, Math.PI*2);
    }, hairDark, 'transparent', 0);

    // Detalhes extras finos dos cachinhos macios pulando
    ctx.fillStyle = hairDark;
    ctx.beginPath(); ctx.arc(cx-11, drawY+3, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+10, drawY-1, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx-8, drawY-8, 3, 0, Math.PI*2); ctx.fill();

    // Sem barba (Clean shaven!) & Bochechas coradas super fofas pra ficar "bem bonito"
    ctx.fillStyle = 'rgba(255, 118, 117, 0.4)';
    ctx.beginPath(); ctx.ellipse(cx - 5, drawY + 8, 2, 1, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 5, drawY + 8, 2, 1, 0, 0, Math.PI*2); ctx.fill();

    // Olhos "sonolentos/calmos" super fofos
    ctx.strokeStyle = '#2d3436'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(cx - 5, drawY + 5); ctx.quadraticCurveTo(cx - 3, drawY + 4.5, cx - 1, drawY + 5.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 5, drawY + 5); ctx.quadraticCurveTo(cx + 3, drawY + 4.5, cx + 1, drawY + 5.5); ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(cx - 3, drawY + 5.5, 0.8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 3, drawY + 5.5, 0.8, 0, Math.PI*2); ctx.fill();
    
    // Boca de sorriso suave
    drawComplex(ctx, () => { ctx.moveTo(cx+3, drawY+11); ctx.arc(cx, drawY + 11, 3, 0, Math.PI); }, '#ff7675', '#111', 1.2); 

    // Braço direito (Pele livre) chamando em carinho
    drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(cx + 4, drawY + 11, 12, 5, 2.5) : ctx.fillRect(cx + 4, drawY + 11, 12, 5)), skinGrad);
    drawComplex(ctx, () => ctx.arc(cx + 15, drawY + 13.5, 2.5, 0, Math.PI*2), skinGrad); 
    drawComplex(ctx, () => ctx.arc(cx - 15, drawY + 13.5, 2.5, 0, Math.PI*2), skinGrad); 

    // Coração pulsante super luminoso!!
    const beat = 1 + Math.abs(Math.sin(Date.now() / 150)) * 0.4;
    ctx.translate(cx, drawY - 28); ctx.scale(beat, beat);
    ctx.font = '900 30px "Comic Sans MS"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff4757'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5;
    ctx.shadowBlur = 30; ctx.shadowColor = 'red'; 
    ctx.fillText('❤️', 0, 0); ctx.strokeText('❤️', 0, 0); 
    ctx.shadowBlur = 0;
    ctx.scale(1/beat, 1/beat); ctx.translate(-cx, -(drawY - 28));

    ctx.restore();
  }

  // === RENDERIZAÇÃO COMPLETA: ATMOSFERA REALISTA FOFA (SUNSET MAGICO) ===
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return; const ctx = canvas.getContext('2d');
    const e = engineRef.current; const p = e.player;

    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    // O PÔR DO SOL ROMÂNTICO VOLTOU! 🌇
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#10002b'); 
    skyGrad.addColorStop(0.5, '#7b2cbf'); 
    skyGrad.addColorStop(1, '#ff6b6b'); 
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // ESTRELAS CINTILANTES ✨
    ctx.translate(-e.camX * 0.05, 0);
    ctx.fillStyle = 'white';
    for(let star of e.decorations.stars) {
        ctx.globalAlpha = 0.2 + (Math.sin(Date.now()/500 + star.twinkle) + 1) / 2 * 0.8;
        ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    ctx.restore();

    ctx.save(); 
    // LUA SUPER BRILHANTE E MACIA ✨
    ctx.translate((canvas.width/2) - (e.camX * 0.03), 80);
    ctx.fillStyle = '#fffdfa'; ctx.shadowBlur = 60; ctx.shadowColor = '#fdcb6e';
    ctx.beginPath(); ctx.arc(0,0, 30, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    ctx.save(); 
    // NUVENS MACIAS E REDONDINHAS DE VOLTA!
    ctx.translate(-e.camX * 0.1, 0);
    for(let c of e.decorations.clouds) {
        const cloudGrad = ctx.createLinearGradient(0, c.y-20, 0, c.y+20);
        cloudGrad.addColorStop(0, '#f8a5c2'); cloudGrad.addColorStop(1, '#596275'); 
        drawComplex(ctx, () => {
            ctx.arc(c.x, c.y, 40 * c.scale, 0, Math.PI*2);
            ctx.arc(c.x + 30*c.scale, c.y - 15*c.scale, 35 * c.scale, 0, Math.PI*2);
            ctx.arc(c.x + 60*c.scale, c.y, 30 * c.scale, 0, Math.PI*2);
        }, cloudGrad, 'transparent', 0, true, 'rgba(255, 107, 107, 0.4)');
    }
    ctx.restore();

    ctx.save(); 
    // AS LINDAS MONTANHAS DA COR DO POR DO SOL ✨
    ctx.translate(-e.camX * 0.3, 0);
    for(let m of e.decorations.mountains) {
       drawComplex(ctx, () => { 
           ctx.moveTo(m.x, canvas.height); ctx.lineTo(m.x + m.w/2, canvas.height - m.h); ctx.lineTo(m.x + m.w, canvas.height); 
       }, m.color, '#000', 3, false);
       drawComplex(ctx, () => {
           ctx.moveTo(m.x + m.w/2, canvas.height - m.h); ctx.lineTo(m.x + m.w/2 - 20, canvas.height - m.h + 40); ctx.lineTo(m.x + m.w/2, canvas.height - m.h + 50); ctx.lineTo(m.x + m.w/2 + 20, canvas.height - m.h + 40); 
       }, '#eccc68', '#000', 2.5); 
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-e.camX, 0);

    // TERRA FOFA (Fundo Gradiente + Graminha Turquesa Iluminada) ✨
    for (let plat of e.platforms) {
      const platGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + 100);
      platGrad.addColorStop(0, '#d35400'); platGrad.addColorStop(1, '#2c3e50'); 
      
      drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(plat.x, plat.y, plat.w, plat.h + 20, 6) : ctx.fillRect(plat.x, plat.y, plat.w, plat.h + 20)), platGrad, '#111', 3.5);
      
      ctx.fillStyle = '#1e272e'; ctx.globalAlpha = 0.5;
      for(let tx = plat.x + 20; tx < plat.x + plat.w - 20; tx += 45) {
          ctx.beginPath(); ctx.arc(tx, plat.y + 25, 4, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(tx + 15, plat.y + 60, 2, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // GLOW NAS GRAMAS!
      drawComplex(ctx, () => (ctx.roundRect ? ctx.roundRect(plat.x - 4, plat.y - 4, plat.w + 8, 20, 10) : ctx.fillRect(plat.x - 4, plat.y - 4, plat.w + 8, 20)), '#1abc9c', '#111', 3.5, true, 'rgba(26, 188, 156, 0.5)'); 
    }

    for (let it of e.items) { if (!it.collected) drawItemMail(ctx, it.x, it.y, it.w, it.h, it.animPos); }
    for (let en of e.enemies) { if (en.alive) { if (en.type === 'UFPI') drawEnemyUFPI(ctx, en.x, en.y, en.w, en.h, en.animPos); else if (en.type === 'DISTANCIA') drawEnemyDistancia(ctx, en.x, en.y, en.w, en.h, en.animPos); } }

    // Partículas Macias Circulares
    for (let pt of e.particles) {
       ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2); ctx.globalAlpha = pt.life; 
       ctx.fillStyle = pt.color; ctx.shadowBlur = 10; ctx.shadowColor = pt.color; ctx.fill(); ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1.0;

    drawJoao(ctx, e.goal.x, e.goal.y + 10, e.goal.w, e.goal.h);

    drawComplex(ctx, () => ctx.roundRect(e.goal.x - 20, e.goal.y + 45, 60, 15, 5), '#ff4757', '#111', 3, true, 'red');
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

  // === UI FOFA NEON (BLURRED GLASS) RETORNA 💖 ===
  return (
    <div className="min-h-screen bg-[#110515] flex flex-col items-center justify-center p-2 relative overflow-hidden font-sans select-none fill-neutral">
      
      <div className="absolute top-4 left-4 z-50">
        <Link to="/" className="text-white hover:text-[#ffb8b8] flex items-center gap-2 bg-[#1e0a2e]/80 backdrop-blur-md px-4 py-2 rounded-full transition-all shadow-lg border border-white/10 active:scale-95">
          <ArrowLeft size={20} strokeWidth={3} /> <span className="font-bold tracking-widest uppercase text-sm">Início</span>
        </Link>
      </div>

      <div className="w-full max-w-[600px] mb-3 mt-10 sm:mt-0 flex items-center justify-between z-10 px-2">
        <h2 className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#ffeaa7] to-[#ff7675] drop-shadow-md font-black uppercase flex items-center gap-2 tracking-widest">
          Aventura <Gamepad2 size={32} className="text-[#ff7675]" />
        </h2>
        <div className="bg-[#1e0a2e]/80 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-[0_0_15px_rgba(255,118,117,0.3)]">
           <Mail size={20} className="text-[#ff7675]" fill="#ff7675" />
           <span className="text-white font-black text-xl pt-1 leading-none drop-shadow-[0_2px_4px_black]">{score}</span>
        </div>
      </div>

      <div className="w-full max-w-[600px] relative bg-[#10002b] border-[4px] border-[#5a2e8c] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(123,44,191,0.5)]">
        
        <canvas 
          ref={canvasRef}
          width={400} 
          height={300} 
          className="w-full h-[45vh] sm:h-[55vh] object-cover block"
          style={{ imageRendering: 'pixelated' }}
        />

        {gameState === 'START' && (
          <div className="absolute inset-0 bg-[#10002b]/80 flex flex-col items-center justify-center z-20 p-6 text-center backdrop-blur-sm border-[4px] border-[#7b2cbf] m-1 rounded-2xl shadow-inner">
             <Trophy size={60} className="text-[#ffeaa7] drop-shadow-[0_0_15px_rgba(255,234,167,0.8)] animate-pulse mb-2" />
             <h3 className="text-4xl font-black text-white mb-2 uppercase drop-shadow-[0_2px_2px_black] bg-clip-text text-transparent bg-gradient-to-b from-white to-[#ffb8b8]">Vai Lá!</h3>
             <p className="text-white text-[15px] font-medium mb-8 max-w-sm drop-shadow-[0_2px_2px_black] opacity-90">
               Pule na <b className="text-[#ff4757]">UFPI</b> e destrua a triste <b className="text-[#bba3ff]">Distância!</b> Colecione <b className="text-[#ff7675]">Cartinhas de Amor</b> e me encontre!
             </p>
             <button onClick={startGame} className="bg-gradient-to-b from-[#ff7675] to-[#d63031] text-white font-black text-2xl py-4 px-12 rounded-full shadow-[0_0_20px_rgba(214,48,49,0.8)] border border-white/50 active:scale-95 transition-all uppercase tracking-widest hover:scale-105">
               JOGAR
             </button>
          </div>
        )}

        {gameState === 'DEATH' && (
          <div className="absolute inset-0 bg-[#d63031]/90 flex flex-col items-center justify-center z-20 p-6 text-center backdrop-blur-md border-[4px] border-[#ff7675] m-1 rounded-2xl">
             <h3 className="text-6xl font-black text-[#ffeaa7] mb-2 uppercase drop-shadow-[0_0_20px_rgba(255,234,167,0.8)]">VIXE!</h3>
             <p className="text-white text-lg font-bold mb-8 drop-shadow-[0_2px_4px_black]">
               {deathCause === 'UFPI' && 'A UFPI te pegou! Pule nela com classe.'}
               {deathCause === 'DISTANCIA' && 'A Distância te deprimiu... Acabe com a saudade!'}
               {deathCause === 'FALL' && 'Você caiu no abismo! Cuidado com a grama macia.'}
             </p>
             <button onClick={startGame} className="bg-white text-[#d63031] font-black text-xl py-4 px-10 rounded-full flex gap-3 items-center shadow-[0_0_25px_rgba(255,255,255,0.6)] active:scale-95 transition-all shadow-inner hover:bg-neutral-100">
               <RefreshCw size={24} className="animate-spin-slow" /> Tentar Denovo
             </button>
          </div>
        )}

        {gameState === 'WIN' && (
          <div className="absolute inset-0 bg-[#1e0a2e]/90 flex flex-col items-center justify-center z-50 p-6 text-center backdrop-blur-md border-[4px] border-[#a29bfe] m-1 rounded-2xl">
             <Heart size={80} className="text-[#ff4757] drop-shadow-[0_0_30px_rgba(255,71,87,1)] mb-4 fill-[#ff4757] animate-pulse" />
             <h3 className="text-5xl font-black text-[#ffeaa7] mb-1 uppercase drop-shadow-[0_0_20px_rgba(255,234,167,0.8)]">VITÓRIA!</h3>
             <p className="text-white/90 text-lg font-medium mb-3 max-w-sm drop-shadow-[0_2px_4px_black]">
               Você recolheu <span className="text-[#ff7675] text-2xl font-black mx-1 drop-shadow-[0_0_10px_red]">{score}</span> cartinhas de amor!
             </p>
             <p className="text-white text-base font-bold mb-8 max-w-sm drop-shadow-[0_2px_4px_black] opacity-80 backdrop-blur-sm bg-black/20 p-3 rounded-xl border border-white/10">
               Pode fechar o jogo e me cobrar a Carta Física agora mesmo! Meu amor!
             </p>
             <Link to="/" className="text-white/70 font-semibold text-sm uppercase underline decoration-2 hover:text-white transition-colors">
                Retornar ao Aplicativo
             </Link>
          </div>
        )}

      </div>

      <div className="w-full max-w-[600px] mt-8 px-4 flex justify-between items-end gap-4 select-none touch-none h-28 relative z-10 transition-transform">
         <div className="flex gap-4">
            <button 
              onPointerDown={handleTouch('left', true)} onPointerUp={handleTouch('left', false)} onPointerLeave={handleTouch('left', false)} onContextMenu={e => e.preventDefault()}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1e0a2e]/60 border border-white/20 rounded-2xl flex items-center justify-center text-white/50 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)] active:scale-90 active:bg-white/20 active:text-white touch-none transition-all"
            >
               <ArrowLeft size={36} strokeWidth={2.5} />
            </button>
            <button 
              onPointerDown={handleTouch('right', true)} onPointerUp={handleTouch('right', false)} onPointerLeave={handleTouch('right', false)} onContextMenu={e => e.preventDefault()}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1e0a2e]/60 border border-white/20 rounded-2xl flex items-center justify-center text-white/50 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)] active:scale-90 active:bg-white/20 active:text-white touch-none transition-all"
            >
               <ArrowRight size={36} strokeWidth={2.5} />
            </button>
         </div>
         <div className="flex pb-2">
            <button 
              onPointerDown={handleTouch('up', true)} onPointerUp={handleTouch('up', false)} onPointerLeave={handleTouch('up', false)} onContextMenu={e => e.preventDefault()}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-t from-[#d63031] to-[#ff7675] border border-white/40 rounded-full flex items-center justify-center text-white shadow-[0_0_25px_rgba(255,118,117,0.4)] active:scale-90 touch-none transition-all"
            >
               <ArrowUp size={44} strokeWidth={3} />
            </button>
         </div>
      </div>

    </div>
  )
}
