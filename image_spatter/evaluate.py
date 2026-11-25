"""Generate the controlled V1 evaluation CSV using the shared ELA engine."""

import argparse
import csv
from pathlib import Path
from statistics import median
from time import perf_counter

import numpy as np

from .ela import ela_channel_sum, jpeg_roundtrip, read_image

QUALITIES = (20, 80, 95)
REPEATS = 7
POSITIONS = ((390, 40), (230, 165), (45, 245))


def timed_ela(image, quality):
    ela_channel_sum(image, quality)
    times = []
    for _ in range(REPEATS):
        start = perf_counter()
        result = ela_channel_sum(image, quality)
        times.append((perf_counter() - start) * 1000)
    return result, median(times)


def auc_inside_mask(scores, mask):
    inside = np.bincount(scores[mask], minlength=766)
    outside = np.bincount(scores[~mask], minlength=766)
    # Count lower-scoring outside pixels and award half credit for ties.
    pairs = inside @ (np.cumsum(outside) - 0.5 * outside)
    return pairs / (inside.sum() * outside.sum())


def evaluate(source):
    base = jpeg_roundtrip(source, 75)
    control = jpeg_roundtrip(base, 95)
    patch = source[340:420, 130:210]
    for x, y in POSITIONS:
        edited = base.copy()
        edited[y:y+80, x:x+80] = patch
        edited = jpeg_roundtrip(edited, 95)
        mask = np.zeros(source.shape[:2], dtype=bool)
        mask[y:y+80, x:x+80] = True
        for quality in QUALITIES:
            control_ela, control_ms = timed_ela(control, quality)
            edited_ela, edited_ms = timed_ela(edited, quality)
            control_mean = control_ela[mask].mean() / 3
            edited_mean = edited_ela[mask].mean() / 3
            yield {
                "patch_x": x,
                "patch_y": y,
                "quality": quality,
                "control_roi_mean": f"{control_mean:.4f}",
                "edited_roi_mean": f"{edited_mean:.4f}",
                "roi_mean_gap": f"{edited_mean - control_mean:.4f}",
                "edited_roi_auc": f"{auc_inside_mask(edited_ela, mask):.4f}",
                "control_median_ms": f"{control_ms:.4f}",
                "edited_median_ms": f"{edited_ms:.4f}",
            }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="CSV output path")
    args = parser.parse_args()
    source, _ = read_image(Path(__file__).resolve().parent.parent / "data" / "astronaut.png")
    rows = list(evaluate(source))
    with args.output.open("w", encoding="utf-8", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys(), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
