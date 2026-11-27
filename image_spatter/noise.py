"""Estimate local high-frequency residual strength for visual inspection."""

import cv2
import numpy as np

NOISE_DISPLAY_MAX = 20


def noise_map(image):
    """Return local residual RMS in 8-bit grayscale levels for a BGR image."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY).astype(np.float32)
    residual = cv2.GaussianBlur(gray, (0, 0), sigmaX=1.2)
    cv2.subtract(gray, residual, dst=residual)
    cv2.multiply(residual, residual, dst=residual)
    cv2.boxFilter(residual, -1, (15, 15), dst=residual)
    cv2.max(residual, 0, dst=residual)
    return cv2.sqrt(residual, dst=residual)
