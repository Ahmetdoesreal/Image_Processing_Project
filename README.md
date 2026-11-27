# Image Spatter

Image Spatter is a local image-inspection project. It compares JPEG recompression differences, highlights possible repeated regions, maps local noise variation, and shows metadata clues about capture and editing.

- **Jupyter demo** · [Run the notebook](Image_Spatter_Demo.ipynb) to follow the ELA calculation and try the shared Python engine.
- **Interactive desktop app** · Open images, compare two JPEG qualities, inspect copy-move candidates, noise patterns, and metadata, and save a PNG comparison.

**[Watch the Desktop 1.3 GIF walkthrough](ELECTRON_DEMO.md)** · [Candidate changes](CANDIDATE_CHANGES.md)

## Desktop application

From the repository root, use Node.js 22.12 or later and Python 3.10 or later. With the course environment:

```bash
conda activate imagepr_env
python -m pip install -r requirements.txt
npm --prefix desktop ci
npm --prefix desktop start
```

The setup downloads dependencies. Image analysis runs locally and works offline once installed. To select a different Python interpreter, set `IMAGE_SPATTER_PYTHON` to its executable path.

On the Ubuntu VM with system Node.js 16, run with Node.js 22 without replacing the system version:

```bash
npx --yes --package=node@22 -c 'npm --prefix desktop ci'
IMAGE_SPATTER_PYTHON="$HOME/anaconda3/envs/imagepr_env/bin/python" \
  npx --yes --package=node@22 -c 'npm --prefix desktop start'
```

### Analyze an image

1. Choose **Open image** or use the bundled **Control** and **Controlled edit** samples.
2. Set **JPEG A** and **JPEG B**, then select **Compare** to recompute the ELA maps. Drag any zoomed panel or use the arrow keys to pan all three. **Show overlay** and **Opacity** blend the heatmap with the input.
3. Check **Copy-move detection** for matching patches within the image. Numbered A/B boxes mark each candidate pair on the input. Turn off **Show matches on input** to inspect the image without boxes.
4. Open **Noise analysis** to compare the input with a fixed-scale map of local residual strength. The median and 95th percentile summarize the full-resolution map.
5. Open **Metadata** to review the original file’s readable EXIF, GPS, PNG text, and XMP fields. **Highlighted fields only** filters to provenance clues.
6. Use **Save PNG** to export the full input and both ELA views with JPEG settings, measurements, and overlay opacity. The comparison export contains only the ELA comparison.

| Metadata highlight | How to read it |
|---|---|
| Camera information | Make, model, lens, and exposure fields describe a reported capture device. An exported or edited file can retain them. |
| Known editor | A software or creator-tool tag contains a recognized editor or processing tool, such as Photoshop, Lightroom, GIMP, or ImageMagick. It may identify an export as well as an edit. |
| Edit history or derived asset | The XMP record describes a processing step or references a source asset. |
| Software tag, save history, or timestamp | Use the reported tool, save events, and times as context when comparing versions of a file. |

The editor signatures are defined in [the metadata module](image_spatter/metadata.py). Metadata can be modified or removed. Missing camera information and absent edit markers leave provenance uncertain. [Pillow metadata API](https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.Image.getexif)

Duplicate detection matches local SIFT features within one image and uses geometric agreement to group likely pairs. The desktop app processes the image locally and reports up to four candidates. Smooth, small, or heavily transformed copies can be missed, and genuine repeated patterns can produce matches. The boxes show feature-supported regions rather than exact masks. [OpenCV feature matching](https://docs.opencv.org/4.x/d5/d6f/tutorial_feature_flann_matcher.html)

Noise analysis subtracts a Gaussian-blurred grayscale image (σ = 1.2) and measures local residual RMS in a 15 × 15 window. The heatmap uses a fixed 0–20 grayscale-level display range, so different regions and images can be compared on the same scale. Highlighted areas can contain noise, texture, sharp edges, or compression artifacts. [OpenCV image filters](https://docs.opencv.org/3.4.9/d4/d86/group__imgproc__filter.html)

## Notebook demo

From the repository root:

```bash
python -m pip install -r requirements.txt
python -m jupyterlab Image_Spatter_Demo.ipynb
```

Select **Run All**. The controlled experiment adds a known patch to the bundled astronaut image. Both control and edited examples receive the same final JPEG encoding. The notebook demonstrates JPEG recompression and channel differences by hand and compares its calculation with the shared [Python engine](image_spatter/ela.py).

The **Custom image** section runs independently. Set `custom_image_path` to a local image or `None` to skip. Quality, display scale, opacity, and an optional `(x, y, width, height)` region can be adjusted. Custom exports in `outputs/custom/` contain the comparison, raw ELA array, quality metrics, and an optional region summary. Change `custom_save_outputs` to disable writes.

The notebook’s **Compare İrem’s examples** section runs the six bundled JPEG, WebP, and AVIF examples at quality 80 using a shared color scale. Adjust `example_filenames` to select a subset. It saves plots to `outputs/irem_examples/`. The [full report](data/iremimg/outputs/index.html) includes additional JPEG qualities and left/right views.

Sections 10 and 11 use the same copy-move, metadata, and noise routines as Electron. Section 10 marks potential copies on the bundled edited JPEG. Section 11 compares a synthetic noisy patch with its flat background using the same noise scale as the desktop app.

ELA visualizes mean absolute differences across three color channels after recompression. For non-JPEG inputs it displays differences introduced by conversion to JPEG. Ordinary texture and sharp edges can produce large values. The known mask in the controlled demo marks the patch placement from the experiment. [Forensically’s ELA explanation](https://29a.ch/photo-forensics/#error-level-analysis)

## Reports and teaching materials

| Resource | Contents |
|---|---|
| [Technical report](academic/REPORT.md) and [evaluation data](academic/evaluation.csv) | Controlled academic ELA experiment and measured quality comparison |
| [Class presentation](academic/presentation.html) | Offline slides with keyboard navigation |
| [V2 guided notebook](Image_Spatter_Demo_V2_Anlatimli.ipynb) | Narrated version of the notebook experiment with its own output directory |
| [V3 HTML demo](Image_Spatter_V3_Sade_Anlatim.html) | Standalone visual explanation with quality and opacity controls |
| [V1 project overview](Image_Spatter_V1_Proje_Anlatimi.ipynb) | Original scope, architecture, schedule, and presentation notes |
| [Compositor experiments](Image_Spatter_Compositor_Denemeleri.ipynb) | Layer renders and full-resolution ELA comparisons |
| [İrem image report](data/iremimg/outputs/index.html) | Six images, three views each, and eight JPEG settings |
| [Version guide](VERSIONS.md) | Entry points and output locations |

Run the focused engine tests with `python -m unittest discover -s tests`.
