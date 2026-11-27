
(() => {
  "use strict";
  const data = JSON.parse(document.getElementById("viewer-data").textContent);
  const get = id => document.getElementById(id);
  const format = value => value.toLocaleString("en-US", {maximumFractionDigits:3, minimumFractionDigits:3});
  function update() {
    const view = data.views[get("view").value];
    const quality = get("quality").value;
    const result = view.qualities[quality];
    get("input-image").src = view.source;
    get("jpeg-image").src = result.jpeg;
    get("ela-image").src = result.ela;
    get("overlay-image").src = result.overlay;
    get("jpeg-caption").textContent = "JPEG copy · quality " + quality;
    get("ela-caption").textContent = "ELA · quality " + quality;
    get("overlay-caption").textContent = "Overlay · quality " + quality;
    get("selected-size").textContent = view.width + " × " + view.height + " pixels";
    get("mean").textContent = format(result.stats.mean_error);
    get("p95").textContent = format(result.stats.p95_error);
    get("clipped").textContent = format(result.stats.display_clipped_percent) + "%";
    get("jpeg-size").textContent = (result.stats.jpeg_bytes / 1024).toLocaleString("en-US", {maximumFractionDigits:1}) + " KB";
    get("time-note").textContent = "Analysis time: " + format(result.stats.analysis_ms) + " ms. Excludes loading, summaries, plotting, and saving.";
    for (const kind of ["jpeg", "ela", "overlay"]) {
      get("download-" + kind).href = result[kind];
      get("open-" + kind).href = result[kind];
    }
    get("open-input").href = view.source;
    get("csv-link").href = view.metrics_csv;
    get("jpeg-grid").src = view.jpeg_comparison;
    get("ela-grid").src = view.ela_comparison;
    get("overlay-grid").src = view.overlay_comparison;
    get("histogram").src = view.histogram;
    get("edges").src = view.edges;
    get("rgb-difference").src = view.rgb_difference_q20;
  }
  get("view").addEventListener("change", update);
  get("quality").addEventListener("change", update);
  update();
})();
