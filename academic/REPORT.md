# Image Spatter V1 technical report

COM0418 Image Processing

Image Spatter opens a local image, recompresses it at two JPEG qualities, and displays the resulting pixel differences. In the controlled experiment, quality 80 achieved the highest pixel ROC-AUC at all three patch positions.

## Application and method

The Electron interface opens a native file picker and includes bundled control and edited examples. The user selects two JPEG qualities and views two ELA maps alongside the input. Both maps use the same display scale. Linked zoom, pan, and adjustable opacity support inspection.

The Electron main process manages local file selection and launches a Python subprocess. The isolated preload exposes a small set of application calls. Python returns previews and measurements as JSON. Images are processed and viewed on the local machine. [Electron IPC documentation](https://www.electronjs.org/docs/latest/tutorial/ipc)

Pillow loads the image, applies EXIF orientation, and composites transparency over white. OpenCV encodes and decodes a JPEG copy in memory. The engine computes the mean absolute difference across the three color channels at each pixel. The maps use a 0–20 display scale. The statistics use full-resolution, unclipped differences. The app accepts images up to 24 megapixels and creates previews with a longest edge of up to 1,200 pixels. [OpenCV JPEG settings](https://docs.opencv.org/4.8.0/d8/d6a/group__imgcodecs__flags.html) · [Forensically’s ELA explanation](https://29a.ch/photo-forensics/#error-level-analysis)

## Controlled experiment

The 512 × 512 astronaut PNG was encoded as a quality-75 JPEG. The control kept the contents of that image and was saved at quality 95. For the three edited images, the same 80 × 80 patch from the PNG was pasted at `(390, 40)`, `(230, 165)`, and `(45, 245)`. Each edited image was also saved at quality 95.

For each pair, ELA ran at qualities 20, 80, and 95. We compared the mean ELA value inside the same patch region in both images. Pixel ROC-AUC tested whether a pixel inside the known patch ranked above a pixel outside it, with half credit for tied scores. Runtime is the median of seven runs after one warm-up. It covers JPEG encoding, decoding, and the difference calculation. Loading, plotting, and exporting are outside the timed step.

## Results

| Analysis quality | Mean pixel ROC-AUC across three positions | Mean difference in the edited region minus control |
|---:|---:|---:|
| 20 | 0.853 | 9.074–10.737 |
| 80 | 0.957 | 5.231–5.781 |
| 95 | 0.877 | 1.320–1.773 |

Quality 20 produced larger differences inside the patch and also raised differences in the background. Quality 80 separated the known region from its surroundings best in all three trials. At quality 95, the mean difference inside the edited region ranged from 1.605 to 2.046.

Median runtimes were about 40–70 ms in the VMware Ubuntu guest with four virtual CPUs, Python 3.11.18, and OpenCV 5.1.0. [Raw measurements](evaluation.csv)

## Interpretation

All three placements share a single source image and patch. The experiment measures the effect of the quality setting in this setup. General performance requires independent images, edit types, and compression histories. Pixel ROC-AUC describes rankings against the known mask. For non-JPEG inputs, ELA includes differences introduced by conversion to JPEG.

## Reproduction and demonstration

From the repository root, run:

```bash
python -m image_spatter.evaluate /tmp/image-spatter-evaluation.csv
```

Start the app using the [desktop instructions](../README.md#desktop-application). Select **Control** and **Controlled edit**, compare qualities 80 and 95, then change A to 20 to see how the background response changes. The current desktop release also marks the matching patch pair, maps local noise residuals, and displays metadata clues. The [Jupyter demo](../Image_Spatter_Demo.ipynb) includes a separate controlled noise example. The benchmark above measures ELA. [Class slides](presentation.html)

| Submission requirement | Evidence |
|---|---|
| Open a local image | Native Electron picker and bundled samples |
| Analyze in Python | Shared OpenCV ELA engine |
| Display and inspect results | Two maps with a shared scale, zoom, pan, and overlay |
| Evaluate a known edit | Three positions, three qualities, ROI means, pixel ROC-AUC, and median runtime |
| Demonstrate the workflow | Local app, result screenshot, and offline slides |
