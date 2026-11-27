# Main candidate changes

This branch contains a [Jupyter demo](Image_Spatter_Demo.ipynb) and an [interactive desktop app](README.md#desktop-application) powered by one local Python engine.

| Stage | Additions |
|---|---|
| Notebook integration · `a2d956d` | Added İrem’s six examples using the existing image assets and made the default sample portable. |
| Academic prototype · `372bfa6` | Added local image selection, two-quality ELA comparison, nine controlled measurements, a technical report, and six offline slides. |
| Desktop 1.1 · `e7f8868` | Added synchronized zoom and pan, keyboard inspection, and local PNG comparison export. |
| Shared engine · `d3d9e82` | Moved ELA computation into `image_spatter/ela.py`. The notebooks verify their manual calculation against it, and Electron calls it through a local subprocess. |
| GIF walkthrough · `d69666e` | Recorded the desktop workflow and linked it from the README. |
| Desktop 1.2 | Localized the current interface and teaching text to English, added copy-move candidates and metadata provenance highlights, and added focused tests. |
| Desktop 1.3 | Added a local noise-residual map and notebook experiment, clarified the Copy-move detection panel, and tested a rotated pasted patch. |

## Snapshot from the shared-engine milestone

These Git diff counts describe the shared-engine milestone (`d3d9e82`) and exclude this log.

| Comparison base | Files | Lines added | Lines removed |
|---|---:|---:|---:|
| Original `main` · `2d847f0` | 25 | 1,485 | 242 |
| Integrated notebook milestone · `a2d956d` | 24 | 1,394 | 152 |
| Desktop 1.1 · `e7f8868` | 10 | 109 | 193 |

The original comparison included notebook JSON, documentation, and the package lockfile. Desktop and Python source accounted for 781 lines across 11 files at that milestone.
