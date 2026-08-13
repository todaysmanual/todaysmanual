from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    HRFlowable,
    Image,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[1]
SCREENSHOT_DIR = ROOT / "tmp" / "pdfs" / "screenshots"
OPTIMIZED_DIR = ROOT / "tmp" / "pdfs" / "optimized"
CROP_DIR = ROOT / "tmp" / "pdfs" / "crops"
OUTPUT = ROOT / "output" / "pdf" / "todays-manual-owner-start-manual.pdf"

NAVY = HexColor("#071A38")
NAVY_2 = HexColor("#0B2446")
ORANGE = HexColor("#FF5C2B")
PAPER = HexColor("#F7F3EC")
WHITE = HexColor("#FFFEFA")
LINE = HexColor("#CDD0D2")
MUTED = HexColor("#526074")
GREEN = HexColor("#2F6A43")
GOLD = HexColor("#D59620")
PURPLE = HexColor("#8063A8")
BLUE = HexColor("#1B4B78")


pdfmetrics.registerFont(TTFont("Arial", "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Black", "/System/Library/Fonts/Supplemental/Arial Black.ttf"))
pdfmetrics.registerFont(TTFont("CourierNew", "/System/Library/Fonts/Supplemental/Courier New.ttf"))
pdfmetrics.registerFont(TTFont("CourierNew-Bold", "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"))


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="ManualBody", fontName="Arial", fontSize=9.3, leading=13.2,
    textColor=NAVY, spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="ManualSmall", fontName="Arial", fontSize=7.5, leading=10.5,
    textColor=MUTED, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="ManualMono", fontName="CourierNew", fontSize=7.4, leading=10,
    textColor=NAVY, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="ManualLabel", fontName="CourierNew-Bold", fontSize=7, leading=9,
    textColor=ORANGE, uppercase=True, tracking=0.8, spaceBefore=2, spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="ManualH1", fontName="Arial-Black", fontSize=24, leading=25,
    textColor=NAVY, spaceBefore=3, spaceAfter=11, keepWithNext=True,
))
styles.add(ParagraphStyle(
    name="ManualH2", fontName="Arial-Bold", fontSize=15, leading=18,
    textColor=NAVY, spaceBefore=10, spaceAfter=7, keepWithNext=True,
))
styles.add(ParagraphStyle(
    name="ManualH3", fontName="Arial-Bold", fontSize=10.5, leading=13,
    textColor=NAVY_2, spaceBefore=7, spaceAfter=5, keepWithNext=True,
))
styles.add(ParagraphStyle(
    name="ManualTable", fontName="Arial", fontSize=6.7, leading=8.5,
    textColor=NAVY,
))
styles.add(ParagraphStyle(
    name="ManualTableHead", fontName="Arial-Bold", fontSize=6.8, leading=8.5,
    textColor=WHITE,
))
styles.add(ParagraphStyle(
    name="ManualCallout", fontName="Arial-Bold", fontSize=9.2, leading=12.3,
    textColor=NAVY,
))
styles.add(ParagraphStyle(
    name="ManualCaption", fontName="Arial", fontSize=7.2, leading=9.6,
    textColor=MUTED, alignment=TA_CENTER, spaceBefore=4,
))
styles.add(ParagraphStyle(
    name="ManualTOC1", fontName="Arial-Bold", fontSize=9.2, leading=13,
    textColor=NAVY, leftIndent=0, firstLineIndent=0, spaceBefore=4,
))
styles.add(ParagraphStyle(
    name="ManualTOC2", fontName="Arial", fontSize=8.2, leading=11.5,
    textColor=MUTED, leftIndent=14, firstLineIndent=0, spaceBefore=2,
))


def P(text: str, style: str = "ManualBody") -> Paragraph:
    return Paragraph(text, styles[style])


def esc(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def section(title: str, label: str | None = None) -> list[Flowable]:
    parts: list[Flowable] = []
    if label:
        parts.append(P(label.upper(), "ManualLabel"))
    parts.append(P(title, "ManualH1"))
    parts.append(HRFlowable(width="100%", thickness=1.2, color=ORANGE, spaceAfter=9))
    return parts


def subsection(title: str) -> Paragraph:
    return P(title, "ManualH2")


def subsubsection(title: str) -> Paragraph:
    return P(title, "ManualH3")


def bullet(text: str, color: colors.Color = ORANGE) -> Table:
    return Table(
        [["", P(text, "ManualBody")]],
        colWidths=[3 * mm, 164 * mm],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), color),
            ("BOX", (0, 0), (0, 0), 0, color),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ("LEFTPADDING", (0, 0), (0, 0), 0),
            ("RIGHTPADDING", (0, 0), (0, 0), 0),
            ("LEFTPADDING", (1, 0), (1, 0), 6),
        ]),
    )


def callout(title: str, body: str, color: colors.Color = ORANGE) -> Table:
    content = [P(title, "ManualCallout"), P(body, "ManualSmall")]
    return Table(
        [[content]], colWidths=[167 * mm],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), HexColor("#FFF7F2")),
            ("BOX", (0, 0), (-1, -1), 0.8, color),
            ("LINEBEFORE", (0, 0), (0, -1), 4, color),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]),
    )


def data_table(headers: list[str], rows: Iterable[Iterable[str]], widths: list[float], repeat: int = 1) -> Table:
    data = [[P(esc(item), "ManualTableHead") for item in headers]]
    for row in rows:
        data.append([P(esc(str(item)), "ManualTable") for item in row])
    table = Table(data, colWidths=[width * mm for width in widths], repeatRows=repeat, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PAPER]),
    ]))
    return table


def image_dimensions(path: Path) -> tuple[int, int]:
    with PILImage.open(path) as source:
        return source.size


def fitted_image(path: Path, max_width: float, max_height: float) -> Image:
    width, height = image_dimensions(path)
    scale = min(max_width / width, max_height / height)
    return Image(str(path), width=width * scale, height=height * scale)


