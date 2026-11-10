'use strict';

// Datos del caso CloudScale Inc. Q se expresa en miles de transacciones.
const POINTS = [
  { L: 0, Q: 0, CVT: 0 }, { L: 1, Q: 10, CVT: 3000 },
  { L: 2, Q: 25, CVT: 6000 }, { L: 3, Q: 45, CVT: 9000 },
  { L: 4, Q: 60, CVT: 12000 }, { L: 5, Q: 70, CVT: 15000 },
  { L: 6, Q: 75, CVT: 18000 }
];
const CFT = 12000;
const $ = id => document.getElementById(id);
const money = (n, decimals = 2) => Number.isFinite(n)
  ? '$' + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '—';
const number = (n, decimals = 2) => Number.isFinite(n)
  ? n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '—';

// Interpolación lineal entre puntos observados; nunca extrapola fuera de Q=0..75.
function variableCostAt(q) {
  if (!Number.isFinite(q) || q < 0 || q > 75) throw new Error('Ingresa Q entre 0 y 75 mil transacciones. No se extrapola el corto plazo.');
  if (q === 0) return { value: 0, estimated: false, segment: null };
  for (let i = 1; i < POINTS.length; i++) {
    const a = POINTS[i - 1], b = POINTS[i];
    if (q <= b.Q) {
      const value = a.CVT + (q - a.Q) * (b.CVT - a.CVT) / (b.Q - a.Q);
      const observed = POINTS.some(point => Math.abs(point.Q - q) < 1e-8);
      return { value, estimated: !observed, segment: [a, b] };
    }
  }
  throw new Error('No existen datos para ese volumen.');
}

function calculate(q, price) {
  if (!Number.isFinite(q) || !Number.isFinite(price) || price < 0) throw new Error('Ingresa valores numéricos válidos y un precio no negativo.');
  const variable = variableCostAt(q);
  const totalCost = CFT + variable.value;
  if (q === 0) return { q, price, cvt: 0, ct: totalCost, cfm: NaN, cvm: NaN, ctm: NaN, cmg: NaN, revenue: 0, profit: -CFT, decision: 'Sin producción', kind: 'neutral', detail: 'Q = 0. Los costos medios no están definidos; el costo fijo mensual permanece en $12,000.', estimated: false };
  const cfm = CFT / q, cvm = variable.value / q, ctm = totalCost / q;
  const cmg = (variable.segment[1].CVT - variable.segment[0].CVT) / (variable.segment[1].Q - variable.segment[0].Q);
  const revenue = price * q, profit = revenue - totalCost;
  let decision, kind, detail;
  if (price < cvm - 1e-8) {
    decision = 'Cierre temporal'; kind = 'danger';
    detail = 'El precio no cubre el costo variable medio. Producir generaría una pérdida superior al costo fijo.';
  } else if (Math.abs(price - cvm) < 1e-8) {
    decision = 'Indiferente en el margen'; kind = 'warning';
    detail = 'El precio iguala el CVM; la pérdida es igual al costo fijo total.';
  } else if (price < ctm - 1e-8) {
    decision = 'Operar con pérdidas'; kind = 'warning';
    detail = 'El precio cubre los costos variables y parte de los costos fijos. Conviene continuar en el corto plazo.';
  } else if (Math.abs(price - ctm) < 1e-8) {
    decision = 'Punto de equilibrio'; kind = 'success';
    detail = 'El precio iguala el CTM. Se cubren todos los costos y el beneficio económico es cero.';
  } else {
    decision = 'Operar con ganancia'; kind = 'success';
    detail = 'El precio supera el CTM. Los ingresos cubren todos los costos y generan beneficio positivo.';
  }
  return { q, price, cvt: variable.value, ct: totalCost, cfm, cvm, ctm, cmg, revenue, profit, decision, kind, detail, estimated: variable.estimated };
}

