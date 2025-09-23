// crawler.js
const { chromium } = require("playwright");
const fs = require("fs");
const { spawn } = require("child_process");

async function main() {
  const targetUrl = process.argv[2];
  if (!targetUrl) {
    console.error("❌ Usage: node crawler.js <url>");
    process.exit(1);
  }

  console.log("🌐 Crawling:", targetUrl);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let videoLinks = [];

  // Lắng nghe network để bắt link video
  page.on("response", async (response) => {
    const url = response.url();
    if (url.match(/\.(m3u8|mpd|mp4)(\?|$)/)) {
      if (!videoLinks.includes(url)) {
        videoLinks.push(url);
      }
    }
  });

  try {
    await page.goto(targetUrl, { waitUntil: "load", timeout: 60000 });
    await page.waitForSelector("body", { timeout: 15000 });
  } catch (err) {
    console.error("⚠️ Page load error:", err.message);
  }

  // Lưu HTML tạm
  const tempFile = "page.html";
  const html = await page.content();
  fs.writeFileSync(tempFile, html, "utf8");

  await page.waitForTimeout(5000);
  await browser.close();

  console.log("📄 Temp HTML saved:", tempFile);
  console.log("🎥 Network links found:", videoLinks);

  // Gọi Python analyze.py
  const py = spawn("python", ["analyze.py", tempFile]);

  let result = "";
  py.stdout.on("data", (data) => {
    result += data.toString();
  });

  py.stderr.on("data", (data) => {
    console.error("🐍 Python error:", data.toString());
  });

  py.on("close", (code) => {
    console.log("✅ Python script finished with code", code);

    let metadata = {};
    try {
      metadata = JSON.parse(result);
    } catch (err) {
      console.error("❌ Failed to parse Python output:", err.message);
    }

    const finalResult = {
      url: targetUrl,
      network_videos: videoLinks,
      metadata_from_ai: metadata,
    };

    fs.writeFileSync("result.json", JSON.stringify(finalResult, null, 2), "utf8");
    console.log("💾 Result saved to result.json");

    // Xóa file tạm
    try {
      fs.unlinkSync(tempFile);
      console.log("🗑️ Temp file removed:", tempFile);
    } catch (err) {
      console.error("⚠️ Could not delete temp file:", err.message);
    }
  });
}

main();
