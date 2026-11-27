import tempfile
import unittest
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, PngImagePlugin

from image_spatter.__main__ import analyze
from image_spatter.duplicates import detect_duplicates
from image_spatter.ela import read_image
from image_spatter.metadata import read_metadata
from image_spatter.noise import NOISE_DISPLAY_MAX, noise_map

ROOT = Path(__file__).resolve().parents[1]


class CopyMoveTests(unittest.TestCase):
    def test_controlled_copy_is_localized(self):
        original, _ = read_image(ROOT / "outputs/control.jpg")
        edited, _ = read_image(ROOT / "outputs/edited.jpg")
        self.assertEqual(detect_duplicates(original), [])
        pair, = detect_duplicates(edited)
        self.assertGreaterEqual(pair["matches"], 7)
        centers = {(round(x + w / 2, 1), round(y + h / 2, 1)) for x, y, w, h in pair["regions"]}
        self.assertEqual(centers, {(0.3, 0.7), (0.8, 0.2)})

    def test_rotated_paste_is_localized(self):
        source, _ = read_image(ROOT / "data/astronaut.png")
        patch = source[40:190, 140:290]
        matrix = cv2.getRotationMatrix2D((75, 75), 15, 0.92)
        moved = cv2.warpAffine(patch, matrix, (150, 150), borderMode=cv2.BORDER_REFLECT)
        image = np.full((400, 580, 3), 128, dtype=np.uint8)
        image[40:190, 50:200] = patch
        image[210:360, 340:490] = moved
        strongest = max(detect_duplicates(image), key=lambda candidate: candidate["matches"])
        centers = sorted((x + w / 2, y + h / 2) for x, y, w, h in strongest["regions"])
        np.testing.assert_allclose(centers, [(125 / 580, 115 / 400), (415 / 580, 285 / 400)], atol=0.06)

    def test_flat_or_very_small_image_has_no_matches(self):
        for shape in ((28, 120, 3), (140, 140, 3)):
            self.assertEqual(detect_duplicates(np.zeros(shape, dtype=np.uint8)), [])


class NoiseTests(unittest.TestCase):
    def test_noisy_patch_exceeds_the_smooth_background(self):
        clean = np.full((192, 288, 3), 128, dtype=np.uint8)
        self.assertLess(noise_map(clean).max(), 1e-4)
        noisy = clean.copy()
        rng = np.random.default_rng(42)
        patch = np.clip(np.rint(128 + rng.normal(0, 12, (96, 104))), 0, 255).astype(np.uint8)
        noisy[48:144, 92:196] = patch[..., None]
        values = noise_map(noisy)
        self.assertEqual(values.shape, clean.shape[:2])
        self.assertTrue(np.isfinite(values).all())
        self.assertGreater(np.median(values[60:130, 105:185]), 8)
        self.assertLess(np.median(values[60:130, 15:75]), 1e-4)


class MetadataTests(unittest.TestCase):
    def test_camera_and_editor_clues_can_both_be_present(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "fixture.jpg"
            exif = Image.Exif()
            exif[271] = "Example Camera Co."
            exif[272] = "Example DSLR"
            exif[305] = "Adobe Photoshop 27"
            exif[36867] = "2026:11:27 10:00:00"
            Image.new("RGB", (50, 50)).save(path, exif=exif)
            response = analyze(path, (80, 95))
            fields = {field["name"]: field for field in response["metadata"]["fields"]}
            self.assertEqual(fields["Make"]["flag"], "Camera information")
            self.assertEqual(fields["Model"]["flag"], "Camera information")
            self.assertEqual(fields["Software"]["flag"], "Known editor")
            self.assertEqual(fields["DateTimeOriginal"]["flag"], "Capture / creation time")
            self.assertEqual(len(response["results"]), 2)
            self.assertEqual(response["duplicates"], [])
            self.assertEqual(response["noise"]["displayMax"], NOISE_DISPLAY_MAX)
            self.assertLess(response["noise"]["p95"], 1e-4)
            self.assertTrue(response["noise"]["heatmap"].startswith("data:image/png;base64,"))

    def test_ordinary_software_and_missing_fields(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "fixture.png"
            image = Image.new("RGB", (50, 50))
            image.save(path)
            with Image.open(path) as source:
                self.assertEqual(read_metadata(source)["fields"], [])

            text = PngImagePlugin.PngInfo()
            text.add_text("Software", "Scanva camera firmware")
            text.add_text("Description", "Photoshop appears only in this caption.")
            image.save(path, pnginfo=text)
            with Image.open(path) as source:
                source.load()
                rows = {field["name"]: field["flag"] for field in read_metadata(source)["fields"]}
                self.assertEqual(rows, {"Software": "Software tag", "Description": None})

    def test_xmp_distinguishes_an_edit_from_a_save_event(self):
        packet = """<x:xmpmeta xmlns:x="adobe:ns:meta/">
          <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/"
              xmlns:stEvt="http://ns.adobe.com/xap/1.0/sType/ResourceEvent#">
              <xmpMM:History><rdf:Seq>
                <rdf:li rdf:parseType="Resource"><stEvt:action>saved</stEvt:action>
                  <stEvt:softwareAgent>GIMP 3</stEvt:softwareAgent></rdf:li>
                <rdf:li rdf:parseType="Resource"><stEvt:action>cropped</stEvt:action></rdf:li>
              </rdf:Seq></xmpMM:History>
            </rdf:Description>
          </rdf:RDF>
        </x:xmpmeta>"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "history.png"
            pnginfo = PngImagePlugin.PngInfo()
            pnginfo.add_itxt("XML:com.adobe.xmp", packet)
            Image.new("RGB", (50, 50)).save(path, pnginfo=pnginfo)
            with Image.open(path) as image:
                image.load()
                flags = {row["value"]: row["flag"] for row in read_metadata(image)["fields"]}
            self.assertEqual(flags["GIMP 3"], "Known editor")
            self.assertEqual(flags["saved"], "Save history")
            self.assertEqual(flags["cropped"], "Edit history")
