from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "marketing" / "gtm-launch"
FONT_REGULAR = ROOT / "assets" / "fonts" / "Pretendard-Regular.otf"
FONT_SEMIBOLD = ROOT / "assets" / "fonts" / "Pretendard-SemiBold.otf"
FONT_BOLD = ROOT / "assets" / "fonts" / "Pretendard-Bold.otf"

WIDTH = 1290
HEIGHT = 2796
PHONE_W = 980
PHONE_H = 1960

COPY = {
    "kr": {
        "screens": [
            {
                "title": "AI 역량 검사 훈련",
                "subtitle": "6개 미니게임으로 빠르게 실전 감각을 올리세요",
                "pill": "평균 8분 / 데일리 리포트",
                "cta": "지금 시작",
            },
            {
                "title": "N-Back 집중 트레이닝",
                "subtitle": "반응 속도와 작업 기억을 동시에 강화",
                "pill": "실시간 정확도 · 오답 패턴 분석",
                "cta": "챌린지 진행",
            },
            {
                "title": "기록 기반 성장 리포트",
                "subtitle": "점수 추이와 집중 구간을 한눈에 확인",
                "pill": "주간 리듬 추천 · 난이도 자동 조정",
                "cta": "내 기록 보기",
            },
        ],
        "gif_text": "하루 10분, 눈에 보이는 성장",
    },
    "en": {
        "screens": [
            {
                "title": "Train for AI Aptitude",
                "subtitle": "Build interview-ready focus with 6 mini games",
                "pill": "8 min sessions · Daily insights",
                "cta": "Start now",
            },
            {
                "title": "N-Back Focus Mode",
                "subtitle": "Sharpen memory and speed at the same time",
                "pill": "Live accuracy and mistake pattern tracking",
                "cta": "Run challenge",
            },
            {
                "title": "Progress You Can See",
                "subtitle": "Trends, streaks, and weak spots in one view",
                "pill": "Weekly rhythm tips · Smart difficulty",
                "cta": "View my stats",
            },
        ],
        "gif_text": "10 minutes a day, measurable progress",
    },
}


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def gradient_background() -> Image.Image:
    bg = Image.new("RGB", (WIDTH, HEIGHT), "#0E1B32")
    draw = ImageDraw.Draw(bg)
    for y in range(HEIGHT):
        t = y / HEIGHT
        r = int(14 + (37 - 14) * t)
        g = int(27 + (52 - 27) * t)
        b = int(50 + (88 - 50) * t)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((-240, -160, 780, 760), fill=(56, 189, 248, 74))
    gdraw.ellipse((460, 380, 1680, 1640), fill=(16, 185, 129, 66))
    gdraw.ellipse((-160, 1780, 960, 3200), fill=(45, 212, 191, 58))
    return Image.alpha_composite(bg.convert("RGBA"), glow).convert("RGB")


def rounded_rect(size: tuple[int, int], radius: int, fill: tuple[int, int, int, int]) -> Image.Image:
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=fill)
    return img


