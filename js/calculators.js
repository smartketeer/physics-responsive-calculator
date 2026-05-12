// ── UTILITIES ────────────────────────────────────────
const K = 8.99e9;      // Coulomb's constant N·m²/C²
const E_CHARGE = 1.6e-19; // Elementary charge C

function fmt(val) {
  if (Math.abs(val) === 0) return '0';
  if (Math.abs(val) >= 1e-3 && Math.abs(val) < 1e7) {
    return parseFloat(val.toPrecision(5)).toString();
  }
  return val.toExponential(4);
}

function showResult(id, value, unit, note = '') {
  const box = document.getElementById(id);
  if (!box) return;
  box.className = 'result-box show';
  box.innerHTML = `
    <div class="result-label">✓ Result</div>
    <div class="result-value">${fmt(value)} <span style="font-size:1rem;color:var(--text-muted)">${unit}</span></div>
    ${note ? `<div class="result-note">${note}</div>` : ''}
  `;
}

function showError(id, msg) {
  const box = document.getElementById(id);
  if (!box) return;
  box.className = 'result-box error-box show';
  box.innerHTML = `<div class="result-label">⚠ Error</div><div class="result-note" style="color:var(--error)">${msg}</div>`;
}

function getVal(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  return parseFloat(el.value);
}

function allValid(...vals) {
  return vals.every(v => !isNaN(v) && v !== null && v !== undefined);
}

// ── OHM'S LAW ────────────────────────────────────────
function calcOhm() {
  const solve = document.getElementById('ohm-solve').value;
  let result, unit, note;

  if (solve === 'V') {
    const I = getVal('ohm-I'), R = getVal('ohm-R');
    if (!allValid(I, R)) return showError('ohm-result', 'Please enter valid values for Current (I) and Resistance (R).');
    result = I * R; unit = 'V';
    note = `Voltage across the component with I = ${fmt(I)} A and R = ${fmt(R)} Ω`;
  } else if (solve === 'I') {
    const V = getVal('ohm-V'), R = getVal('ohm-R');
    if (!allValid(V, R)) return showError('ohm-result', 'Please enter valid values for Voltage (V) and Resistance (R).');
    if (R === 0) return showError('ohm-result', 'Resistance cannot be zero.');
    result = V / R; unit = 'A';
    note = `Current flowing through the circuit`;
  } else {
    const V = getVal('ohm-V'), I = getVal('ohm-I');
    if (!allValid(V, I)) return showError('ohm-result', 'Please enter valid values for Voltage (V) and Current (I).');
    if (I === 0) return showError('ohm-result', 'Current cannot be zero.');
    result = V / I; unit = 'Ω';
    note = `Resistance of the component`;
  }

  showResult('ohm-result', result, unit, note);
}

function updateOhmFields() {
  const solve = document.getElementById('ohm-solve').value;
  const fields = { V: 'ohm-V-group', I: 'ohm-I-group', R: 'ohm-R-group' };
  Object.entries(fields).forEach(([key, gid]) => {
    const g = document.getElementById(gid);
    if (g) g.style.display = (key === solve) ? 'none' : 'block';
  });
  const res = document.getElementById('ohm-result');
  if (res) res.className = 'result-box';
  const fLabel = document.getElementById('ohm-formula-label');
  const formulas = { V: 'V = I × R', I: 'I = V / R', R: 'R = V / I' };
  if (fLabel) fLabel.textContent = formulas[solve];
}

// ── ELECTRIC POWER ────────────────────────────────────
function calcPower() {
  const solve = document.getElementById('pow-solve').value;
  let result, unit, note;

  if (solve === 'P') {
    const V = getVal('pow-V'), I = getVal('pow-I');
    if (!allValid(V, I)) return showError('pow-result', 'Please enter valid values for Voltage (V) and Current (I).');
    result = V * I; unit = 'W';
    note = `Power consumed by the device`;
  } else if (solve === 'V') {
    const P = getVal('pow-P'), I = getVal('pow-I');
    if (!allValid(P, I)) return showError('pow-result', 'Please enter valid values for Power (P) and Current (I).');
    if (I === 0) return showError('pow-result', 'Current cannot be zero.');
    result = P / I; unit = 'V';
    note = `Voltage across the device`;
  } else {
    const P = getVal('pow-P'), V = getVal('pow-V');
    if (!allValid(P, V)) return showError('pow-result', 'Please enter valid values for Power (P) and Voltage (V).');
    if (V === 0) return showError('pow-result', 'Voltage cannot be zero.');
    result = P / V; unit = 'A';
    note = `Current through the device`;
  }

  showResult('pow-result', result, unit, note);
}

function updatePowerFields() {
  const solve = document.getElementById('pow-solve').value;
  const fields = { P: 'pow-P-group', V: 'pow-V-group', I: 'pow-I-group' };
  Object.entries(fields).forEach(([key, gid]) => {
    const g = document.getElementById(gid);
    if (g) g.style.display = (key === solve) ? 'none' : 'block';
  });
  const res = document.getElementById('pow-result');
  if (res) res.className = 'result-box';
  const fLabel = document.getElementById('pow-formula-label');
  const formulas = { P: 'P = V × I', V: 'V = P / I', I: 'I = P / V' };
  if (fLabel) fLabel.textContent = formulas[solve];
}

