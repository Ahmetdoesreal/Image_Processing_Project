# Detailed analysis of İrem’s sample images

Start with the [HTML report](index.html). It covers six inputs, three views per input, and eight JPEG qualities. The [quality-20 downloads](Q20/index.html) collect copies, maps, overlays, and earlier reference pairs. The [notebook report](Analiz_Raporu.ipynb) embeds the quality-20 overviews.

Each whole, left, and right view starts from its own input pixels and is recompressed independently. Panel names describe position in the source collage. ELA uses the mean absolute difference across the three color channels. All maps use a common 0–20 display range. The analysis uses the original dimensions.

## Output files

- `images/<sample>/report.html` provides interactive view and quality controls.
- Each view contains its source image, JPEG copies, ELA maps, overlays, comparison figures, histogram, edge map, and measurements.
- `difference_rgb_q20_gain10.png` shows RGB differences with a display gain of 10.
- [All measurements](all_measurements.csv), [the analysis manifest](analysis_manifest.json), and [the file inventory](output_inventory.csv) document the runs.
- [Earlier Q20 reference pairs](reference_pairs_q20/metrics_q20.csv) include `duyuru`, `karga`, and `error`.

JPEG encoding, decoding, and difference calculation are timed. Loading, summary statistics, drawing, and writes are outside that measurement. Keep the report’s directory structure intact when moving it for offline use.