def optimize_screenshots() -> None:
    OPTIMIZED_DIR.mkdir(parents=True, exist_ok=True)
    CROP_DIR.mkdir(parents=True, exist_ok=True)
    for source_path in SCREENSHOT_DIR.glob("*.png"):
        with PILImage.open(source_path) as source:
            rgb = source.convert("RGB")
            rgb.save(OPTIMIZED_DIR / f"{source_path.stem}.jpg", "JPEG", quality=88, optimize=True)

    split_specs = [
        ("home-desktop-full.png", 4, "desktop-home-detail"),
        ("home-mobile-full.png", 5, "mobile-home-detail"),
    ]
    for filename, count, prefix in split_specs:
        with PILImage.open(SCREENSHOT_DIR / filename) as source:
            width, height = source.size
            segment = height / count
            for index in range(count):
                top = round(index * segment)
                bottom = round((index + 1) * segment)
                crop = source.crop((0, top, width, bottom)).convert("RGB")
                crop.save(CROP_DIR / f"{prefix}-{index + 1}.jpg", "JPEG", quality=91, optimize=True)


class NumberedDocTemplate(BaseDocTemplate):
    def __init__(self, filename: str):
        super().__init__(
            filename,
            pagesize=A4,
            rightMargin=21 * mm,
            leftMargin=21 * mm,
            topMargin=22 * mm,
            bottomMargin=20 * mm,
            title="Today's Manual - Owner Start Manual",
            author="Kennedy Abubakar",
            subject="Content replacement, image inventory and page screenshot handbook",
        )
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="normal")
        self.addPageTemplates([PageTemplate(id="main", frames=frame, onPage=self.draw_header_footer)])

    def draw_header_footer(self, canvas, doc):
        canvas.saveState()
        if doc.page > 1:
            canvas.setStrokeColor(LINE)
            canvas.setLineWidth(0.5)
            canvas.line(21 * mm, A4[1] - 14 * mm, A4[0] - 21 * mm, A4[1] - 14 * mm)
            canvas.setFillColor(MUTED)
            canvas.setFont("CourierNew-Bold", 6.5)
            canvas.drawString(21 * mm, A4[1] - 10.5 * mm, "TODAY'S MANUAL / OWNER START MANUAL")
            canvas.setFont("Arial", 6.5)
            canvas.drawRightString(A4[0] - 21 * mm, A4[1] - 10.5 * mm, "Developed by Kennedy Abubakar")
            canvas.setStrokeColor(LINE)
            canvas.line(21 * mm, 13 * mm, A4[0] - 21 * mm, 13 * mm)
            canvas.setFillColor(MUTED)
            canvas.setFont("Arial", 6.2)
            canvas.drawString(21 * mm, 8.5 * mm, "www.kennedyabubakar.com")
            canvas.drawRightString(A4[0] - 21 * mm, 8.5 * mm, f"Page {doc.page}")
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            style_name = flowable.style.name
            if style_name in ("ManualH1", "ManualH2"):
                level = 0 if style_name == "ManualH1" else 1
                text = flowable.getPlainText()
                key = f"heading-{self.page}-{abs(hash(text))}"
                self.canv.bookmarkPage(key)
                self.canv.addOutlineEntry(text, key, level=level, closed=False)
                self.notify("TOCEntry", (level, text, self.page, key))


class CoverFlowable(Flowable):
    def __init__(self, image_path: Path):
        super().__init__()
        self.width = 168 * mm
        self.height = 245 * mm
        self.image_path = image_path

    def draw(self):
        canvas = self.canv
        canvas.saveState()
        canvas.setFillColor(PAPER)
        canvas.rect(-1 * mm, -2 * mm, 170 * mm, 249 * mm, stroke=0, fill=1)
        canvas.setFillColor(ORANGE)
        canvas.rect(0, 224 * mm, 8 * mm, 8 * mm, stroke=0, fill=1)
        canvas.setFillColor(NAVY)
        canvas.setFont("CourierNew-Bold", 8)
        canvas.drawString(12 * mm, 229 * mm, "TODAY'S MANUAL / DOCUMENTATION EDITION 001")
        canvas.setFont("Arial-Black", 31)
        canvas.drawString(0, 193 * mm, "OWNER START")
        canvas.drawString(0, 179 * mm, "MANUAL.")
        canvas.setFillColor(ORANGE)
        canvas.rect(0, 169 * mm, 33 * mm, 2.5 * mm, stroke=0, fill=1)
        canvas.setFillColor(NAVY)
        canvas.setFont("Arial-Bold", 13)
        canvas.drawString(0, 154 * mm, "Content, imagery, placeholders,")
        canvas.drawString(0, 146 * mm, "routes and page screenshots")
        canvas.setFillColor(MUTED)
        canvas.setFont("Arial", 9)
        canvas.drawString(0, 136 * mm, "A complete replacement and ownership handbook")

        with PILImage.open(self.image_path) as image:
            width, height = image.size
        target_width = 168 * mm
        target_height = target_width * height / width
        canvas.drawImage(str(self.image_path), 0, 59 * mm, target_width, target_height, preserveAspectRatio=True, mask="auto")

        canvas.setFillColor(NAVY)
        canvas.rect(0, 0, 168 * mm, 47 * mm, stroke=0, fill=1)
        canvas.setFillColor(WHITE)
        canvas.setFont("Arial-Bold", 11)
        canvas.drawString(10 * mm, 30 * mm, "Website developed by Kennedy Abubakar")
        canvas.setFillColor(ORANGE)
        canvas.setFont("CourierNew-Bold", 8)
        canvas.drawString(10 * mm, 21 * mm, "AUTHOR / DEVELOPER")
        canvas.setFillColor(WHITE)
        canvas.setFont("Arial", 9)
        canvas.drawString(10 * mm, 13 * mm, "www.kennedyabubakar.com")
        canvas.restoreState()


@dataclass
class Asset:
    filename: str
    usage: str
    current_subject: str
    replacement: str
    crop: str
    priority: str


