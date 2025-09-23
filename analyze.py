import sys
import json
from crawl4ai import WebCrawler

if len(sys.argv) < 2:
    print(json.dumps({"error": "Usage: python analyze.py <html_file>"}))
    sys.exit(1)

html_file = sys.argv[1]

with open(html_file, "r", encoding="utf8") as f:
    html = f.read()

crawler = WebCrawler()
doc = crawler.load_html(html)

# Query AI
video_links = doc.query("Extract all video or streaming URLs (mp4, m3u8, mpd) from this HTML page")
title = doc.query("Extract the title of this page")
description = doc.query("Extract a short description of this page")

result = {
    "title": title,
    "description": description,
    "videos": video_links,
}

print(json.dumps(result, ensure_ascii=False))
