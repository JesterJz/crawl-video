// crawler.js
const { chromium } = require('playwright');
const fs = require('fs');
const { spawn } = require('child_process');
const { saveVideo } = require('./downloader');

async function main() {
  const targetUrl = process.argv[2];
  if (!targetUrl) {
    console.error('❌ Usage: node crawler.js <url>');
    process.exit(1);
  }

  console.log('🌐 Crawling:', targetUrl);
  const match = targetUrl.match(/courses\/([^/]+)/);
  const courseId = match ? match[1] : 'unknown_course';

  const browser = await chromium.connectOverCDP('http://localhost:9222'); // kết nối browser thật
  const context = browser.contexts()[0];
  const page = await context.newPage();
  const cookies = await context.cookies();

  let videoLinks = [];

  // Lắng nghe network để bắt link video
  page.on('response', async (response) => {
    const url = response.url();
    if (url.match(/\.(m3u8|mpd|mp4)(\?|$)/)) {
      if (!videoLinks.includes(url)) {
        videoLinks.push(url);
      }
    }
  });

  try {
    await page.goto(targetUrl, { waitUntil: 'load', timeout: 60000 });
    await page.waitForSelector('body', { timeout: 15000 });
  } catch (err) {
    console.error('⚠️ Page load error:', err.message);
  }

  let title = await page.title();

  // Lưu HTML tạm
  const tempFile = 'page.html';
  const html = await page.content();
  fs.writeFileSync(tempFile, html, 'utf8');

  await page.waitForTimeout(5000);
  await page.close(); // ❗ chỉ đóng tab, không đóng toàn bộ browser

  console.log('📄 Temp HTML saved:', tempFile);
  console.log('🎥 Network links found:', videoLinks);

  // 📥 Tải tất cả video tìm thấy
  if (videoLinks.length > 0) {
    for (let i = 0; i < videoLinks.length; i++) {
      const videoUrl = videoLinks[i];
      const numberedTitle =
        videoLinks.length > 1 ? `${title}_part${i + 1}` : title;
      try {
        await saveVideo(courseId, numberedTitle, videoUrl, cookies);
      } catch (err) {
        console.error('❌ Download error:', err.message);
      }
    }
  } else {
    console.log('⚠️ Không tìm thấy video link trong DOM');
  }

  // Gọi Python analyze.py
  const py = runPython('analyze.py', [tempFile]);

  let result = '';
  py.stdout.on('data', (data) => {
    result += data.toString();
  });

  py.stderr.on('data', (data) => {
    console.error('🐍 Python error:', data.toString());
  });

  py.on('close', (code) => {
    console.log('✅ Python script finished with code', code);

    let metadata = {};
    try {
      metadata = JSON.parse(result);
    } catch (err) {
      console.error('❌ Failed to parse Python output:', err.message);
    }

    const finalResult = {
      url: targetUrl,
      network_videos: videoLinks,
      metadata_from_ai: metadata,
    };

    fs.writeFileSync(
      'result.json',
      JSON.stringify(finalResult, null, 2),
      'utf8'
    );
    console.log('💾 Result saved to result.json');

    // Xóa file tạm
    try {
      fs.unlinkSync(tempFile);
      console.log('🗑️ Temp file removed:', tempFile);
    } catch (err) {
      console.error('⚠️ Could not delete temp file:', err.message);
    }

    process.exit(0); // ✅ thoát hẳn chương trình
  });
}

function runPython(script, args = []) {
  const pythonCmd = fs.existsSync('/usr/bin/python') ? 'python' : 'python3';
  return spawn(pythonCmd, [script, ...args]);
}

main();