function renderResults() {
  const q = Number($('q').value), price = Number($('price').value);
  try {
    const r = calculate(q, price);
    if (q === 0) {
      $('results').innerHTML = `<div class="kpis"><div class="kpi"><span>CFT</span><strong>${money(CFT, 0)}</strong></div><div class="kpi"><span>CVT</span><strong>${money(0, 0)}</strong></div><div class="kpi"><span>CT</span><strong>${money(CFT, 0)}</strong></div></div><div class="decision neutral"><b>${r.decision}</b><p>${r.detail}</p></div>`;
      return;
    }
    const rows = [['CVT', r.cvt], ['CT', r.ct], ['CFM', r.cfm], ['CVM', r.cvm], ['CTM', r.ctm], ['CMg', r.cmg], ['Ingreso total', r.revenue], ['Resultado', r.profit]];
    $('results').innerHTML = `<div class="kpis">${rows.map(([label, value]) => `<div class="kpi"><span>${label}</span><strong ${label === 'Resultado' ? `style="color:${value >= 0 ? '#15976c' : '#d6535d'}"` : ''}>${money(value)}</strong></div>`).join('')}</div><div class="decision ${r.kind}"><b>${r.decision}　<span class="pill">${r.estimated ? 'ESTIMADO · INTERPOLACIÓN' : 'PUNTO OBSERVADO'}</span></b><p>${r.detail}</p><p>Q = ${number(q)} mil · P = ${money(price)} · CTM = ${money(r.ctm)}</p></div>`;
  } catch (error) {
    $('results').innerHTML = `<div class="decision danger"><b>Dato inválido</b><p>${error.message}</p></div>`;
  }
}

function renderTable() {
  $('data-table').innerHTML = POINTS.map((p, i) => {
    const previous = POINTS[i - 1], ct = CFT + p.CVT;
    const cfm = p.Q ? CFT / p.Q : NaN, cvm = p.Q ? p.CVT / p.Q : NaN, ctm = p.Q ? ct / p.Q : NaN;
    const cmg = previous ? (p.CVT - previous.CVT) / (p.Q - previous.Q) : NaN;
    const pmg = previous ? (p.Q - previous.Q) / (p.L - previous.L) : NaN;
    const pme = p.L ? p.Q / p.L : NaN;
    const values = [p.L, p.Q, number(CFT, 0), number(p.CVT, 0), number(ct, 0), number(cfm), number(cvm), number(ctm), number(cmg, 0), number(pmg, 0), number(pme, 1)];
    return `<tr>${values.map(v => `<td>${v}</td>`).join('')}</tr>`;
  }).join('');
}

function selectPlant(q) {
  if (q < 40) return { name: 'Pequeña', technology: 'Monolito en VM dedicada', averageCost: 400 };
  if (q <= 90) return { name: 'Mediana', technology: 'Kubernetes / Microservicios', averageCost: 280 };
  return { name: 'Grande', technology: 'Multi-Cloud Distributed Serverless', averageCost: 350 };
}
function renderLongTerm() {
  const q = Number($('long-q').value);
  if (!Number.isFinite(q) || q < 0) {
    $('long-result').innerHTML = '<h3>Dato inválido</h3><p>Ingresa un volumen igual o mayor que cero.</p>';
    return;
  }
  $('long-range').value = Math.min(150, q);
  const plant = selectPlant(q), total = plant.averageCost * q;
  $('long-result').innerHTML = `<h3>Recomendación de infraestructura</h3><p class="subtle">Selección automática según el rango de capacidad.</p><span class="eyebrow">PLANTA ${plant.name.toUpperCase()}</span><div class="long-cost">${money(plant.averageCost, 0)} <small>/ mil transacciones</small></div><b>${plant.technology}</b><p>Para Q = ${number(q)} mil, el costo total de largo plazo estimado es ${money(total)}.</p><div class="kpis"><div class="kpi"><span>Volumen Q</span><strong>${number(q)} mil</strong></div><div class="kpi"><span>CMeLP</span><strong>${money(plant.averageCost, 0)}</strong></div><div class="kpi"><span>CTLP</span><strong>${money(total)}</strong></div></div>`;
}