def draw_phone_shell(base: Image.Image, x: int, y: int, scene_idx: int) -> None:
    shadow = rounded_rect((PHONE_W + 20, PHONE_H + 20), 84, (0, 0, 0, 120)).filter(ImageFilter.GaussianBlur(14))
    base.paste(shadow, (x - 10, y + 14), shadow)

    shell = rounded_rect((PHONE_W, PHONE_H), 74, (6, 16, 32, 255))
    screen = rounded_rect((PHONE_W - 36, PHONE_H - 36), 56, (238, 244, 249, 255))

    base.paste(shell, (x, y), shell)
    base.paste(screen, (x + 18, y + 18), screen)

    draw = ImageDraw.Draw(base)
    sx = x + 48
    sy = y + 110
    sw = PHONE_W - 96

    draw.text((sx, sy), "AI Aptitude", fill="#0F172A", font=font(FONT_BOLD, 44))
    draw.text((sx, sy + 60), "Daily training", fill="#475569", font=font(FONT_REGULAR, 28))

    for i in range(3):
        card_y = sy + 160 + i * 260
        color = ["#DBEAFE", "#DCFCE7", "#FEF3C7"][((scene_idx + i) % 3)]
        draw.rounded_rectangle((sx, card_y, sx + sw, card_y + 220), radius=34, fill=color)
        draw.text((sx + 28, card_y + 30), ["N-Back", "Go/No-Go", "Stroop"][i], fill="#0F172A", font=font(FONT_SEMIBOLD, 34))
        draw.text((sx + 28, card_y + 90), ["Memory", "Inhibition", "Attention"][i], fill="#334155", font=font(FONT_REGULAR, 26))
        draw.rounded_rectangle((sx + sw - 220, card_y + 144, sx + sw - 30, card_y + 196), radius=20, fill="#0F172A")
        draw.text((sx + sw - 180, card_y + 156), "Play", fill="#F8FAFC", font=font(FONT_SEMIBOLD, 24))

    stat_y = sy + 980
    for i, label in enumerate(["Accuracy", "Speed", "Streak"]):
        cx = sx + i * (sw // 3)
        draw.text((cx, stat_y), label, fill="#64748B", font=font(FONT_REGULAR, 24))
        draw.text((cx, stat_y + 38), ["92%", "301ms", "14d"][i], fill="#0F172A", font=font(FONT_BOLD, 34))


def render_screen(lang: str, idx: int) -> Image.Image:
    scene = COPY[lang]["screens"][idx]
    image = gradient_background().convert("RGBA")
    draw = ImageDraw.Draw(image)

    draw.text((92, 150), "AI Aptitude Games", fill="#C7D2FE", font=font(FONT_SEMIBOLD, 38))
    draw.text((92, 242), scene["title"], fill="#F8FAFC", font=font(FONT_BOLD, 78))
    draw.text((92, 386), scene["subtitle"], fill="#E2E8F0", font=font(FONT_REGULAR, 38))

    pill_w, pill_h = 680, 72
    draw.rounded_rectangle((92, 476, 92 + pill_w, 476 + pill_h), radius=28, fill="#0EA5E9")
    draw.text((120, 493), scene["pill"], fill="#F0F9FF", font=font(FONT_SEMIBOLD, 30))

    phone_x = (WIDTH - PHONE_W) // 2
    phone_y = 700
    draw_phone_shell(image, phone_x, phone_y, idx)

    cta_w, cta_h = 420, 96
    cta_x = (WIDTH - cta_w) // 2
    cta_y = 2570
    draw.rounded_rectangle((cta_x, cta_y, cta_x + cta_w, cta_y + cta_h), radius=34, fill="#111827")
    draw.text((cta_x + 120, cta_y + 27), scene["cta"], fill="#F8FAFC", font=font(FONT_SEMIBOLD, 40))

    return image.convert("RGB")


def render_demo_gif() -> None:
    frames: list[Image.Image] = []
    for i in range(18):
        base = gradient_background().convert("RGBA")
        draw = ImageDraw.Draw(base)
        draw.text((92, 156), COPY["en"]["gif_text"], fill="#E2E8F0", font=font(FONT_SEMIBOLD, 48))

        offset = int(math.sin((i / 18) * math.pi * 2) * 16)
        phone_x = (WIDTH - PHONE_W) // 2
        phone_y = 640 + offset
        draw_phone_shell(base, phone_x, phone_y, i % 3)

        pulse = int((math.sin((i / 18) * math.pi * 2) + 1) * 45)
        draw.ellipse((1040 - pulse, 2240 - pulse, 1140 + pulse, 2340 + pulse), fill=(16, 185, 129, 120))
        draw.ellipse((1068, 2268, 1112, 2312), fill="#064E3B")

        frames.append(base.convert("P", palette=Image.Palette.ADAPTIVE))

    out = OUT_DIR / "demo" / "launch-demo.gif"
    out.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        out,
        save_all=True,
        append_images=frames[1:],
        duration=120,
        loop=0,
        optimize=False,
        disposal=2,
    )


def main() -> None:
    for lang in ("kr", "en"):
        for idx in range(3):
            img = render_screen(lang, idx)
            out = OUT_DIR / lang / f"screen-{idx + 1}.png"
            out.parent.mkdir(parents=True, exist_ok=True)
            img.save(out, "PNG", optimize=True)

    render_demo_gif()

    readme = OUT_DIR / "README.md"
    readme.write_text(
        """# GTM Launch Asset Pack\n\n"
        "Generated files for [GAM-232](/GAM/issues/GAM-232).\n\n"
        "## Files\n"
        "- `kr/screen-1.png`\n"
        "- `kr/screen-2.png`\n"
        "- `kr/screen-3.png`\n"
        "- `en/screen-1.png`\n"
        "- `en/screen-2.png`\n"
        "- `en/screen-3.png`\n"
        "- `demo/launch-demo.gif`\n\n"
        "## Regenerate\n"
        "```bash\n"
        "source .tmp-marketing-venv/bin/activate\n"
        "python scripts/generate-launch-assets.py\n"
        "```\n"
        """,
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