assets = [
    Asset("public/todaysmanual1.png", "Header, mobile drawer and footer wordmark", "Official horizontal Today’s Manual logo", "Keep unless the official brand team supplies a revised master", "Transparent horizontal logo", "KEEP"),
    Asset("public/todaysmanuallogo.png", "Favicon, shortcut icon and Apple touch icon", "Official square Today’s Manual mark", "Keep unless a new favicon package is approved", "Square transparent mark", "KEEP"),
    Asset("public/og.png", "Open Graph and X link preview", "Generated Today’s Manual editorial social card", "Replace only when a final launch campaign or approved social card exists", "1.91:1 landscape", "REVIEW"),
    Asset("public/editorial/student.jpg", "Homepage hero and Quick Read 01", "Young African student using a laptop", "Commission a hero image that matches the After University story; consider a separate image for Quick Read 01", "Hero: wide 4:5 crop; Quick Read: 3:2 strip", "HIGH"),
    Asset("public/editorial/money.jpg", "Money side story and Money Manual", "Plant beside coins", "Replace with publication-owned financial imagery; avoid reusing one photo twice", "Wide 3:2", "HIGH"),
    Asset("public/editorial/skills.jpg", "Skills side story and Skills Manual", "Programming code on laptop", "Replace with a modern skill-building scene featuring the target audience", "Wide 3:2", "HIGH"),
    Asset("public/editorial/work.jpg", "Work Manual and generic article fallback", "Black professionals collaborating in an office", "Use an owned workplace feature image; create a neutral fallback separately", "Wide 3:2", "MEDIUM"),
    Asset("public/editorial/life.jpg", "Life Manual", "Layered mountain landscape", "Replace with an owned wellbeing, relationships or lifestyle image", "Wide 3:2", "HIGH"),
    Asset("public/editorial/opportunity.jpg", "Opportunity Manual", "Technology/city scene", "Replace with a jobs, scholarship, open-door or travel opportunity image; update alt text immediately", "Wide 3:2", "CRITICAL"),
    Asset("public/editorial/cash.jpg", "Quick Read 02", "Close-up financial/lifestyle object image", "Replace with a clear Ghana cedi or first-income image; update alt text to match", "Wide 3:2", "CRITICAL"),
    Asset("public/editorial/desk.jpg", "Quick Read 03", "Pen and written page", "Replace with a learning or skills practice scene if available", "Wide 3:2", "MEDIUM"),
    Asset("public/editorial/office.jpg", "Quick Read 04", "Modern office interior", "Replace with a workplace conversation or team meeting", "Wide 3:2", "MEDIUM"),
    Asset("public/editorial/buildings.jpg", "Quick Read 05", "City office towers", "Replace with an entrepreneurship or side-hustle image", "Wide 3:2", "MEDIUM"),
    Asset("public/editorial/interview.jpg", "The Interview Manual feature", "Interview paperwork and writing", "Replace with an owned interview-preparation or interview-room image", "Wide 3:2", "MEDIUM"),
    Asset("public/editorial/voice.jpg", "Voices quote portrait", "Young professional portrait", "Replace with the real Kofi portrait only with consent, or change the name and quote", "Vertical portrait", "CRITICAL"),
]


homepage_copy = [
    ("Top issue bar", "Today in the Manual; AI; Careers; Money; Ghana; Business", "Topic list is editorial navigation copy", "app/components/Header.tsx"),
    ("World clocks", "ACC, LDN, NYC", "Live data; labels may be changed, zones are configured in code", "app/components/Header.tsx"),
    ("Issue", "Issue 001", "Hardcoded placeholder; increment for each edition", "app/components/Header.tsx"),
    ("Hero category", "Work / Career", "Replace when the lead story category changes", "app/components/HeroStory.tsx"),
    ("Hero headline", "Nobody Told Us What Happens After University.", "Lead story placeholder", "app/data/homepage.ts and app/components/HeroStory.tsx"),
    ("Hero excerpt", "The real world looks nothing like the classroom. Here’s what actually changes - and how to prepare for it.", "Lead story placeholder", "app/data/homepage.ts"),
    ("Hero byline", "By Today’s Manual", "Replace with real author or desk name", "app/components/HeroStory.tsx"),
    ("Hero read time", "8 min read", "Replace with calculated or editorial read time", "app/data/homepage.ts"),
    ("Money side story", "Your Salary Isn’t Your Net Worth.", "Article placeholder", "app/data/homepage.ts"),
    ("Skills side story", "The Skills That Will Pay You in 2030.", "Article placeholder", "app/data/homepage.ts"),
    ("Start Here heading", "Where are you right now?", "Evergreen navigation copy", "app/components/StartHere.tsx"),
    ("Manuals heading", "Explore what matters.", "Evergreen section copy", "app/components/Manuals.tsx"),
    ("Quick Reads heading", "You should know this.", "Evergreen section copy", "app/components/QuickReads.tsx"),
    ("Newsletter", "The Morning Manual - Three useful things. Five minutes. Every morning.", "Confirm product promise before launch", "app/components/Newsletter.tsx"),
    ("Footer description", "A guide for the generation building tomorrow...", "Approved brand description needed", "app/components/SiteFooter.tsx"),
    ("Footer signoff", "Made in Africa for the world we live in.", "Brand line; confirm final approval", "app/components/SiteFooter.tsx"),
]


start_here = [
    ("I’m still in school", "What should I be doing before graduating?", "/article/prepare-before-graduating", "Placeholder article"),
    ("I just graduated", "How do I actually start my career?", "/article/start-your-career", "Placeholder article"),
    ("I’m working", "How do I move up and grow faster?", "/article/grow-faster-at-work", "Placeholder article"),
    ("I want to build something", "Business, freelancing and entrepreneurship.", "/article/build-something-of-your-own", "Placeholder article"),
    ("I feel lost", "Where do I even begin?", "/article/find-your-next-step", "Placeholder article"),
]


manual_copy = [
    ("Work Manual", "Careers, workplace culture and growth.", "/work", "Orange"),
    ("Money Manual", "Make, manage and multiply your money.", "/money", "Dark green"),
    ("Skills Manual", "The skills that build value and freedom.", "/skills", "Deep blue"),
    ("Life Manual", "Mindset, health, relationships and becoming your best.", "/life", "Muted purple"),
    ("Opportunity Manual", "Jobs, scholarships, fellowships and more.", "/opportunity", "Ochre"),
]


