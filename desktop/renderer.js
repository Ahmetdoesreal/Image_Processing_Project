const byId = (id) => document.getElementById(id);
const open = byId('open');
const sample = byId('sample');
const analyze = byId('analyze');
const qualityInputs = [byId('quality-a'), byId('quality-b')];
const status = byId('status');
const filename = byId('filename');
const gallery = byId('gallery');
const overlay = byId('overlay');
const opacity = byId('opacity');
const zoom = byId('zoom');
const formatNumber = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });

let selectedName;

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function syncView() {
  opacity.disabled = !overlay.checked;
  gallery.style.setProperty('--opacity', overlay.checked ? opacity.value / 100 : 1);
  gallery.style.setProperty('--zoom', zoom.value + '%');
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
    const { mean, p95, elapsedMs } = result;
    figure.querySelector('.metrics').textContent = (
      `Ort. ${formatNumber.format(mean)} · P95 ${formatNumber.format(p95)} · ${formatNumber.format(elapsedMs)} ms`
    );
  }
  return figure;
}

async function run(selectImage) {
  if (analyze.disabled) return;
  for (const control of [open, sample, analyze, ...qualityInputs]) control.disabled = true;
  try {
    if (selectImage) {
      const name = await selectImage();
      if (!name) return;
      selectedName = name;
      filename.textContent = name;
    }
    if (!selectedName) {
      showStatus('Önce bir dosya veya örnek aç.');
      return;
    }

    const qualities = qualityInputs.map((input) => input.valueAsNumber);
    gallery.replaceChildren();
    if (!qualities.every((quality) => Number.isInteger(quality) && quality >= 1 && quality <= 100)) {
      showStatus('JPEG kalitelerini 1–100 arasında gir.', true);
      return;
    }
    showStatus('Analiz ediliyor…');
    const result = await window.imageSpatter.analyze(qualities);
    gallery.replaceChildren(
      panel('Giriş', result.preview),
      ...result.results.map((item) => panel(`JPEG kalite ${item.quality}`, result.preview, item)),
    );
    const conversion = result.format === 'JPEG' ? '' : ' · Girdinin JPEG’e dönüşüm farkı';
    showStatus(`${result.format} · ${result.width} × ${result.height} piksel${conversion}`);
  } catch (error) {
    gallery.replaceChildren();
    const message = error.message.replace(/^Error invoking remote method '[^']+': (Error: )?/, '');
    showStatus(message, true);
  } finally {
    for (const control of [open, sample, analyze, ...qualityInputs]) control.disabled = false;
  }
}

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
