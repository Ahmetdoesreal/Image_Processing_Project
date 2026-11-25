"""Local image loading and Error Level Analysis for Image Spatter."""

import argparse
import base64
import json
import sys
from pathlib import Path
from time import perf_counter

import cv2
import numpy as np
from PIL import Image, ImageOps

MAX_PIXELS = 24_000_000
PREVIEW_EDGE = 1200
DISPLAY_MAX = 20


def read_image(path):
    with Image.open(path) as source:
        if source.width * source.height > MAX_PIXELS:
            raise ValueError("En fazla 24 megapiksel büyüklüğünde bir görüntü seç.")
        source_format = source.format
        image = ImageOps.exif_transpose(source)
        if "A" in image.getbands() or "transparency" in image.info:
            rgba = image.convert("RGBA")
            image = Image.alpha_composite(Image.new("RGBA", rgba.size, "white"), rgba)
        rgb = np.asarray(image.convert("RGB"))
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), source_format


def jpeg_roundtrip(image, quality):
    if type(quality) is not int or not 1 <= quality <= 100:
        raise ValueError("JPEG kalitesi 1 ile 100 arasında bir tam sayı olmalı.")
    success, encoded = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, quality])
    if not success:
        raise OSError("JPEG kodlanamadı.")
    decoded = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    if decoded is None:
        raise OSError("Yeniden sıkıştırılan JPEG okunamadı.")
    return decoded


def calculate_ela(image, quality):
    # Three uint8 differences sum to at most 765, which fits in uint16.
    difference = cv2.absdiff(image, jpeg_roundtrip(image, quality))
    return difference.sum(axis=2, dtype=np.uint16)


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
        raise OSError("Önizleme oluşturulamadı.")
    return "data:image/png;base64," + base64.b64encode(encoded).decode("ascii")


def analyze(path, qualities):
    image, source_format = read_image(path)
    height, width = image.shape[:2]
    results = []
    for quality in qualities:
        start = perf_counter()
        difference = calculate_ela(image, quality)
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
