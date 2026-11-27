# Image Spatter versions

| Resource | Purpose |
|---|---|
| [Desktop 1.3](README.md#desktop-application) | English interface, copy-move candidates, local noise maps, metadata provenance clues, linked pan and zoom, and local PNG export |
| [Main notebook](Image_Spatter_Demo.ipynb) | Manual ELA calculation, shared Python engine, custom image, and İrem’s six samples |
| [V2 guided notebook](Image_Spatter_Demo_V2_Anlatimli.ipynb) | Step-by-step explanation with separate outputs under `outputs/v2_anlatimli/` |
| [V3 HTML explanation](Image_Spatter_V3_Sade_Anlatim.html) | Offline visual demo of JPEG quality, opacity, and the pixel difference calculation |
| [V1 academic project overview](Image_Spatter_V1_Proje_Anlatimi.ipynb) | Original scope, timeline, evaluation plan, and presentation script |
| [V1 academic report](academic/REPORT.md) and [slides](academic/presentation.html) | Desktop prototype demonstration and controlled ELA findings |
| [Compositor notebook](Image_Spatter_Compositor_Denemeleri.ipynb) | Full-size PNG renders and control-versus-render ELA comparisons |
| [İrem detailed reports](data/iremimg/outputs/index.html) | Whole/left/right views and eight qualities for each of six files |

## Compositor outputs

`outputs/compositor_tests/` contains the `duyuru` (2160 × 3840) and `karga` (4284 × 5712) renders. The notebook embeds overview figures and quality tables. The [CSV](outputs/compositor_tests/ela_measurements.csv) contains the full measurements.

Rendering uses the visible layers, their stored PNG content, Normal blending, and the transforms recorded in each manifest. It uses stored text bitmaps. Separate compositing and resampling can differ from the native application’s export. The masks come from the manifests, and the ELA analysis measures PNG-to-JPEG differences.

## İrem outputs

The [report index](data/iremimg/outputs/index.html) covers all 144 view/quality combinations. [Quality 20 files](data/iremimg/outputs/Q20/index.html) collect the six sources and the three older control/render pairs. The left/right labels indicate position only. Copy the entire output directory to keep the HTML, scripts, and associated images together.

## Standalone HTML demo

Open the V3 HTML file in a browser. Its controls switch between precomputed examples, adjust the map opacity, and show the recompressed JPEG associated with each quality. Open the V2 notebook or Electron app to analyze a new file.
