"""Find geometrically consistent repeated regions within one image."""

import cv2
import numpy as np

MAX_EDGE = 1400
MAX_FEATURES = 1800
MIN_MATCHES = 7
MAX_PAIRS = 4


def _region(points, width, height):
    x, y, w, h = cv2.boundingRect(points)
    left, top = max(0, x - 5), max(0, y - 5)
    right, bottom = min(width, x + w + 5), min(height, y + h + 5)
    return [left / width, top / height, (right - left) / width, (bottom - top) / height]


def _separate(first, second):
    x, y, w, h = first
    a, b, c, d = second
    overlap = max(0, min(x + w, a + c) - max(x, a)) * max(0, min(y + h, b + d) - max(y, b))
    return overlap < 0.2 * min(w * h, c * d)


def detect_duplicates(image):
    """Return candidate pairs with normalized bounding boxes and inlier counts."""
    height, width = image.shape[:2]
    scale = min(1, MAX_EDGE / max(height, width))
    if min(height, width) * scale < 32:
        return []
    if scale < 1:
        image = cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

    height, width = image.shape[:2]
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    keypoints, descriptors = cv2.SIFT_create(nfeatures=MAX_FEATURES).detectAndCompute(gray, None)
    if descriptors is None or len(descriptors) < 2 * MIN_MATCHES:
        return []

    points = np.array([point.pt for point in keypoints], dtype=np.float32)
    # Suppress self-matches and descriptors found at the same position and scale.
    squared_distances = ((points[:, None] - points[None, :]) ** 2).sum(axis=2)
    mask = np.asarray(squared_distances >= 28 ** 2, dtype=np.uint8)
    nearest = cv2.BFMatcher(cv2.NORM_L2).knnMatch(descriptors, descriptors, k=2, mask=mask)
    choices = {
        first.queryIdx: first.trainIdx
        for first, second in (pair for pair in nearest if len(pair) == 2)
        if first.distance < 0.8 * second.distance and first.distance < 240
    }

    matches = []
    for first, second in choices.items():
        if first >= second or choices.get(second) != first:
            continue
        delta = points[second] - points[first]
        if delta[np.argmax(np.abs(delta))] < 0:
            first, second = second, first
        matches.append((first, second))

    if len(matches) < MIN_MATCHES:
        return []

    indices = np.array(matches)
    source, target = points[indices[:, 0]], points[indices[:, 1]]
    pairs = []
    for _ in range(MAX_PAIRS * 2):
        if len(source) < MIN_MATCHES or len(pairs) == MAX_PAIRS:
            break
        _, inliers = cv2.estimateAffinePartial2D(
            source, target, method=cv2.RANSAC, ransacReprojThreshold=3.5, maxIters=1000,
        )
        if inliers is None or inliers.sum() < MIN_MATCHES:
            break
        keep = inliers.ravel().astype(bool)
        first, second = source[keep], target[keep]
        source, target = source[~keep], target[~keep]
        # Several descriptor orientations can belong to one keypoint location.
        occupied_first = np.unique(np.floor(first / 5), axis=0)
        occupied_second = np.unique(np.floor(second / 5), axis=0)
        if min(len(occupied_first), len(occupied_second)) < MIN_MATCHES:
            continue

        region_a, region_b = _region(first, width, height), _region(second, width, height)
        if _separate(region_a, region_b):
            pairs.append({"regions": [region_a, region_b], "matches": len(first)})
    return pairs