quick_reads = [
    ("01", "5 things nobody tells you about your first job.", "3 min read", "/article/five-things-about-your-first-job"),
    ("02", "Your first 1000 GHS is different.", "4 min read", "/article/your-first-1000-ghs"),
    ("03", "7 high-income skills you can learn in 6 months.", "5 min read", "/article/high-income-skills-six-months"),
    ("04", "Corporate phrases (and what they mean).", "3 min read", "/article/corporate-phrases-explained"),
    ("05", "Why most side hustles never make money.", "4 min read", "/article/why-side-hustles-do-not-make-money"),
]


daily_briefs = [
    ("01", "MTN Ghana launches 5G in Accra and Kumasi.", "2 min read", "Placeholder - verify or replace"),
    ("02", "The World Bank predicts 3.3% growth for Ghana in 2026.", "2 min read", "Placeholder - verify or replace"),
    ("03", "Flutterwave is hiring across multiple roles.", "View opportunity", "Placeholder - verify or replace"),
]


known_articles = [
    ("/article/what-happens-after-university", "Nobody Told Us What Happens After University.", "Known metadata; article body is still placeholder"),
    ("/article/salary-is-not-net-worth", "Your Salary Isn’t Your Net Worth.", "Known metadata; article body is still placeholder"),
    ("/article/skills-that-will-pay-in-2030", "The Skills That Will Pay You in 2030.", "Known metadata; article body is still placeholder"),
    ("/article/five-things-about-your-first-job", "5 things nobody tells you about your first job.", "Known metadata; article body is still placeholder"),
    ("/article/your-first-1000-ghs", "Your first 1000 GHS is different.", "Known metadata; article body is still placeholder"),
    ("/article/high-income-skills-six-months", "7 high-income skills you can learn in 6 months.", "Known metadata; article body is still placeholder"),
    ("/article/corporate-phrases-explained", "Corporate phrases (and what they mean).", "Known metadata; article body is still placeholder"),
    ("/article/why-side-hustles-do-not-make-money", "Why most side hustles never make money.", "Known metadata; article body is still placeholder"),
]


placeholder_routes = [
    ("Start Here", "/article/prepare-before-graduating; /article/start-your-career; /article/grow-faster-at-work; /article/build-something-of-your-own; /article/find-your-next-step"),
    ("Search topics", "/article/career-change; /article/ai; /article/salary; /article/cv; /article/masters; /article/entrepreneurship; /article/remote-work; /article/money; /article/productivity"),
    ("Lower editorial", "/article/voices; /article/the-manual; /article/the-interview-manual"),
    ("About footer", "/article/about-us; /article/our-mission; /article/editorial-principles; /article/write-for-us; /article/contributors"),
    ("Resources footer", "/article/opportunities; /article/newsletter; /article/podcast; /article/videos"),
    ("Support footer", "/article/contact-us; /article/advertise; /article/partner-with-us; /article/privacy-policy; /article/terms-of-use"),
]


file_map = [
    ("app/page.tsx", "Homepage assembly, dynamic issue date and initial clock values", "Change section order or top-level data inputs"),
    ("app/data/homepage.ts", "Primary homepage content arrays and article metadata", "First place to update story titles, images, excerpts and read times"),
    ("app/components/Header.tsx", "Issue bar, clocks, navigation, search and mobile drawer", "Change topics, clock zones, issue number and search topics behavior"),
    ("app/components/HeroStory.tsx", "Hero layout and byline presentation", "Change fixed hero labels or component layout"),
    ("app/components/StartHere.tsx", "Start Here card presentation", "Change layout; content lives in data file"),
    ("app/components/Manuals.tsx", "Five Manuals presentation", "Change card layout; content lives in data file"),
    ("app/components/QuickReads.tsx", "Quick Reads presentation", "Change strip layout; content lives in data file"),
    ("app/components/LowerEditorial.tsx", "Daily Briefs, Voices and Interview Manual", "Several fixed placeholders must be replaced here"),
    ("app/components/Newsletter.tsx", "Newsletter bar shell", "Change newsletter product name and promise"),
    ("app/components/WaitlistForm.tsx", "Newsletter input, validation and submission states", "Change form labels and success/error copy"),
    ("app/api/waitlist/route.ts", "Resend email delivery", "Configure addresses and production email provider values"),
    ("app/components/SiteFooter.tsx", "Footer copy, official social destinations and contact email", "Update profiles, email or placeholder internal pages"),
    ("app/[category]/page.tsx", "Validated shared category route", "Add categories only with corresponding data and visual rules"),
    ("app/components/CategoryPage.tsx", "Shared category page template", "Connect category stories to CMS data"),
    ("app/article/[slug]/page.tsx", "Shared article preview template", "Replace preview with complete article body rendering"),
    ("app/layout.tsx", "SEO metadata, icons and social preview", "Change production title, description and social metadata"),
    ("app/globals.css", "Complete responsive visual system", "Change design tokens, breakpoints and section composition carefully"),
    ("public/editorial/", "Local temporary editorial photography", "Replace files or update data paths"),
    ("public/og.png", "Social sharing image", "Replace with approved campaign asset"),
    ("TODAYS_MANUAL_REBUILD.md", "Technical redesign log", "Keep updated after structural changes"),
]


