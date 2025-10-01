import sys
import json
import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy

async def main(file_path: str):
    try:
        # Đọc HTML từ file tạm
        with open(file_path, "r", encoding="utf-8") as f:
            html_content = f.read()

        # Config cho browser (chạy headless Chromium)
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
        )

        # Config cho crawler
        run_config = CrawlerRunConfig(
            extraction_strategy=LLMExtractionStrategy(
                provider="openai/gpt-4o-mini",  # hoặc "ollama/llama3" nếu bạn cài local
                schema={
                    "name": "VideoPageMetadata",
                    "description": "Extract metadata from video course page",
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "description": {"type": "string"},
                        "videos": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                    },
                },
                extraction_type="json",
                max_tokens=500,
            ),
            cache_mode=CacheMode.BYPASS,
        )

        # Chạy crawler với HTML tạm
        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(html=html_content, config=run_config)

        # In kết quả JSON để Node.js parse
        print(json.dumps(result.extracted_content, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing file path"}))
    else:
        asyncio.run(main(sys.argv[1]))
