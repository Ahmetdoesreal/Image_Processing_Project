const byId = (id) => document.getElementById(id);
const open = byId('open');
const sample = byId('sample');
const analyze = byId('analyze');
const save = byId('save');
const qualityInputs = [byId('quality-a'), byId('quality-b')];
const status = byId('status');
const filename = byId('filename');
const gallery = byId('gallery');
const viewport = byId('viewport');
const resetView = byId('reset-view');
const panHint = byId('pan-hint');
const overlay = byId('overlay');
const opacity = byId('opacity');
const zoom = byId('zoom');
const formatNumber = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });

let selectedName;
let lastResult;
let panX = 0;
let panY = 0;
let drag;

const zoomScale = () => Number(zoom.value) / 100;

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function syncView() {
  const scale = zoomScale();
  const limit = (scale - 1) / 2;
  panX = Math.max(-limit, Math.min(limit, panX));
  panY = Math.max(-limit, Math.min(limit, panY));
  const zoomed = Boolean(lastResult) && scale > 1;
  gallery.toggleAttribute('data-zoomed', zoomed);
  panHint.hidden = !zoomed;
  resetView.disabled = !zoomed;
  zoom.disabled = !lastResult;
  overlay.disabled = !lastResult;
  opacity.disabled = !lastResult || !overlay.checked;
  gallery.style.setProperty('--opacity', overlay.checked ? opacity.value / 100 : 1);
  gallery.style.setProperty('--zoom', scale);
  gallery.style.setProperty('--pan-x', `${panX * 100}%`);
  gallery.style.setProperty('--pan-y', `${panY * 100}%`);
}

function resetPosition() {
  zoom.value = '100';
  panX = 0;
  panY = 0;
  syncView();
}

function setBusy(busy) {
  for (const control of [open, sample, analyze, ...qualityInputs]) control.disabled = busy;
  save.disabled = busy || !lastResult;
}

function errorText(error) {
  return error.message.replace(/^Error invoking remote method '[^']+': (Error: )?/, '');
}

function resultSummary(result) {
  const conversion = result.format === 'JPEG' ? '' : ' · Girdinin JPEG’e dönüşüm farkı';
  return `${result.format} · ${result.width} × ${result.height} piksel${conversion}`;
}

function panel(title, original, result) {
  const figure = byId('panel').content.firstElementChild.cloneNode(true);
  figure.querySelector('figcaption').textContent = title;
  const source = figure.querySelector('.source');
  source.src = original;
  source.alt = 'Giriş görüntüsü';
  if (result) {
    source.alt = '';
    const heatmap = figure.querySelector('.heatmap');
    heatmap.src = result.heatmap;
    heatmap.alt = title + ' ELA haritası';
    heatmap.hidden = false;
    figure.querySelector('.metrics').textContent = resultMetrics(result);
  }
  return figure;
}

async function run(selectImage) {
  if (analyze.disabled) return;
  setBusy(true);
  try {
    if (selectImage) {
      const name = await selectImage();
      if (!name) return;
      selectedName = name;
      filename.textContent = name;
      resetPosition();
    }
    if (!selectedName) {
      showStatus('Önce bir dosya veya örnek aç.');
      return;
    }

    const qualities = qualityInputs.map((input) => input.valueAsNumber);
    lastResult = undefined;
    gallery.replaceChildren();
    syncView();
    if (!qualities.every((quality) => Number.isInteger(quality) && quality >= 1 && quality <= 100)) {
      showStatus('JPEG kalitelerini 1–100 arasında gir.', true);
      return;
    }
    showStatus('Analiz ediliyor…');
    const result = await window.imageSpatter.analyze(qualities);
    lastResult = result;
    gallery.style.setProperty('--image-ratio', result.width / result.height);
    gallery.replaceChildren(
      panel('Giriş', result.preview),
      ...result.results.map((item) => panel(`JPEG kalite ${item.quality}`, result.preview, item)),
    );
    syncView();
    showStatus(resultSummary(result));
  } catch (error) {
    lastResult = undefined;
    gallery.replaceChildren();
    syncView();
    showStatus(errorText(error), true);
  } finally {
    setBusy(false);
  }
}

save.addEventListener('click', async () => {
  if (save.disabled || !lastResult) return;
  setBusy(true);
  try {
    const bytes = await comparisonPng(lastResult, overlay.checked ? opacity.valueAsNumber / 100 : 1);
    const savedName = await window.imageSpatter.saveComparison(bytes);
    if (savedName) showStatus(`${resultSummary(lastResult)} · ${savedName} kaydedildi`);
  } catch (error) {
    showStatus(errorText(error), true);
  } finally {
    setBusy(false);
  }
});

gallery.addEventListener('pointerdown', (event) => {
  const picture = event.target.closest('.picture');
  if (!picture || zoomScale() <= 1 || drag || event.button !== 0 || !event.isPrimary) return;
  event.preventDefault();
  viewport.focus({ preventScroll: true });
  const { width, height } = picture.getBoundingClientRect();
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, width, height };
  gallery.setPointerCapture(event.pointerId);
  gallery.setAttribute('data-panning', '');
});

gallery.addEventListener('pointermove', (event) => {
  if (drag?.id !== event.pointerId) return;
  panX += (event.clientX - drag.x) / drag.width;
  panY += (event.clientY - drag.y) / drag.height;
  drag.x = event.clientX;
  drag.y = event.clientY;
  syncView();
});

gallery.addEventListener('lostpointercapture', (event) => {
  if (drag?.id !== event.pointerId) return;
  drag = undefined;
  gallery.removeAttribute('data-panning');
});

const arrowShifts = new Map([
  ['ArrowLeft', [0.07, 0]], ['ArrowRight', [-0.07, 0]],
  ['ArrowUp', [0, 0.07]], ['ArrowDown', [0, -0.07]],
]);
viewport.addEventListener('keydown', (event) => {
  const shift = arrowShifts.get(event.key);
  if (!shift || !lastResult || zoomScale() <= 1) return;
  event.preventDefault();
  panX += shift[0];
  panY += shift[1];
  syncView();
});
resetView.addEventListener('click', resetPosition);

open.addEventListener('click', () => run(async () => {
  const name = await window.imageSpatter.open();
  if (name) sample.value = '';
  return name;
}));
sample.addEventListener('change', () => {
  if (sample.value) run(() => window.imageSpatter.sample(sample.value));
});
byId('controls').addEventListener('submit', (event) => {
  event.preventDefault();
  run();
});
for (const control of [overlay, opacity, zoom]) control.addEventListener('input', syncView);
syncView();