// ── COULOMB'S LAW ─────────────────────────────────────
function calcCoulomb() {
  const q1 = getVal('coul-q1'), q2 = getVal('coul-q2'), r = getVal('coul-r');
  if (!allValid(q1, q2, r)) return showError('coul-result', 'Please enter valid values for q₁, q₂, and r.');
  if (r <= 0) return showError('coul-result', 'Distance r must be greater than zero.');
  const F = K * Math.abs(q1) * Math.abs(q2) / (r * r);
  const nature = (q1 * q2 > 0) ? 'repulsive' : (q1 * q2 < 0) ? 'attractive' : 'zero';
  showResult('coul-result', F, 'N', `The electrostatic force is ${nature} (k = 8.99×10⁹ N·m²/C²)`);
}

// ── ELECTRIC FIELD ────────────────────────────────────
let efMode = 'fq';

function setEFMode(mode) {
  efMode = mode;
  document.getElementById('ef-mode-fq').style.display = (mode === 'fq') ? 'block' : 'none';
  document.getElementById('ef-mode-kq').style.display = (mode === 'kq') ? 'block' : 'none';
  document.querySelectorAll('.ef-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  const fLabel = document.getElementById('ef-formula-label');
  if (fLabel) fLabel.textContent = mode === 'fq' ? 'E = F / q' : 'E = kQ / r²';
  const res = document.getElementById('ef-result');
  if (res) res.className = 'result-box';
}

function calcEField() {
  let result, note;
  if (efMode === 'fq') {
    const F = getVal('ef-F'), q = getVal('ef-q');
    if (!allValid(F, q)) return showError('ef-result', 'Please enter valid values for F and q.');
    if (q === 0) return showError('ef-result', 'Test charge q cannot be zero.');
    result = F / q;
    note = `Electric field strength at the location of charge q`;
  } else {
    const Q = getVal('ef-Q'), r = getVal('ef-r');
    if (!allValid(Q, r)) return showError('ef-result', 'Please enter valid values for Q and r.');
    if (r <= 0) return showError('ef-result', 'Distance r must be greater than zero.');
    result = K * Math.abs(Q) / (r * r);
    note = `Electric field at distance r from source charge Q`;
  }
  showResult('ef-result', result, 'N/C', note);
}

// ── MAGNETIC FORCE ON WIRE ────────────────────────────
function calcMagWire() {
  const B = getVal('mw-B'), I = getVal('mw-I'), L = getVal('mw-L'), theta = getVal('mw-theta');
  if (!allValid(B, I, L, theta)) return showError('mw-result', 'Please enter valid values for B, I, L, and θ.');
  if (B < 0 || I < 0 || L <= 0) return showError('mw-result', 'B, I must be ≥ 0 and L must be > 0.');
  const rad = theta * Math.PI / 180;
  const F = B * I * L * Math.sin(rad);
  showResult('mw-result', Math.abs(F), 'N', `Magnetic force on the current-carrying wire (sin${theta}° = ${Math.sin(rad).toFixed(4)})`);
}

// ── MAGNETIC FORCE ON CHARGE ──────────────────────────
function calcMagCharge() {
  const q = getVal('mc-q'), v = getVal('mc-v'), B = getVal('mc-B'), theta = getVal('mc-theta');
  if (!allValid(q, v, B, theta)) return showError('mc-result', 'Please enter valid values for q, v, B, and θ.');
  if (v < 0 || B < 0) return showError('mc-result', 'Speed v and field B must be ≥ 0.');
  const rad = theta * Math.PI / 180;
  const F = Math.abs(q) * v * B * Math.sin(rad);
  showResult('mc-result', F, 'N', `Magnetic (Lorentz) force on the moving charge (sin${theta}° = ${Math.sin(rad).toFixed(4)})`);
}

// ── NAV HAMBURGER ─────────────────────────────────────
function initNav() {
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (ham && links) {
    ham.addEventListener('click', () => links.classList.toggle('open'));
  }
  // Mark active link
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ── INIT ON LOAD ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();

  // Initialize dynamic field display
  if (document.getElementById('ohm-solve')) updateOhmFields();
  if (document.getElementById('pow-solve')) updatePowerFields();
  if (document.getElementById('ef-formula-label')) setEFMode('fq');

  // Hero particle animation
  const container = document.querySelector('.hero-bg-particles');
  if (container) {
    const colors = ['rgba(99,102,241,0.5)', 'rgba(6,182,212,0.5)', 'rgba(245,158,11,0.4)'];
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 8 + 4;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        background:${colors[i % colors.length]};
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        animation-delay:${Math.random() * 6}s;
        animation-duration:${6 + Math.random() * 6}s;
        filter:blur(1px);
      `;
      container.appendChild(p);
    }
  }

  // Scroll fade-in for cards
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.calc-card, .problem-card, .team-card, .overview-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
});
