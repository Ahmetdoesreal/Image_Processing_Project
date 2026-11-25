function resultMetrics(result) {
  const { mean, p95, elapsedMs } = result;
  return `Ort. ${formatNumber.format(mean)} · P95 ${formatNumber.format(p95)} · ${formatNumber.format(elapsedMs)} ms`;
}

async function decodePreview(src) {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

async function comparisonPng(result, opacity) {
  const [original, ...heatmaps] = await Promise.all(
    [result.preview, ...result.results.map((entry) => entry.heatmap)].map(decodePreview),
  );
  const panelWidth = 460;
  const padding = 24;
  const gutter = 14;
  const top = 116;
  const scale = Math.min(panelWidth / original.naturalWidth, 550 / original.naturalHeight);
  const width = Math.max(1, Math.round(original.naturalWidth * scale));
  const height = Math.max(1, Math.round(original.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = 3 * panelWidth + 2 * gutter + 2 * padding;
  canvas.height = top + height + 90;
  const context = canvas.getContext('2d');
  context.fillStyle = '#131820';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#eff2f7';
  context.font = 'bold 25px system-ui, sans-serif';
  context.fillText(result.name, padding, 40, canvas.width - 2 * padding);
  context.fillStyle = '#aab6c8';
  context.font = '16px system-ui, sans-serif';
  const view = opacity < 1 ? ` · Üst üste gösterim %${Math.round(opacity * 100)}` : '';
  context.fillText(`${result.format} · ${result.width} × ${result.height} piksel${view}`, padding, 66);

  for (const [index, image] of [original, ...heatmaps].entries()) {
    const resultEntry = result.results[index - 1];
    const left = padding + index * (panelWidth + gutter);
    const imageX = left + (panelWidth - width) / 2;
    context.fillStyle = '#1b222e';
    context.fillRect(left, top - 34, panelWidth, height + 67);
    context.fillStyle = '#eff2f7';
    context.font = 'bold 17px system-ui, sans-serif';
    context.fillText(resultEntry ? `JPEG kalite ${resultEntry.quality}` : 'Giriş', left + 10, top - 11);
    context.drawImage(original, imageX, top, width, height);
    if (resultEntry) {
      context.globalAlpha = opacity;
      context.drawImage(image, imageX, top, width, height);
      context.globalAlpha = 1;
      context.fillStyle = '#aab6c8';
      context.font = '15px system-ui, sans-serif';
      context.fillText(resultMetrics(resultEntry), left + 10, top + height + 21);
    }
  }

  context.fillStyle = '#aab6c8';
  context.font = '15px system-ui, sans-serif';
  context.fillText('Image Spatter · ELA renk ölçeği 0–20', padding, canvas.height - 24);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('PNG oluşturulamadı.');
  return blob.arrayBuffer();
}
