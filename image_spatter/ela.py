"""Shared image loading and JPEG Error Level Analysis (ELA)."""

import cv2
import numpy as np
from PIL import Image, ImageOps

MAX_PIXELS = 24_000_000


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


def ela_channel_sum(image, quality):
    # Three uint8 differences sum to at most 765, which fits in uint16.
    difference = cv2.absdiff(image, jpeg_roundtrip(image, quality))
    return difference.sum(axis=2, dtype=np.uint16)


def calculate_ela(image, quality):
    """Return the mean absolute difference across BGR channels for each pixel."""
    return ela_channel_sum(image, quality) / 3