def add_asset_catalog(story: list[Flowable]) -> None:
    story += section("Complete image and picture replacement catalog", "Visual assets")
    story.append(P(
        "Every current image is shown below. The word <b>temporary</b> means the image is usable for layout testing but should not automatically be treated as final licensed editorial art. When replacing an image, keep the same filename for the quickest swap, or update the path in <font name='CourierNew'>app/data/homepage.ts</font>. Always rewrite the alt text to describe the new image.",
        "ManualBody",
    ))
    story.append(callout(
        "Critical image rule",
        "Do not replace a photo without also checking its crop at desktop and mobile widths. The hero, side stories, vertical manual cards and Quick Read strip all crop the same source differently.",
        ORANGE,
    ))
    story.append(Spacer(1, 5 * mm))

    for index, asset in enumerate(assets, start=1):
        path = ROOT / asset.filename
        width_px, height_px = image_dimensions(path)
        preview = fitted_image(path, 72 * mm, 48 * mm)
        details = [
            P(f"{index:02d} / {esc(asset.filename)}", "ManualLabel"),
            P(f"<b>Current use:</b> {esc(asset.usage)}", "ManualSmall"),
            P(f"<b>Current subject:</b> {esc(asset.current_subject)}", "ManualSmall"),
            P(f"<b>What to replace:</b> {esc(asset.replacement)}", "ManualSmall"),
            P(f"<b>Expected crop:</b> {esc(asset.crop)}", "ManualSmall"),
            P(f"<b>Pixel size:</b> {width_px} x {height_px} | <b>Priority:</b> {asset.priority}", "ManualSmall"),
        ]
        card = Table([[preview, details]], colWidths=[76 * mm, 89 * mm])
        card.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.55, LINE),
            ("BACKGROUND", (0, 0), (-1, -1), WHITE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]))
        story.append(KeepTogether([card, Spacer(1, 3 * mm)]))


def screenshot_page(story: list[Flowable], title: str, filename: str, note: str, label: str = "Page screenshot") -> None:
    story.append(PageBreak())
    story += section(title, label)
    story.append(P(note, "ManualSmall"))
    image_path = OPTIMIZED_DIR / filename
    story.append(Spacer(1, 2 * mm))
    story.append(fitted_image(image_path, 166 * mm, 195 * mm))
    story.append(P(f"Captured from the local production build at 1440px unless otherwise stated. File: {filename}", "ManualCaption"))


