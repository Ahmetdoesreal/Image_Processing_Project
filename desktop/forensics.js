const evidence = document.getElementById('evidence');
const duplicateStatus = document.getElementById('duplicate-status');
const duplicateToggle = document.getElementById('show-duplicates');
const noiseStatus = document.getElementById('noise-status');
const noiseInput = document.getElementById('noise-input');
const noiseHeatmap = document.getElementById('noise-map');
const noiseDisplayMax = document.getElementById('noise-display-max');
const metadataStatus = document.getElementById('metadata-status');
const metadataNote = document.getElementById('metadata-note');
const metadataFilter = document.getElementById('metadata-filter');
const metadataTable = document.getElementById('metadata-table');
const metadataRows = document.getElementById('metadata-rows');
const metadataEmpty = document.getElementById('metadata-empty');
const metadataGuidance = metadataNote.textContent;
const editFlags = new Set(['Known editor', 'Edit history', 'Derived asset']);
let metadataFields = [];

function clearFindings() {
  evidence.hidden = true;
  noiseInput.removeAttribute('src');
  noiseHeatmap.removeAttribute('src');
  metadataFields = [];
  metadataRows.replaceChildren();
}

function showMetadataFields() {
  const fields = metadataFilter.checked ? metadataFields.filter((field) => field.flag) : metadataFields;
  const rows = fields.map(({ source, name, value, flag }) => {
    const row = document.createElement('tr');
    if (flag) row.className = editFlags.has(flag) ? 'editor-tag' : 'context-tag';
    for (const text of [source, name, value, flag || '—']) {
      const cell = document.createElement('td');
      cell.textContent = text;
      row.append(cell);
    }
    return row;
  });
  metadataRows.replaceChildren(...rows);
  metadataTable.hidden = rows.length === 0;
  metadataEmpty.hidden = rows.length !== 0;
  metadataEmpty.textContent = metadataFields.length ? 'No highlighted fields.' : 'No readable embedded metadata found.';
}

function addRegionMarkers(image, pairs) {
  for (const [index, pair] of pairs.entries()) {
    for (const [side, [x, y, width, height]] of pair.regions.entries()) {
      const box = document.createElement('span');
      box.className = `region-mark pair-${index}`;
      box.setAttribute('aria-hidden', 'true');
      box.style.left = `${x * 100}%`;
      box.style.top = `${y * 100}%`;
      box.style.width = `${width * 100}%`;
      box.style.height = `${height * 100}%`;
      const label = document.createElement('span');
      label.textContent = `${index + 1}${side === 0 ? 'A' : 'B'}`;
      box.append(label);
      image.append(box);
    }
  }
}

function renderFindings({ duplicates, metadata, noise, preview }, image) {
  addRegionMarkers(image, duplicates);
  duplicateToggle.disabled = duplicates.length === 0;
  duplicateStatus.textContent = duplicates.length
    ? `${duplicates.length} candidate ${duplicates.length === 1 ? 'pair' : 'pairs'} · ${duplicates.map((pair) => pair.matches).join(', ')} matching features per pair. Repeated textures can also match.`
    : 'No matching regions detected.';
  noiseInput.src = preview;
  noiseHeatmap.src = noise.heatmap;
  noiseStatus.textContent = `· Median ${formatNumber.format(noise.median)} · P95 ${formatNumber.format(noise.p95)}`;
  noiseDisplayMax.textContent = `${noise.displayMax}+ grayscale levels (RMS)`;
  metadataFields = metadata.fields;
  const cameraCount = metadataFields.filter((field) => field.flag === 'Camera information').length;
  const editCount = metadataFields.filter((field) => editFlags.has(field.flag)).length;
  metadataStatus.textContent = `· ${cameraCount} camera, ${editCount} editing · ${metadataFields.length} total`;
  metadataNote.textContent = [metadataGuidance, ...metadata.warnings].join(' ');
  showMetadataFields();
  evidence.hidden = false;
}

duplicateToggle.addEventListener('change', () => {
  document.getElementById('gallery').classList.toggle('hide-duplicates', !duplicateToggle.checked);
});
metadataFilter.addEventListener('change', showMetadataFields);
