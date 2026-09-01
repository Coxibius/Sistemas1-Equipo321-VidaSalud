from __future__ import annotations

import re
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
ANALYSIS_DIR = ROOT.parent.parent / "analysis"

NAVY = "#0F1B33"
BLUE = "#0D91CF"
LIGHT_BLUE = "#E8F5FC"
PALE = "#F6F9FC"
TEXT = "#17233B"
MUTED = "#52637A"
LINE = "#9AB0C7"
WHITE = "#FFFFFF"
ORANGE = "#F59E0B"
RED = "#D64545"


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def wrapped_lines(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width or not current:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_centered_text(draw, box, text, font, fill=TEXT, spacing=7):
    x1, y1, x2, y2 = box
    lines = []
    for paragraph in text.split("\n"):
        lines.extend(wrapped_lines(draw, paragraph, font, max(40, x2 - x1 - 34)))
    heights = [draw.textbbox((0, 0), line, font=font)[3] for line in lines]
    total = sum(heights) + spacing * max(0, len(lines) - 1)
    y = y1 + (y2 - y1 - total) / 2
    for line, height in zip(lines, heights):
        width = draw.textbbox((0, 0), line, font=font)[2]
        draw.text((x1 + (x2 - x1 - width) / 2, y), line, font=font, fill=fill)
        y += height + spacing


def rounded_box(draw, box, fill, outline=LINE, radius=20, width=3):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_arrow(draw, start, end, color=BLUE, width=4, dashed=False):
    x1, y1 = start
    x2, y2 = end
    if dashed:
        segments = 18
        for index in range(0, segments, 2):
            a = index / segments
            b = min((index + 1) / segments, 1)
            draw.line((x1 + (x2 - x1) * a, y1 + (y2 - y1) * a,
                       x1 + (x2 - x1) * b, y1 + (y2 - y1) * b), fill=color, width=width)
    else:
        draw.line((x1, y1, x2, y2), fill=color, width=width)

    direction = 1 if x2 >= x1 else -1
    draw.polygon(
        [(x2, y2), (x2 - direction * 14, y2 - 8), (x2 - direction * 14, y2 + 8)],
        fill=color,
    )


def save_png(image: Image.Image, path: Path):
    image.save(path, "PNG", optimize=True)
    print(f"Generado: {path.relative_to(ROOT.parent.parent.parent)}")


def render_problem_tree():
    image = Image.new("RGB", (2000, 1300), PALE)
    draw = ImageDraw.Draw(image)
    title = get_font(48, True)
    subtitle = get_font(25)
    body = get_font(26, True)
    small = get_font(22)

    draw.rectangle((0, 0, 2000, 115), fill=NAVY)
    draw.text((70, 28), "VidaSalud — Árbol de Problemas", font=title, fill=WHITE)
    draw.text((70, 135), "Trazabilidad de causas, problema central y efectos del MVP", font=subtitle, fill=MUTED)

    effects = [
        (90, 245, 610, 420, "Stock poco confiable\ny decisiones tardías"),
        (740, 245, 1260, 420, "Duplicados y mayor tiempo\npara encontrar productos"),
        (1390, 245, 1910, 420, "Pérdidas por vencimiento\ny baja trazabilidad"),
    ]
    for x1, y1, x2, y2, label in effects:
        rounded_box(draw, (x1, y1, x2, y2), "#FFF0D6", ORANGE)
        draw_centered_text(draw, (x1, y1, x2, y2), label, body)

    problem = (430, 535, 1570, 720)
    rounded_box(draw, problem, "#FFE4E4", RED, radius=26, width=5)
    draw_centered_text(
        draw,
        problem,
        "PROBLEMA CENTRAL\nInventario farmacéutico poco confiable y difícil de controlar",
        get_font(32, True),
    )

    causes = [
        (55, 895, 475, 1115, "Registro manual y datos dispersos\nHU01–HU02"),
        (545, 895, 965, 1115, "Movimientos sin control ni responsable visible\nHU03–HU05"),
        (1035, 895, 1455, 1115, "Ausencia de alertas preventivas\nHU04"),
        (1525, 895, 1945, 1115, "Accesos y datos sin gobierno ni evidencia\nHU06–HU07 + auditoría"),
    ]
    for x1, y1, x2, y2, label in causes:
        rounded_box(draw, (x1, y1, x2, y2), LIGHT_BLUE, BLUE)
        draw_centered_text(draw, (x1, y1, x2, y2), label, body)

    for box in effects:
        center_x = (box[0] + box[2]) / 2
        draw_arrow(draw, (1000, problem[1]), (center_x, box[3]), RED)
    for box in causes:
        center_x = (box[0] + box[2]) / 2
        draw_arrow(draw, (center_x, box[1]), (1000, problem[3]), BLUE)

    footer = (350, 1180, 1650, 1260)
    rounded_box(draw, footer, WHITE, LINE, radius=16, width=2)
    draw_centered_text(
        draw,
        footer,
        "Respuesta: digitalización, integridad relacional, alertas y trazabilidad · Alineación principal: ODS 9",
        small,
        MUTED,
    )
    save_png(image, ANALYSIS_DIR / "ARBOL_PROBLEMAS.png")


def parse_sequence(path: Path):
    participants: list[tuple[str, str]] = []
    events: list[tuple] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        declaration = re.match(r"^(actor|participant|database)\s+([A-Za-z0-9_]+)", line)
        if declaration:
            participants.append((declaration.group(2), declaration.group(1)))
            continue
        message = re.match(r"^([A-Za-z0-9_]+)\s+(-+>)\s+([A-Za-z0-9_]+):\s*(.+)$", line)
        if message:
            events.append(("message", message.group(1), message.group(3), message.group(4), message.group(2).startswith("--")))
            continue
        if line.startswith("alt ") or line.startswith("else "):
            kind, label = line.split(" ", 1)
            events.append(("fragment", kind.upper(), label))
    return participants, events


def render_sequence(path: Path):
    participants, events = parse_sequence(path)
    width = max(1700, 285 * len(participants))
    height = 330 + 82 * len(events)
    image = Image.new("RGB", (width, height), WHITE)
    draw = ImageDraw.Draw(image)
    title_font = get_font(42, True)
    participant_font = get_font(20, True)
    message_font = get_font(19)
    fragment_font = get_font(19, True)

    title = path.stem.replace("_", " ")
    draw.rectangle((0, 0, width, 105), fill=NAVY)
    draw.text((55, 27), title, font=title_font, fill=WHITE)

    left = 120
    right = width - 120
    step = (right - left) / max(1, len(participants) - 1)
    xs = {name: left + index * step for index, (name, _) in enumerate(participants)}
    top = 145
    bottom = height - 70

    for name, kind in participants:
        x = xs[name]
        label = name
        if len(name) > 18:
            for suffix in ("Controller", "Service", "Screen", "DbContext"):
                if name.endswith(suffix):
                    label = f"{name[:-len(suffix)]}\n{suffix}"
                    break
        fill = "#FFF0D6" if kind == "actor" else ("#EDE9FE" if kind == "database" else LIGHT_BLUE)
        outline = ORANGE if kind == "actor" else ("#7C3AED" if kind == "database" else BLUE)
        rounded_box(draw, (x - 116, top, x + 116, top + 88), fill, outline, radius=14, width=3)
        draw_centered_text(draw, (x - 111, top + 4, x + 111, top + 84), label, participant_font, spacing=2)
        for y in range(top + 96, bottom, 18):
            draw.line((x, y, x, min(y + 9, bottom)), fill=LINE, width=2)

    y = top + 138
    for event in events:
        if event[0] == "fragment":
            label = f"{event[1]} · {event[2]}"
            draw.rounded_rectangle((55, y - 12, width - 55, y + 36), radius=8, fill="#F0F4F8", outline=LINE, width=2)
            draw.text((75, y), label, font=fragment_font, fill=MUTED)
            y += 64
            continue

        _, source, target, label, dashed = event
        x1 = xs[source]
        x2 = xs[target]
        if x1 == x2:
            loop = 75
            draw.line((x1, y, x1 + loop, y, x1 + loop, y + 34, x1, y + 34), fill=BLUE, width=3)
            draw.polygon([(x1, y + 34), (x1 + 13, y + 27), (x1 + 13, y + 41)], fill=BLUE)
            label_box = (x1 + 12, y - 28, min(width - 50, x1 + 360), y)
        else:
            draw_arrow(draw, (x1, y), (x2, y), BLUE if not dashed else MUTED, width=3, dashed=dashed)
            label_box = (min(x1, x2) + 10, y - 43, max(x1, x2) - 10, y - 3)

        lines = wrapped_lines(draw, label, message_font, max(150, label_box[2] - label_box[0]))
        text_value = "\n".join(lines[:2])
        bbox = draw.multiline_textbbox((0, 0), text_value, font=message_font, spacing=3, align="center")
        text_width = bbox[2] - bbox[0]
        center = (label_box[0] + label_box[2]) / 2
        draw.multiline_text((center - text_width / 2, label_box[1]), text_value, font=message_font, fill=TEXT, spacing=3, align="center")
        y += 82

    save_png(image, path.with_suffix(".png"))


def render_class_diagram():
    width, height = 2200, 1500
    image = Image.new("RGB", (width, height), PALE)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, width, 110), fill=NAVY)
    draw.text((60, 28), "VidaSalud — Diagrama de clases final", font=get_font(44, True), fill=WHITE)
    draw.text((60, 130), "Arquitectura implementada: Controllers → Services → EF Core/PostgreSQL", font=get_font(25), fill=MUTED)

    def package(box, title, entries, fill):
        rounded_box(draw, box, fill, BLUE, radius=24, width=4)
        x1, y1, x2, _ = box
        draw.rectangle((x1, y1, x2, y1 + 58), fill=BLUE)
        draw.text((x1 + 22, y1 + 14), title, font=get_font(27, True), fill=WHITE)
        y = y1 + 82
        for entry in entries:
            draw.text((x1 + 24, y), f"• {entry}", font=get_font(21), fill=TEXT)
            y += 39

    controllers = (70, 210, 620, 620)
    services = (800, 210, 1450, 700)
    data = (1630, 210, 2130, 580)
    package(controllers, "Controllers", ["ProductosController", "MovimientosController", "VencimientosController", "AuthController", "UsuariosController", "AuditoriaController", "SolicitudesBajaController"], WHITE)
    package(services, "Services", ["ProductoService / IProductoService", "MovimientoService / IMovimientoService", "VencimientoService / IVencimientoService", "UsuarioService / IUsuarioService", "AuditoriaService / IAuditoriaService", "SolicitudBajaService / ISolicitudBajaService"], WHITE)
    package(data, "Data", ["VidaSaludDbContext", "DatabaseSeeder", "ProductoFactory", "UsuarioFactory", "EF Core + Npgsql"], WHITE)

    draw_arrow(draw, (620, 415), (800, 415), BLUE, width=6)
    draw_arrow(draw, (1450, 415), (1630, 415), BLUE, width=6)

    models_box = (140, 790, 2060, 1370)
    rounded_box(draw, models_box, WHITE, "#7C3AED", radius=24, width=4)
    draw.rectangle((140, 790, 2060, 850), fill="#7C3AED")
    draw.text((165, 804), "Modelos persistentes", font=get_font(29, True), fill=WHITE)

    models = [
        ("Categoria", "IdCategoria\nNombreCategoria"),
        ("Producto", "IdProducto · IdCategoria\nNombre · Precio · FechaCreacion"),
        ("Lote", "IdLote · IdProducto\nCantidad · Ingreso · Vencimiento"),
        ("MovimientoInventario", "IdMovimiento · IdProducto\nTipo · Cantidad · Responsable"),
        ("Usuario", "IdUsuario · NombreUsuario\nEmail · Rol · PasswordHash · Activo"),
        ("SolicitudBaja", "IdSolicitud · IdUsuario?\nMotivo · Estado · Resolución"),
        ("LogAuditoria", "IdLog · Actor · Acción\nEntidad · Fecha · Resultado"),
    ]
    card_w, card_h = 420, 190
    positions = [(190 + col * 465, 900 + row * 230) for row in range(2) for col in range(4)]
    for (name, attrs), (x, y) in zip(models, positions):
        rounded_box(draw, (x, y, x + card_w, y + card_h), "#F6F2FF", "#9B7BD4", radius=14, width=3)
        draw.rectangle((x, y, x + card_w, y + 48), fill="#E4D8FA")
        draw.text((x + 16, y + 11), name, font=get_font(23, True), fill=TEXT)
        draw.multiline_text((x + 16, y + 68), attrs, font=get_font(19), fill=MUTED, spacing=9)

    draw.text((165, 1415), "Relaciones: Categoria 1—N Producto · Producto 1—N Lote/Movimiento · Usuario 0..1—N SolicitudBaja", font=get_font(22, True), fill=MUTED)
    save_png(image, ROOT / "DIAGRAMA_CLASES_FINAL.png")


if __name__ == "__main__":
    render_problem_tree()
    render_class_diagram()
    for source in sorted(ROOT.glob("HU*.puml")):
        render_sequence(source)
