"""Shared image loading and JPEG Error Level Analysis (ELA)."""

import cv2
import numpy as np
from PIL import Image, ImageOps

MAX_PIXELS = 24_000_000


def decode_image(source):
    """Decode an open Pillow image as oriented, 8-bit BGR."""
    if source.width * source.height > MAX_PIXELS:
        raise ValueError("Choose an image no larger than 24 megapixels.")
    image = ImageOps.exif_transpose(source)
    if "A" in image.getbands() or "transparency" in image.info:
        rgba = image.convert("RGBA")
        image = Image.alpha_composite(Image.new("RGBA", rgba.size, "white"), rgba)
    return cv2.cvtColor(np.asarray(image.convert("RGB")), cv2.COLOR_RGB2BGR)


def read_image(path):
    with Image.open(path) as source:
        return decode_image(source), source.format


def jpeg_roundtrip(image, quality):
    if type(quality) is not int or not 1 <= quality <= 100:
        raise ValueError("JPEG quality must be an integer between 1 and 100.")
    success, encoded = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, quality])
    if not success:
        raise OSError("Could not encode the JPEG.")
    decoded = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    if decoded is None:
        raise OSError("Could not decode the recompressed JPEG.")
    return decoded


def ela_channel_sum(image, quality):
    # Three uint8 differences sum to at most 765, which fits in uint16.
    difference = cv2.absdiff(image, jpeg_roundtrip(image, quality))
    return difference.sum(axis=2, dtype=np.uint16)


def calculate_ela(image, quality):
    """Return the mean absolute difference across BGR channels for each pixel."""
    return ela_channel_sum(image, quality) / 3
