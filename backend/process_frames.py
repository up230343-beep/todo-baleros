"""
process_frames.py v2
- Extrae frames del grid con detección robusta
- Elimina fondo blanco → guarda PNG con canal alpha transparente
- Recorta 6px de cada borde para eliminar artefactos de separador
- Genera bearingFramesConfig.json para el frontend
"""
import cv2
import numpy as np
from pathlib import Path
from PIL import Image
import json
import warnings
warnings.filterwarnings("ignore")

FILE_MAP = {
    "Gemini_Generated_Image_eyfvu7eyfvu7eyfv.png": "deep-groove",
    "Gemini_Generated_Image_rf69w5rf69w5rf69.png": "centering",
    "Gemini_Generated_Image_e6iqf7e6iqf7e6iq.png": "self-aligning",
    "Gemini_Generated_Image_y38w5hy38w5hy38w.png": "cylindrical-roller",
    "Gemini_Generated_Image_b7lp81b7lp81b7lp.png": "spherical-roller",
    "Gemini_Generated_Image_slnn29slnn29slnn.png": "angular-contact",
    "Gemini_Generated_Image_6dewva6dewva6dew.png": "four-point",
    "Gemini_Generated_Image_gd72krgd72krgd72.png": "tapered-roller",
    "Gemini_Generated_Image_9lkhgv9lkhgv9lkh.png": "thrust-roller",
    "Gemini_Generated_Image_8y1vq48y1vq48y1v.png": "wheel-bearing",
    "Gemini_Generated_Image_l1g07dl1g07dl1g0.png": "micro-thrust",
    "Gemini_Generated_Image_3r05bv3r05bv3r05.png": "outer-spherical",
}

INPUT_DIR  = Path(r"C:\Proyectos\JOE\backend\docs\bearing-frames-input")
OUTPUT_DIR = Path(r"C:\Proyectos\JOE\bearings-polished-main\public\bearings-frames")
SIZE       = 512
TRIM       = 8      # px a cortar de cada borde (elimina artefactos de separador)
BG_TOL     = 22     # tolerancia para detección de fondo blanco


# ── 1. Detección de grid ─────────────────────────────────────────
def find_segments(profile, threshold=240, min_len=60):
    """Devuelve rangos (start, end) de bandas de contenido (no-blancas)."""
    bright = profile > threshold
    segs, in_c, s = [], False, 0
    for i, b in enumerate(bright):
        if not b and not in_c:
            in_c, s = True, i
        elif b and in_c:
            in_c = False
            if i - s >= min_len:
                segs.append((s, i))
    if in_c and len(profile) - s >= min_len:
        segs.append((s, len(profile)))
    return segs


def crop_frames(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    row_s = find_segments(gray.mean(axis=1))
    col_s = find_segments(gray.mean(axis=0))
    frames = []
    for y1, y2 in row_s:
        for x1, x2 in col_s:
            crop = img[y1:y2, x1:x2]
            if crop.mean() > 251 or crop.shape[0] < 60 or crop.shape[1] < 60:
                continue
            frames.append(crop)
    return frames


# ── 2. Recorte de bordes (artefactos de líneas de separador) ─────
def trim_borders(img, px=TRIM):
    h, w = img.shape[:2]
    return img[px:h-px, px:w-px]


# ── 3. Eliminación de fondo blanco → PNG con alpha ───────────────
def remove_white_bg(img_bgr, tol=BG_TOL):
    """
    BFS desde los píxeles del borde que sean "casi blancos".
    Marca como transparente todo lo que esté conectado al fondo.
    Aplica suavizado alpha para bordes anti-aliased.
    """
    from scipy.ndimage import label as sci_label

    h, w = img_bgr.shape[:2]
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    gray    = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # Máscara de píxeles "blancos"
    white = gray >= (255 - tol)

    # Etiquetar regiones conectadas de píxeles blancos (8-conectividad)
    struct  = np.ones((3, 3), dtype=int)
    labeled, _ = sci_label(white, structure=struct)

    # Etiquetas que tocan el borde → son el fondo
    border_labels = set()
    for arr in [labeled[0, :], labeled[-1, :], labeled[:, 0], labeled[:, -1]]:
        border_labels.update(arr.tolist())
    border_labels.discard(0)

    bg_mask = np.isin(labeled, list(border_labels))

    # Construir RGBA
    rgba        = np.dstack([img_rgb, np.full((h, w), 255, np.uint8)])
    rgba[:, :, 3][bg_mask] = 0

    # Suavizar bordes alpha (anti-alias)
    alpha = rgba[:, :, 3].astype(np.float32)
    alpha = cv2.GaussianBlur(alpha, (5, 5), 1.2)
    rgba[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)

    return Image.fromarray(rgba, "RGBA")


# ── 4. Pipeline principal ─────────────────────────────────────────
config = {}

for filename, category in FILE_MAP.items():
    img_path = INPUT_DIR / filename
    if not img_path.exists():
        print(f"SKIP (no encontrado): {filename}")
        continue

    print(f"\n[{category}]")
    img    = cv2.imread(str(img_path))
    frames = crop_frames(img)
    print(f"  {len(frames)} frames detectados")

    out_dir = OUTPUT_DIR / category
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("frame-*.png"):
        old.unlink()

    saved_paths = []
    for i, frame in enumerate(frames, 1):
        # a) Recortar bordes sucios
        frame = trim_borders(frame)

        # b) Padding cuadrado
        h, w  = frame.shape[:2]
        side  = max(h, w)
        pad   = np.full((side, side, 3), 255, np.uint8)
        yo    = (side - h) // 2
        xo    = (side - w) // 2
        pad[yo:yo+h, xo:xo+w] = frame

        # c) Resize
        resized = cv2.resize(pad, (SIZE, SIZE), interpolation=cv2.INTER_LANCZOS4)

        # d) Quitar fondo blanco
        pil_rgba = remove_white_bg(resized)

        # e) Guardar como PNG con alpha
        out_path = out_dir / f"frame-{i}.png"
        pil_rgba.save(str(out_path), "PNG")
        saved_paths.append(f"/bearings-frames/{category}/frame-{i}.png")
        print(f"  frame-{i}.png OK")

    config[category] = {"frameCount": len(frames), "frames": saved_paths}

# ── Guardar JSON ─────────────────────────────────────────────────
json_path = Path(r"C:\Proyectos\JOE\bearings-polished-main\src\data\bearingFramesConfig.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(config, f, indent=2, ensure_ascii=False)

total = sum(v["frameCount"] for v in config.values())
print(f"\nDone — {len(config)} categorias, {total} frames")
print(f"Config: {json_path}")