// Gráficas con Canvas nativo: no requiere librerías externas.
function drawChart(canvasId, series, maxY, maxX) {
  const canvas = $(canvasId); if (!canvas) return;
  const width = canvas.clientWidth || 400, height = 250, ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio; canvas.height = height * ratio;
  const ctx = canvas.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const pad = { left: 43, right: 12, top: 12, bottom: 30 }, plotW = width - pad.left - pad.right, plotH = height - pad.top - pad.bottom;
  const all = series.flatMap(s => s.values.map(p => p[1]).filter(Number.isFinite));
  const top = maxY || Math.max(...all) * 1.12 || 1;
  const x = q => pad.left + q / maxX * plotW, y = v => pad.top + plotH - v / top * plotH;
  ctx.font = '9px Arial'; ctx.strokeStyle = '#edf0f5'; ctx.fillStyle = '#929bad'; ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) { const value = top * i / 4, py = y(value); ctx.beginPath(); ctx.moveTo(pad.left, py); ctx.lineTo(width - pad.right, py); ctx.stroke(); ctx.fillText(Math.round(value), pad.left - 7, py + 3); }
  ctx.textAlign = 'center'; [0, 10, 25, 40, 60, 70, 75, 90, 100, 120, 150].filter(v => v <= maxX).forEach(v => ctx.fillText(v, x(v), height - 13));
  series.forEach(s => { ctx.strokeStyle = s.color; ctx.lineWidth = 2.3; ctx.beginPath(); s.values.forEach((point, i) => i ? ctx.lineTo(x(point[0]), y(point[1])) : ctx.moveTo(x(point[0]), y(point[1]))); ctx.stroke(); s.values.forEach(point => { ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(x(point[0]), y(point[1]), 3, 0, Math.PI * 2); ctx.fill(); }); });
}
function renderCharts() {
  const observed = POINTS.slice(1);
  drawChart('average-chart', [
    { color: '#5270e7', values: observed.map(p => [p.Q, CFT / p.Q]) },
    { color: '#9476dc', values: observed.map(p => [p.Q, p.CVT / p.Q]) },
    { color: '#21a77c', values: observed.map(p => [p.Q, (CFT + p.CVT) / p.Q]) }
  ], undefined, 75);
  drawChart('marginal-chart', [{ color: '#e2a23f', values: observed.map((p, i) => [(p.Q + POINTS[i].Q) / 2, (p.CVT - POINTS[i].CVT) / (p.Q - POINTS[i].Q)]) }], 650, 75);
  drawChart('long-chart', [{ color: '#8065d9', values: [[0, 400], [39.9, 400], [40, 280], [90, 280], [90.1, 350], [150, 350]] }], 450, 150);
}

function downloadCSV() {
  const rows = [['L', 'Q_miles', 'CFT', 'CVT', 'CT', 'CFM', 'CVM', 'CTM', 'CMg', 'PMgL', 'PMeL']];
  POINTS.forEach((p, i) => {
    const prev = POINTS[i - 1], q = p.Q;
    rows.push([p.L, q, CFT, p.CVT, CFT + p.CVT, q ? CFT / q : '', q ? p.CVT / q : '', q ? (CFT + p.CVT) / q : '', prev ? (p.CVT - prev.CVT) / (p.Q - prev.Q) : '', prev ? (p.Q - prev.Q) / (p.L - prev.L) : '', p.L ? p.Q / p.L : '']);
  });
  const blob = new Blob(['\uFEFF' + rows.map(row => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = 'TechCost_datos_corto_plazo.csv'; link.click(); URL.revokeObjectURL(url);
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', page.id === pageId));
  document.querySelectorAll('.nav-btn').forEach(button => button.classList.toggle('active', button.dataset.page === pageId));
  const labels = { inicio: 'Resumen general', 'corto-plazo': 'Costos de corto plazo', 'largo-plazo': 'Costos de largo plazo', tecnologia: 'Solución tecnológica', metodologia: 'Metodología y datos' };
  $('breadcrumb').textContent = labels[pageId] || 'TechCost';
  if (pageId === 'corto-plazo' || pageId === 'largo-plazo') renderCharts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => showPage(button.dataset.page)));
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showPage(button.dataset.go)));
  $('q').addEventListener('input', () => { const value = Number($('q').value); if (value >= 0 && value <= 75) $('q-range').value = value; renderResults(); });
  $('q-range').addEventListener('input', () => { $('q').value = $('q-range').value; renderResults(); });
  $('price').addEventListener('input', renderResults);
  $('calculate').addEventListener('click', renderResults);
  $('reset').addEventListener('click', () => { $('q').value = 45; $('q-range').value = 45; $('price').value = 500; renderResults(); });
  $('long-q').addEventListener('input', renderLongTerm);
  $('long-range').addEventListener('input', () => { $('long-q').value = $('long-range').value; renderLongTerm(); });
  $('download-csv').addEventListener('click', downloadCSV);
  renderTable(); renderResults(); renderLongTerm();
  window.addEventListener('resize', renderCharts);
});
