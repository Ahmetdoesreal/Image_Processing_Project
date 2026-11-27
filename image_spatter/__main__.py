"""Emit Image Spatter comparison previews and measurements as JSON."""

import argparse
import base64
import json
import sys
from pathlib import Path
from time import perf_counter

import cv2
import numpy as np
from PIL import Image

from .duplicates import detect_duplicates
from .ela import decode_image, ela_channel_sum
from .metadata import read_metadata

PREVIEW_EDGE = 1200
DISPLAY_MAX = 20


def preview(image):
    height, width = image.shape[:2]
    scale = min(1, PREVIEW_EDGE / max(height, width))
    if scale < 1:
        size = (max(1, round(width * scale)), max(1, round(height * scale)))
        return cv2.resize(image, size, interpolation=cv2.INTER_AREA)
    return image


def png_data(image):
    success, encoded = cv2.imencode(".png", image, [cv2.IMWRITE_PNG_COMPRESSION, 1])
    if not success:
        raise OSError("Could not create the preview.")
    return "data:image/png;base64," + base64.b64encode(encoded).decode("ascii")


def analyze(path, qualities):
    with Image.open(path) as source:
        source_format = source.format
        image = decode_image(source)
        metadata = read_metadata(source)
    height, width = image.shape[:2]
    results = []
    for quality in qualities:
        start = perf_counter()
        difference = ela_channel_sum(image, quality)
        elapsed_ms = (perf_counter() - start) * 1000
        histogram = np.bincount(difference.ravel(), minlength=766)
        rank = int(np.ceil(0.95 * difference.size))
        p95 = np.searchsorted(np.cumsum(histogram), rank) / 3
        scaled = np.minimum(preview(difference), 3 * DISPLAY_MAX)
        intensity = np.round(scaled * (255 / (3 * DISPLAY_MAX))).astype(np.uint8)
        heatmap = cv2.applyColorMap(intensity, cv2.COLORMAP_INFERNO)
        results.append({
            "quality": quality,
            "mean": float(difference.mean() / 3),
            "p95": float(p95),
            "elapsedMs": elapsed_ms,
            "heatmap": png_data(heatmap),
        })

    return {
        "name": path.name,
        "format": source_format,
        "width": width,
        "height": height,
        "preview": png_data(preview(image)),
        "results": results,
        "duplicates": detect_duplicates(image),
        "metadata": metadata,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image", type=Path)
    parser.add_argument("qualities", type=int, nargs=2)
    args = parser.parse_args()
    try:
        print(json.dumps(analyze(args.image, args.qualities), allow_nan=False))
    except (OSError, ValueError, cv2.error, Image.DecompressionBombError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1) from error
