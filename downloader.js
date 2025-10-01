// downloader.js
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

/**
 * Hàm tải video với progress
 * @param {string} courseId - ID course (tạo thư mục)
 * @param {string} title - Tên video
 * @param {string} videoUrl - Link video
 * @param {Array} cookies - Cookies từ Playwright (nếu có)
 */
async function saveVideo(courseId, title, videoUrl, cookies = []) {
  return new Promise((resolve, reject) => {
    // 📂 Tạo thư mục course
    const dir = path.join(__dirname, "downloads", courseId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 📝 Tên file video (loại bỏ ký tự đặc biệt)
    const safeTitle = title.replace(/[<>:"/\\|?*]+/g, "_");
    const filePath = path.join(dir, safeTitle + ".mp4");

    console.log("📥 Đang tải:", filePath);

    const file = fs.createWriteStream(filePath);

    const client = videoUrl.startsWith("https") ? https : http;

    const options = new URL(videoUrl);

    // Nếu có cookies -> set header
    if (cookies && cookies.length > 0) {
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
      options.headers = { Cookie: cookieHeader };
    }

    client.get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // 🔁 Redirect
        console.log("🔀 Redirecting to:", res.headers.location);
        return saveVideo(courseId, title, res.headers.location, cookies)
          .then(resolve)
          .catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: ${res.statusCode}`));
        return;
      }

      const total = parseInt(res.headers["content-length"], 10) || 0;
      let downloaded = 0;

      res.on("data", (chunk) => {
        downloaded += chunk.length;
        if (total) {
          const percent = ((downloaded / total) * 100).toFixed(2);
          process.stdout.write(`\r⏬ Progress: ${percent}%`);
        } else {
          process.stdout.write(`\r⏬ Downloaded: ${(downloaded / (1024 * 1024)).toFixed(2)} MB`);
        }
      });

      res.pipe(file);

      file.on("finish", () => {
        file.close(() => {
          console.log("\n✅ Video tải xong:", filePath);
          resolve(filePath);
        });
      });
    }).on("error", (err) => {
      fs.unlink(filePath, () => reject(err));
    });
  });
}

module.exports = { saveVideo };
