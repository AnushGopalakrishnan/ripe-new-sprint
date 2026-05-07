from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass
from datetime import datetime
from html import unescape
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
ATTACHMENTS = ROOT / ".context" / "attachments"
SITE_DIR = ROOT / "site"
OUTPUT_DIR = ROOT / ".context" / "sanity"
OUTPUT_NDJSON = OUTPUT_DIR / "import.ndjson"
OUTPUT_SUMMARY = OUTPUT_DIR / "import-summary.json"


def read_csv_rows(filename: str) -> list[dict[str, str]]:
    path = ATTACHMENTS / filename
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def clean(value: str | None) -> str:
    return (value or "").strip()


def split_multi(value: str | None) -> list[str]:
    raw = clean(value)
    if not raw:
        return []
    parts = re.split(r"[,\n;]+", raw)
    return [part.strip() for part in parts if part.strip()]


def parse_bool(value: str | None) -> bool:
    return clean(value).lower() == "true"


def parse_datetime(value: str | None) -> str | None:
    raw = clean(value)
    if not raw:
      return None
    try:
        return datetime.strptime(
            raw, "%a %b %d %Y %H:%M:%S GMT+0000 (Coordinated Universal Time)"
        ).isoformat() + "Z"
    except ValueError:
        return None


def media_block(url: str | None, alt: str = "") -> dict | None:
    src = clean(url)
    if not src:
        return None
    return {
        "_type": "mediaBlock",
        "kind": "image",
        "src": src,
        "alt": alt or "",
    }


def ref(doc_type: str, slug: str) -> dict:
    return {"_type": "reference", "_ref": f"{doc_type}.{slug}"}


def text_or_none(value: str | None) -> str | None:
    raw = clean(value)
    return raw or None


def number_or_none(value: str | None) -> float | None:
    raw = clean(value)
    if not raw:
        return None
    try:
        return float(raw)
    except ValueError:
        return None


class RichTextSectionParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.blocks: list[tuple[str, str]] = []
        self.current_tag: str | None = None
        self.current_text: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in {"h1", "h2", "h3", "h4", "p", "li"}:
            self.current_tag = tag
            self.current_text = []

    def handle_data(self, data: str) -> None:
        if self.current_tag:
            self.current_text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if self.current_tag == tag:
            text = unescape("".join(self.current_text)).strip()
            if text:
                self.blocks.append((tag, re.sub(r"\s+", " ", text)))
            self.current_tag = None
            self.current_text = []


def html_to_sections(html: str) -> list[dict]:
    parser = RichTextSectionParser()
    parser.feed(html)

    sections: list[dict] = []
    current = {"_type": "storySection", "title": "Overview", "paragraphs": []}

    for tag, text in parser.blocks:
        if tag == "h1":
            continue
        if tag in {"h2", "h3", "h4"}:
            if current["paragraphs"]:
                sections.append(current)
            current = {"_type": "storySection", "title": text, "paragraphs": []}
            continue
        current["paragraphs"].append(text)

    if current["paragraphs"]:
        sections.append(current)

    return sections


def extract_first(pattern: str, html: str) -> str:
    match = re.search(pattern, html, re.S | re.I)
    if not match:
        return ""
    return re.sub(r"\s+", " ", unescape(match.group(1))).strip()


def extract_style_url(style_value: str) -> str:
    match = re.search(r'url\(&quot;(.*?)&quot;\)', style_value)
    if match:
        return unescape(match.group(1))
    return ""


@dataclass
class WritingDoc:
    slug: str
    title: str
    excerpt: str
    eyebrow: str
    publish_label: str
    read_time: str
    author: str
    author_bio: str
    author_image: str
    cover_image: str
    body_html: str
    sections: list[dict]


def parse_writing_page(path: Path) -> WritingDoc:
    html = path.read_text()
    slug = path.parent.name
    title = extract_first(r'<h1 class="article__title">(.*?)</h1>', html)
    excerpt = extract_first(r'<p class="article__summary text">(.*?)</p>', html)
    eyebrow = extract_first(r'<div class="hero-eyebrow">(.*?)</div>', html)
    meta = re.findall(r'<div class="mono-text hero-meta-text">(.*?)</div>', html, re.S | re.I)
    publish_label = re.sub(r"\s+", " ", unescape(meta[0])).strip() if len(meta) > 0 else ""
    read_time = re.sub(r"\s+", " ", unescape(meta[1])).strip() if len(meta) > 1 else ""
    author = extract_first(r'<div class="hero-author-name">(.*?)</div>', html)
    author_bio = extract_first(r'<p class="hero-author-bio">(.*?)</p>', html)
    author_style = extract_first(r'<div style="(.*?)" class="hero-author-image">', html)
    author_image = extract_style_url(author_style)
    cover_image = extract_first(r'<img src="(.*?)" loading="lazy" alt="" class="article__hero-image"', html)
    body_html = extract_first(r'<div class="w-richtext">(.*?)</div></div></div><section', html)
    sections = html_to_sections(body_html)

    return WritingDoc(
        slug=slug,
        title=title,
        excerpt=excerpt,
        eyebrow=eyebrow,
        publish_label=publish_label,
        read_time=read_time,
        author=author,
        author_bio=author_bio,
        author_image=author_image,
        cover_image=cover_image,
        body_html=body_html,
        sections=sections,
    )


