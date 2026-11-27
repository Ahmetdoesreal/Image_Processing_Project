"""Read common image metadata and highlight camera and editing provenance clues."""

import re

from PIL import ExifTags

MAX_FIELDS = 256
MAX_VALUE_LENGTH = 256
LINKS = {int(tag) for tag in (ExifTags.IFD.Exif, ExifTags.IFD.GPSInfo, ExifTags.IFD.Interop)}
CAMERA_FIELDS = {
    "make", "model", "lensmake", "lensmodel", "bodyserialnumber", "lensserialnumber",
    "fnumber", "exposuretime", "isospeedratings", "photographicsensitivity", "focallength",
    "exposureprogram", "shutterspeedvalue", "aperturevalue", "flash", "meteringmode",
}
CAPTURE_TIMES = {"datetimeoriginal", "datetimedigitized", "datecreated", "createdate"}
FILE_TIMES = {"datetime", "modifydate", "metadatadate", "modificationtime"}
SOFTWARE_FIELDS = {"software", "processingsoftware", "creatortool", "softwareagent",
                   "application", "programname", "historysoftwareagent", "producer"}
EDITOR_SIGNATURES = (
    "photoshop", "lightroom", "adobe camera raw", "gimp", "affinity photo",
    "snapseed", "pixelmator", "capture one", "darktable", "rawtherapee",
    "paint.net", "paintshop pro", "photopea", "krita", "luminar", "imagemagick", "canva",
)
EDITOR_PATTERN = re.compile(r"\b(?:" + "|".join(map(re.escape, EDITOR_SIGNATURES)) + r")\b", re.IGNORECASE)
EDIT_ACTIONS = {"edited", "converted", "derived", "exported", "adjusted",
                "cropped", "resized", "rendered", "transformed", "filtered"}


def _field_name(key):
    return re.sub(r"[^a-z0-9]", "", key.lower())


def _flag(key, value, ancestry):
    name = _field_name(key)
    if name in SOFTWARE_FIELDS:
        if EDITOR_PATTERN.search(str(value)):
            return "Known editor"
        return "Software tag"
    if name in CAMERA_FIELDS:
        return "Camera information"
    if name in CAPTURE_TIMES:
        return "Capture / creation time"
    if name in FILE_TIMES:
        return "File / metadata time"
    if "derivedfrom" in ancestry or (name == "derivedfrom" and value):
        return "Derived asset"
    if "history" in ancestry and name == "action":
        action = str(value).lower().strip()
        if action in EDIT_ACTIONS:
            return "Edit history"
        if action == "saved":
            return "Save history"
    return None


def _display_value(key, value):
    if isinstance(value, bytes):
        if key.startswith("XP"):
            value = value[:512].decode("utf-16le", errors="replace")
        elif key == "UserComment" and value.startswith(b"ASCII\0\0\0"):
            value = value[8:264].decode("ascii", errors="replace")
        else:
            return f"Binary data ({len(value):,} bytes)"
    text = str(value).strip("\x00").strip()
    return text[:MAX_VALUE_LENGTH] + ("…" if len(text) > MAX_VALUE_LENGTH else "")


def read_metadata(image):
    """Read EXIF, GPS, PNG text, and supported XMP fields from an open Pillow image."""
    rows = []
    warnings = []

    def add(source, key, value, ancestry=()):
        if len(rows) < MAX_FIELDS:
            full_key = str(key)
            rows.append({
                "source": source,
                "name": full_key[:96],
                "value": _display_value(full_key, value),
                "flag": _flag(full_key, value, ancestry),
            })

    try:
        exif = image.getexif()
        for tag, value in exif.items():
            if tag not in LINKS:
                add("EXIF", ExifTags.TAGS.get(tag, f"Tag 0x{tag:04X}"), value)
        for ifd, table, source in (
            (ExifTags.IFD.Exif, ExifTags.TAGS, "EXIF"),
            (ExifTags.IFD.GPSInfo, ExifTags.GPSTAGS, "GPS"),
        ):
            for tag, value in exif.get_ifd(ifd).items():
                add(source, table.get(tag, f"Tag 0x{tag:04X}"), value)
    except (OSError, ValueError, TypeError, SyntaxError, KeyError, OverflowError):
        warnings.append("Some EXIF fields could not be read.")

    for key, value in getattr(image, "text", {}).items():
        if key.lower() not in {"xml:com.adobe.xmp", "raw profile type exif"}:
            add("PNG text", key, value)
    if "comment" in image.info and "comment" not in getattr(image, "text", {}):
        value = image.info["comment"]
        if isinstance(value, bytes):
            value = value[:MAX_VALUE_LENGTH].decode("utf-8", errors="replace")
        add("Image", "Comment", value)

    def xmp_rows(node, key="", depth=0, ancestry=()):
        if depth > 8 or len(rows) == MAX_FIELDS:
            return
        if isinstance(node, dict):
            for field, value in node.items():
                xmp_rows(value, field, depth + 1, (*ancestry, _field_name(key)))
        elif isinstance(node, list):
            for value in node[:MAX_FIELDS]:
                xmp_rows(value, key, depth + 1, ancestry)
        elif key not in {"about", "xmlns", "xmptk"}:
            add("XMP", key, node, ancestry)

    try:
        xmp_rows(image.getxmp())
    except (OSError, ValueError, TypeError, SyntaxError):
        warnings.append("Some XMP fields could not be read.")

    priority = {"Known editor": 0, "Edit history": 0, "Derived asset": 0, "Camera information": 1}
    rows.sort(key=lambda row: (priority.get(row["flag"], 2 if row["flag"] else 3), row["source"], row["name"]))
    if len(rows) == MAX_FIELDS:
        warnings.append(f"Only the first {MAX_FIELDS} metadata fields are displayed.")
    return {"fields": rows, "warnings": warnings}