def build_story() -> list[Flowable]:
    story: list[Flowable] = [CoverFlowable(ROOT / "public" / "og.png"), PageBreak()]

    story += section("Document identity and ownership", "Publication details")
    story.append(callout(
        "Author and developer credit",
        "This website is developed by <b>Kennedy Abubakar</b>. Website: <b>www.kennedyabubakar.com</b>. Kennedy Abubakar is listed as the author and developer of this owner manual.",
        ORANGE,
    ))
    story.append(Spacer(1, 5 * mm))
    story.append(data_table(
        ["Field", "Value"],
        [
            ("Website", "Today’s Manual"),
            ("Production domain", "todaysmanual.com"),
            ("Local test address", "http://localhost:3000"),
            ("Document purpose", "Content replacement, asset replacement, route inventory and owner onboarding"),
            ("Website developer", "Kennedy Abubakar"),
            ("Developer website", "www.kennedyabubakar.com"),
            ("Document status", "Detailed owner working manual - update after major content or architecture changes"),
        ],
        [47, 120],
    ))
    story.append(Spacer(1, 5 * mm))
    story.append(P(
        "This document is written for the person who will own, edit or commission content for Today’s Manual. It distinguishes finished design infrastructure from temporary editorial material. It does not assume that the reader is a developer.",
        "ManualBody",
    ))

    story.append(PageBreak())
    story += section("Table of contents", "Navigation")
    toc = TableOfContents()
    toc.levelStyles = [styles["ManualTOC1"], styles["ManualTOC2"]]
    story.append(toc)

    story.append(PageBreak())
    story += section("Start here: the first 30 minutes", "Owner quick start")
    story.append(P(
        "Use this section before changing any text or image. It is the shortest safe path from receiving the project to publishing a controlled update.",
        "ManualBody",
    ))
    steps = [
        ("1. Decide what is real", "Mark every headline, quote, daily brief, read time and image as approved, draft or temporary. The current site contains many deliberate placeholders."),
        ("2. Prepare replacement files", "Rename final images clearly, confirm usage permission, record photographer/source details and write accurate alt text before copying them into public/editorial/."),
        ("3. Update the data first", "Most homepage story content belongs in app/data/homepage.ts. Change data there before editing component markup."),
        ("4. Replace fixed copy", "Header issue number, Voices quote, featured manual copy, newsletter promise and footer links live directly in their component files."),
        ("5. Add complete article bodies", "Every article route currently ends with an Article preview placeholder. Publishing headlines without article bodies will create a polished but incomplete publication."),
        ("6. Test every screen", "Run npm run lint, npm test and npm run start. Check 390px mobile, 768px tablet and 1440px desktop views."),
        ("7. Verify facts", "Never publish the three daily briefs, salary/financial claims, opportunities or dates without current source verification."),
        ("8. Publish deliberately", "Confirm social preview, metadata, email delivery, privacy/terms pages and official profile ownership before deploying a public version."),
    ]
    for title, body in steps:
        story.append(KeepTogether([subsubsection(title), P(body, "ManualBody")]))
    story.append(callout(
        "The single most important fact",
        "The visual site is production-ready, but the editorial content is not a finished publication until article bodies, verified daily news, real opportunities, consented Voices profiles and final imagery are supplied.",
        ORANGE,
    ))

    story.append(PageBreak())
    story += section("Priority replacement checklist", "What must change")
    priorities = [
        ("P0 - before any public launch", "Replace or verify all three Daily Brief headlines; verify ownership of the supplied social profiles; add Privacy Policy and Terms; configure Resend; replace all article preview bodies; confirm photo licenses and consent."),
        ("P1 - editorial launch quality", "Replace hero, Money, Skills, Life, Opportunity, cash and Voices imagery; use real author names; confirm read times; replace the generated social preview if a campaign asset exists."),
        ("P2 - operational maturity", "Connect a CMS; add search indexing; add category pagination; add analytics; add newsletter subscriber storage; add a working Voices carousel."),
        ("P3 - ongoing edition work", "Increment Issue 001; refresh lead story; refresh Quick Reads; update daily news; check opportunities; review metadata and image crops."),
    ]
    for title, body in priorities:
        story.append(callout(title, body, ORANGE if title.startswith("P0") else NAVY))
        story.append(Spacer(1, 3 * mm))

    story.append(PageBreak())
    story += section("Site map and route status", "Architecture")
    story.append(subsection("Core pages"))
    story.append(data_table(
        ["URL", "Purpose", "Current status"],
        [
            ("/", "Full editorial homepage", "Complete visual layout; content still includes placeholders"),
            ("/work", "Work Manual category", "Shared template; limited curated story set"),
            ("/money", "Money Manual category", "Shared template; limited curated story set"),
            ("/skills", "Skills Manual category", "Shared template; limited curated story set"),
            ("/life", "Life Manual category", "Shared template; currently falls back to generic stories"),
            ("/opportunity", "Opportunity Manual category", "Shared template; currently falls back to generic stories"),
            ("/article/[slug]", "Article route", "Metadata-aware preview only; full body not implemented"),
            ("/api/waitlist", "Newsletter submission endpoint", "Requires Resend environment configuration"),
        ], [48, 55, 64],
    ))
    story.append(subsection("Known article routes"))
    story.append(data_table(["Route", "Current title", "Body status"], known_articles, [58, 66, 43]))
    story.append(subsection("Placeholder route groups"))
    story.append(data_table(["Source", "Routes that need real pages/content"], placeholder_routes, [35, 132]))

    story.append(PageBreak())
    story += section("Where every change lives", "File map")
    story.append(P(
        "Use this as the source-of-truth directory. Avoid changing the same copy in multiple files unless the table explicitly shows both a data and presentation location.",
        "ManualBody",
    ))
    story.append(data_table(["File or folder", "Responsibility", "Use it when"], file_map, [54, 57, 56]))

    story.append(PageBreak())
    story += section("Complete homepage copy register", "Content inventory")
    story.append(P(
        "The tables below reproduce the visible content and identify whether it is evergreen interface copy or editorial material that should be replaced. All editorial claims are drafts until approved by Today’s Manual.",
        "ManualBody",
    ))
    story.append(subsection("Header, hero and global copy"))
    story.append(data_table(["Area", "Current content", "Action", "Location"], homepage_copy, [33, 58, 42, 34]))
    story.append(subsection("Start Here cards"))
    story.append(data_table(["Card", "Description", "Destination", "Status"], start_here, [38, 52, 49, 28]))
    story.append(subsection("The Five Manuals"))
    story.append(data_table(["Manual", "Current description", "URL", "Colour"], manual_copy, [35, 75, 30, 27]))
    story.append(subsection("Quick Reads"))
    story.append(data_table(["No.", "Headline", "Read time", "Route"], quick_reads, [10, 77, 23, 57]))
    story.append(subsection("Daily Briefs - never publish without verification"))
    story.append(data_table(["No.", "Current headline", "Meta", "Required action"], daily_briefs, [10, 82, 25, 50]))

    story.append(PageBreak())
    story += section("Fixed placeholders outside the data file", "Content inventory")
    fixed_rows = [
        ("Voices introduction", "Real stories from young Africans.", "app/components/LowerEditorial.tsx", "Keep or refine brand language"),
        ("Voices quote", "I thought getting a degree was enough.", "app/components/LowerEditorial.tsx", "Replace with consented real quote"),
        ("Voices attribution", "Kofi, 26, Accra", "app/components/LowerEditorial.tsx", "Replace with real approved identity or anonymized attribution"),
        ("Voices dots", "Five decorative positions", "app/components/LowerEditorial.tsx", "Build real carousel state or reduce to one dot"),
        ("The Manual intro", "Definitive guides for every stage of your journey.", "app/components/LowerEditorial.tsx", "Approve evergreen positioning"),
        ("Featured manual", "The Interview Manual", "app/components/LowerEditorial.tsx", "Create the actual handbook/page"),
        ("Featured manual description", "Everything you need before, during and after an interview.", "app/components/LowerEditorial.tsx", "Approve or replace"),
        ("Newsletter promise", "Three useful things. Five minutes. Every morning.", "app/components/Newsletter.tsx", "Confirm schedule and value promise"),
        ("Newsletter destination", "todaysmanual@gmail.com notification", "app/api/waitlist/route.ts", "Replace with production list/CRM workflow"),
        ("Search", "Popular topics only; frontend filtering", "app/components/Header.tsx", "Connect real index before calling it site search"),
        ("Footer social links", "Official Facebook, Instagram, TikTok, LinkedIn and YouTube profiles supplied by the owner", "app/components/SiteFooter.tsx", "Keep current; update only when an official handle changes"),
        ("Footer contact email", "todaysmanual@gmail.com", "app/components/SiteFooter.tsx", "Official visible email and Contact Us mailto destination"),
        ("Footer internal links", "Most point to article preview placeholders", "app/components/SiteFooter.tsx", "Create actual About, policy, contact and resource pages"),
    ]
    story.append(data_table(["Item", "Current value", "Location", "Required action"], fixed_rows, [35, 50, 43, 39]))

    story.append(subsection("Official contact and social destinations"))
    story.append(data_table(
        ["Channel", "Official destination"],
        [
            ("Email", "todaysmanual@gmail.com"),
            ("Facebook", "https://www.facebook.com/profile.php?id=61593445161962"),
            ("Instagram", "https://www.instagram.com/todaysmanual/"),
            ("TikTok", "https://www.tiktok.com/@todaysmanualofficial"),
            ("LinkedIn", "https://www.linkedin.com/in/todaysmanual-undefined-538a70429/"),
            ("YouTube", "https://www.youtube.com/@todaysmanual"),
        ], [35, 132],
    ))

    add_asset_catalog(story)

    story.append(PageBreak())
    story += section("How to replace an image correctly", "Owner workflow")
    image_steps = [
        "Choose a final image with written permission or a clear license. Record photographer, source, license and consent details outside the codebase.",
        "Export a high-quality JPEG or WebP. Use at least 1600px on the long edge for hero and category imagery. Avoid text baked into editorial images.",
        "For a one-for-one swap, keep the exact filename and replace the file in public/editorial/. For a new filename, update the image path in app/data/homepage.ts or the fixed component that uses it.",
        "Rewrite imageAlt so it describes the new visible image rather than the story headline. The current Opportunity and cash alt text should be treated as priority review items.",
        "Check object-fit crops at 1440px, 768px and 390px. Keep important faces/hands away from extreme edges.",
        "Run the production build and inspect the homepage, category page and article preview that use the image.",
    ]
    for step in image_steps:
        story.append(bullet(step))
    story.append(subsection("Recommended export targets"))
    story.append(data_table(
        ["Use", "Recommended pixels", "Aspect guidance", "Notes"],
        [
            ("Homepage hero", "1600 x 1400 or larger", "Flexible portrait/wide crop", "Subject must survive desktop and mobile crops"),
            ("Side story", "1200 x 800", "3:2 landscape", "Leave dark/quiet space for white overlay text"),
            ("Manual card", "1200 x 800", "3:2 landscape", "Strong single scene; no tiny details"),
            ("Quick Read", "1200 x 800", "3:2 landscape", "Works as a shallow horizontal strip"),
            ("Voices portrait", "900 x 1350", "2:3 portrait", "Consent required; neutral crop"),
            ("Social preview", "1200 x 630", "1.91:1 landscape", "Keep text in a safe central region"),
            ("Favicon", "512 x 512", "Square", "Use official mark only"),
        ], [35, 38, 42, 52],
    ))

    story.append(PageBreak())
    story += section("How to replace copy and add articles", "Owner workflow")
    story.append(subsection("Homepage story metadata"))
    story.append(P(
        "Update <font name='CourierNew'>app/data/homepage.ts</font>. Each story record needs an id, slug, title, category, image, imageAlt and readTime. The hero also accepts excerpt and featured. Slugs must be lowercase and hyphenated because they become URLs.",
        "ManualBody",
    ))
    story.append(callout(
        "Do not stop at metadata",
        "Adding a title to homepage data does not create a real article body. The current article route displays a generic preview message. A CMS or article content source must be added before editorial launch.",
        ORANGE,
    ))
    story.append(subsection("Minimum article fields for a CMS"))
    story.append(data_table(
        ["Field", "Required", "Purpose"],
        [
            ("slug", "Yes", "Stable URL identifier"),
            ("title", "Yes", "Story headline"),
            ("dek/excerpt", "Yes", "Homepage and article introduction"),
            ("category", "Yes", "Work, Money, Skills, Life or Opportunity"),
            ("author", "Yes", "Named writer or Today’s Manual desk"),
            ("publishedAt/updatedAt", "Yes", "Publication accountability"),
            ("heroImage + alt + credit", "Yes", "Visual, accessibility and rights record"),
            ("body", "Yes", "Structured article blocks"),
            ("readTime", "Derived", "Calculate from body word count"),
            ("featured", "Optional", "Homepage placement"),
            ("seoTitle/seoDescription", "Recommended", "Search/social optimization"),
            ("sources", "Recommended", "Fact-checking and transparency"),
        ], [45, 25, 97],
    ))

    story.append(PageBreak())
    story += section("Newsletter, forms and environment setup", "Operations")
    story.append(P(
        "The newsletter form is real frontend behavior connected to <font name='CourierNew'>/api/waitlist</font>. The endpoint sends a notification through Resend. It is not yet a complete subscriber database or email marketing platform.",
        "ManualBody",
    ))
    story.append(data_table(
        ["Setting", "Current behavior", "Required production action"],
        [
            ("RESEND_API_KEY", "Required at runtime", "Set securely in hosting environment; never commit it"),
            ("WAITLIST_FROM_EMAIL", "Optional; defaults to Resend onboarding sender", "Use a verified Today’s Manual sending domain"),
            ("Destination email", "todaysmanual@gmail.com", "Confirm the correct team mailbox or replace with list storage"),
            ("Subscriber persistence", "None", "Connect email platform, CRM or database"),
            ("Consent copy", "Not present", "Add privacy/consent language appropriate to the mailing list"),
            ("Double opt-in", "Not present", "Decide based on legal and product requirements"),
            ("Abuse protection", "Honeypot only", "Add rate limiting and monitoring for public launch"),
        ], [44, 55, 68],
    ))

    story.append(PageBreak())
    story += section("SEO, sharing and brand metadata", "Operations")
    story.append(data_table(
        ["Item", "Current value", "Where to change", "Launch decision"],
        [
            ("Default title", "Today’s Manual - The guide for what comes next", "app/layout.tsx", "Approve final positioning"),
            ("Description", "Practical guidance for young Africans navigating work, money, skills, life and opportunity.", "app/layout.tsx", "Approve final search description"),
            ("Canonical base", "https://todaysmanual.com", "app/layout.tsx", "Keep when production domain is active"),
            ("Open Graph image", "/og.png", "public/og.png and app/layout.tsx", "Review generated image and exact social text"),
            ("Favicon", "/todaysmanuallogo.png", "public/ and app/layout.tsx", "Keep official mark"),
            ("Theme colour", "#f7f3ec", "app/layout.tsx", "Keep unless brand palette changes"),
            ("Article metadata", "Title only; derived by known data or slug", "app/article/[slug]/page.tsx", "Add article-specific descriptions/images/canonical URLs"),
        ], [38, 55, 42, 32],
    ))

    story.append(PageBreak())
    story += section("Accessibility and editorial safety", "Quality control")
    checks = [
        "Every replacement image needs accurate alt text. Do not reuse current alt text after changing the image.",
        "Icon-only controls require aria-label text. Keep labels when changing icons.",
        "Maintain visible keyboard focus styles and Escape-key behavior for search and mobile navigation.",
        "Do not reduce body text to match a screenshot if readability suffers.",
        "Keep orange text on cream limited to large or bold labels; check contrast before using orange for body copy.",
        "Voices names, ages, locations, quotes and portraits require explicit editorial approval and consent.",
        "Financial, salary, job, scholarship and opportunity content requires dated verification and responsible disclaimers where appropriate.",
        "Daily Brief items must display real publication dates and link to full sourced stories once connected to a CMS.",
        "Respect prefers-reduced-motion when adding animations.",
    ]
    for item in checks:
        story.append(bullet(item, NAVY))

    story.append(PageBreak())
    story += section("Build, test and launch procedure", "Quality control")
    commands = [
        ("Install", "npm install", "Uses the existing lockfile and project dependencies"),
        ("Local development", "npm run dev", "Starts live-reload development server"),
        ("Production build", "npm run build", "Creates the Vinext production output"),
        ("Automated checks", "npm test", "Builds and runs server-rendering/responsive assertions"),
        ("Lint", "npm run lint", "Checks React, TypeScript and framework rules"),
        ("Production preview", "npm run start", "Runs the built site at localhost:3000"),
    ]
    story.append(data_table(["Stage", "Command", "Purpose"], commands, [38, 48, 81]))
    story.append(subsection("Pre-publish checklist"))
    launch_checks = [
        "Homepage checked at 390px, 768px, 1024px, 1440px and 1920px.",
        "All homepage cards lead to a real, complete destination.",
        "All article facts, names, dates, currency values and opportunities are verified.",
        "Every image has permission, credit metadata and accurate alt text.",
        "Official Facebook, Instagram, TikTok, LinkedIn and YouTube links have been opened and ownership confirmed.",
        "Newsletter sends successfully from the verified domain and stores consented subscribers.",
        "Privacy Policy, Terms of Use, Contact, Advertise and Partner pages exist.",
        "Open Graph preview has been tested in messaging/social tools.",
        "Issue number and publication date are correct.",
        "Build, tests and lint all pass with a clean console.",
    ]
    for item in launch_checks:
        story.append(bullet(item, GREEN))

    story.append(PageBreak())
    story += section("Homepage visual tour", "Screenshot appendix")
    story.append(P(
        "The next pages record the complete local production build. These are implementation screenshots, not final editorial approval. Use the detailed crops to inspect each homepage zone without zooming the full-page image.",
        "ManualBody",
    ))
    story.append(fitted_image(OPTIMIZED_DIR / "home-desktop-full.jpg", 160 * mm, 195 * mm))
    story.append(P("Complete homepage at 1440px desktop width.", "ManualCaption"))

    for index in range(1, 5):
        screenshot_page(
            story,
            f"Desktop homepage detail {index} of 4",
            f"../crops/desktop-home-detail-{index}.jpg",
            [
                "Top issue bar with live clocks, main navigation and lead editorial hero.",
                "Start Here pathway cards and the Five Manuals editorial rail.",
                "Quick Reads, Daily Briefs, Voices and The Interview Manual.",
                "Morning Manual newsletter conversion bar and complete footer.",
            ][index - 1],
            "Homepage detail",
        )

    story.append(PageBreak())
    story += section("Mobile homepage overview", "Responsive screenshot")
    story.append(P("Complete homepage at 390px mobile width. Sections are intentionally reordered and horizontally scrollable where necessary.", "ManualSmall"))
    story.append(fitted_image(OPTIMIZED_DIR / "home-mobile-full.jpg", 84 * mm, 195 * mm))
    story.append(P("The full mobile page is very tall; the following five pages show readable detail crops.", "ManualCaption"))

    for index in range(1, 6):
        screenshot_page(
            story,
            f"Mobile homepage detail {index} of 5",
            f"../crops/mobile-home-detail-{index}.jpg",
            [
                "Mobile issue bar, logo/search/menu header, lead story and secondary stories.",
                "Start Here cards and the beginning of the Manuals rail.",
                "Quick Reads and Daily Briefs sections.",
                "Voices, The Manual and newsletter conversion area.",
                "Complete mobile footer with grouped links and signoff.",
            ][index - 1],
            "Mobile detail",
        )

    screenshot_page(story, "Search overlay", "search-overlay-desktop.jpg", "Desktop search state with popular topic routes. Search currently filters only this preset topic list.", "Interactive state")
    screenshot_page(story, "Mobile navigation drawer", "mobile-menu.jpg", "Mobile drawer with all five category links and the Morning Manual call to action. Captured at 390 x 844.", "Interactive state")

    category_notes = {
        "work": "Work category using the shared category template and available Work stories.",
        "money": "Money category using the shared category template and available Money stories.",
        "skills": "Skills category using the shared category template and available Skills stories.",
        "life": "Life category currently uses generic fallback stories because dedicated Life articles are not supplied.",
        "opportunity": "Opportunity category currently uses generic fallback stories because dedicated Opportunity articles are not supplied.",
    }
    for category, note in category_notes.items():
        screenshot_page(story, f"{category.title()} category page", f"category-{category}.jpg", note, "Category page")

    for route, title, status in known_articles:
        slug = route.rsplit("/", 1)[-1]
        screenshot_page(story, title, f"article-{slug}.jpg", status, "Article page")

    screenshot_page(
        story,
        "Generic placeholder article template",
        "article-placeholder-template.jpg",
        "This is the exact fallback shown for Start Here, search, About, Resources and Support links that do not have known article metadata. Replace this state with real page templates/content before launch.",
        "Placeholder page",
    )

    story.append(PageBreak())
    story += section("Final ownership checklist", "Handover")
    story.append(callout(
        "Website credit",
        "Website developed by <b>Kennedy Abubakar</b> - <b>www.kennedyabubakar.com</b>. Author and developer credit is intentionally included on the cover, document identity page, every internal page footer and this final handover page.",
        ORANGE,
    ))
    story.append(Spacer(1, 5 * mm))
    final_items = [
        "I know that app/data/homepage.ts is the primary homepage content source.",
        "I have reviewed every item marked CRITICAL or HIGH in the image catalog.",
        "I understand that all eight known article routes still use preview bodies.",
        "I will verify daily news, financial claims, jobs and opportunities before publication.",
        "I will keep the supplied official social URLs current and create the remaining legal pages.",
        "I will configure the newsletter provider securely and test real delivery.",
        "I will update this PDF or the rebuild documentation after a major structural change.",
        "I will run the build, tests and lint before every deployment.",
    ]
    for item in final_items:
        story.append(bullet(item, GREEN))
    story.append(Spacer(1, 8 * mm))
    story.append(P("END OF OWNER START MANUAL", "ManualLabel"))
    story.append(P("Today’s Manual - built for the generation navigating what comes next.", "ManualH2"))
    return story


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    optimize_screenshots()
    doc = NumberedDocTemplate(str(OUTPUT))
    doc.multiBuild(build_story())
    print(OUTPUT)


if __name__ == "__main__":
    main()