def build_site_settings() -> dict:
    return {
        "_id": "siteSettings.default",
        "_type": "siteSettings",
        "title": "Ripe Studios",
        "description": "Migrated from Webflow to a Sanity-backed custom stack.",
        "nav": [
            {"_type": "link", "label": "Home", "href": "/"},
            {"_type": "link", "label": "Case Studies", "href": "/case-studies-new"},
            {"_type": "link", "label": "Writing", "href": "/archive/writing-new-copy"},
            {"_type": "link", "label": "Team", "href": "/archive/team-new"},
        ],
        "footerNav": [
            {"_type": "link", "label": "Home", "href": "/"},
            {"_type": "link", "label": "Case Studies", "href": "/case-studies-new"},
            {"_type": "link", "label": "Writing", "href": "/archive/writing-new-copy"},
            {"_type": "link", "label": "Team", "href": "/archive/team-new"},
        ],
        "seo": {
            "_type": "seo",
            "title": "Ripe Studios",
            "description": "Ripe Studios custom-code site powered by Sanity.",
        },
    }


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    case_study_tag_rows = read_csv_rows(
        "Ripe Studios — New Style - Case Studies Tags - 69934c1a5f86d6aad04913e1.csv"
    )
    feed_tag_rows = read_csv_rows(
        "Ripe Studios — New Style - Feed Tags - 69934c1a5f86d6aad0491366.csv"
    )
    team_tag_rows = read_csv_rows(
        "Ripe Studios — New Style - Team Tags - 69934c1a5f86d6aad0491381 (1).csv"
    )
    writing_tag_rows = read_csv_rows(
        "Ripe Studios — New Style - Writings Tags - 69dd162873b775c000502324.csv"
    )
    case_study_rows = read_csv_rows(
        "Ripe Studios — New Style - Case Studies - 69934c1a5f86d6aad049139d.csv"
    )
    feed_post_rows = read_csv_rows(
        "Ripe Studios — New Style - Feed Posts - 69934c1a5f86d6aad049130c.csv"
    )
    team_member_rows = read_csv_rows(
        "Ripe Studios — New Style - Team Members - 69934c1a5f86d6aad0491331.csv"
    )

    docs: list[dict] = [build_site_settings()]

    for row in case_study_tag_rows:
        slug = clean(row["Slug"])
        docs.append(
            {
                "_id": f"caseStudyTag.{slug}",
                "_type": "caseStudyTag",
                "title": clean(row["Name"]),
                "slug": {"_type": "slug", "current": slug},
                "legacyItemId": clean(row["Item ID"]),
            }
        )

    for row in feed_tag_rows:
        slug = clean(row["Slug"])
        docs.append(
            {
                "_id": f"feedTag.{slug}",
                "_type": "feedTag",
                "title": clean(row["Name"]),
                "slug": {"_type": "slug", "current": slug},
                "legacyItemId": clean(row["Item ID"]),
            }
        )

    for row in team_tag_rows:
        slug = clean(row["Slug"])
        docs.append(
            {
                "_id": f"teamTag.{slug}",
                "_type": "teamTag",
                "title": clean(row["Name"]),
                "slug": {"_type": "slug", "current": slug},
                "legacyItemId": clean(row["Item ID"]),
            }
        )

    for row in writing_tag_rows:
        slug = clean(row["Slug"])
        docs.append(
            {
                "_id": f"writingTag.{slug}",
                "_type": "writingTag",
                "title": clean(row["Name"]),
                "slug": {"_type": "slug", "current": slug},
                "legacyItemId": clean(row["Item ID"]),
            }
        )

    for row in case_study_rows:
        slug = clean(row["Slug"])
        docs.append(
            {
                "_id": f"caseStudy.{slug}",
                "_type": "caseStudy",
                "title": clean(row["Name"]),
                "slug": {"_type": "slug", "current": slug},
                "client": clean(row["Name"]),
                "summary": clean(row["Description"]),
                "order": number_or_none(row.get("Order")),
                "featured": False,
                "accentColor": text_or_none(row.get("Accent Color")),
                "accentColorText": text_or_none(row.get("Accent Color Text")),
                "tags": [ref("caseStudyTag", slug) for slug in split_multi(row.get("Tags"))],
                "coverMedia": media_block(row.get("Cover Image"), clean(row["Name"])),
                "testimonial": {
                    "_type": "testimonial",
                    "quote": text_or_none(row.get("Testimonial Quote")),
                    "name": text_or_none(row.get("Testimonial Name")),
                    "role": text_or_none(row.get("Testimonial Role")),
                    "company": text_or_none(row.get("Testimonial Company")),
                    "avatar": media_block(row.get("Testimonial Avatar"), clean(row.get("Testimonial Name"))),
                    "insertAfterOrder": number_or_none(row.get("Testimonial Insert After Order")),
                },
                "publishedAt": parse_datetime(row.get("Published On")),
                "legacyItemId": clean(row["Item ID"]),
            }
        )

    for row in team_member_rows:
        slug = clean(row["Slug"])
        docs.append(
            {
                "_id": f"teamMember.{slug}",
                "_type": "teamMember",
                "name": clean(row["Name"]),
                "slug": {"_type": "slug", "current": slug},
                "role": text_or_none(row.get("Job Title")),
                "group": text_or_none(row.get("Group")),
                "avatar": media_block(row.get("Profile Picture"), clean(row["Name"])),
                "bio": text_or_none(row.get("Bio")),
                "bioSummary": text_or_none(row.get("Bio Summary")),
                "email": text_or_none(row.get("Email")),
                "phone": text_or_none(row.get("Phone Number")),
                "websiteUrl": text_or_none(row.get("Website Link")),
                "twitterUrl": text_or_none(row.get("Twitter Link")),
                "tags": [ref("teamTag", slug) for slug in split_multi(row.get("Tags"))],
                "projects": [ref("caseStudy", slug) for slug in split_multi(row.get("Projects"))],
                "publishedAt": parse_datetime(row.get("Published On")),
                "legacyItemId": clean(row["Item ID"]),
            }
        )

    for row in feed_post_rows:
        slug = clean(row["Slug"])
        docs.append(
            {
                "_id": f"feedPost.{slug}",
                "_type": "feedPost",
                "title": clean(row["Post Title"]),
                "slug": {"_type": "slug", "current": slug},
                "excerpt": text_or_none(row.get("Description")),
                "coverMedia": media_block(row.get("Feed Post Image"), clean(row["Post Title"])),
                "postType": text_or_none(row.get("Post Type")),
                "tags": [ref("feedTag", slug) for slug in split_multi(row.get("Tag"))],
                "featured": parse_bool(row.get("Featured")),
                "associations": [ref("teamMember", slug) for slug in split_multi(row.get("Associations"))],
                "publishedAt": parse_datetime(row.get("Published On")),
                "legacyItemId": clean(row["Item ID"]),
            }
        )

    for page in sorted((SITE_DIR / "writing").glob("*/index.html")):
        writing = parse_writing_page(page)
        docs.append(
            {
                "_id": f"writing.{writing.slug}",
                "_type": "writing",
                "title": writing.title,
                "slug": {"_type": "slug", "current": writing.slug},
                "excerpt": writing.excerpt,
                "eyebrow": writing.eyebrow or None,
                "author": writing.author or None,
                "authorBio": writing.author_bio or None,
                "authorImage": media_block(writing.author_image, writing.author),
                "publishLabel": writing.publish_label or None,
                "readTime": writing.read_time or None,
                "category": writing.eyebrow.split("/")[0].strip() if writing.eyebrow else None,
                "coverMedia": media_block(writing.cover_image, writing.title),
                "body": writing.sections,
                "bodyHtml": writing.body_html,
                "legacyItemId": writing.slug,
            }
        )

    with OUTPUT_NDJSON.open("w", encoding="utf-8") as handle:
        for doc in docs:
            clean_doc = {key: value for key, value in doc.items() if value not in ("", None, [], {})}
            handle.write(json.dumps(clean_doc, ensure_ascii=True) + "\n")

    summary = {
        "output": str(OUTPUT_NDJSON.relative_to(ROOT)),
        "counts": {
            "documents": len(docs),
            "caseStudyTags": len(case_study_tag_rows),
            "caseStudies": len(case_study_rows),
            "feedTags": len(feed_tag_rows),
            "feedPosts": len(feed_post_rows),
            "teamTags": len(team_tag_rows),
            "teamMembers": len(team_member_rows),
            "writingTags": len(writing_tag_rows),
            "writingsFromHtml": len(list((SITE_DIR / "writing").glob("*/index.html"))),
        },
    }
    OUTPUT_SUMMARY.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
