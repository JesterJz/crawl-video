const CDP = require("chrome-remote-interface");
const downloader = require("./downloader");

async function crawl(url) {
  let client;
  try {
    client = await CDP();
    const { Page, Runtime } = client;

    await Page.enable();
    await Runtime.enable();

    await Page.navigate({ url });
    await Page.loadEventFired();

    console.log(`Navigated to ${url}`);

    // Ví dụ lấy toàn bộ HTML
    const result = await Runtime.evaluate({
      expression: "document.documentElement.outerHTML"
    });

    console.log("Page HTML length:", result.result.value.length);

    // Ví dụ download file
    // await downloader.download("https://example.com/video.mp4", "video.mp4");

  } catch (err) {
    console.error("Crawler error:", err);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Lấy URL từ tham số dòng lệnh
const url = process.argv[2];
if (!url) {
  console.error("Usage: node crawler.js <url>");
  process.exit(1);
}

crawl(url);
