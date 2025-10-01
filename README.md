# 🎥 Crawl Video với Playwright + Python

Dự án này dùng **Playwright (Node.js)** để điều khiển browser và **Python** để phân tích DOM/tải video.

---

## ⚙️ Yêu cầu môi trường

- Node.js >= 18
- Python >= 3.10
- Google Chrome (cài sẵn)

---

## 🚀 Cài đặt

```bash
# Clone project
git clone <repo-url>
cd crawl-video

# Cài Node.js packages
npm install playwright

# Cài Python venv
python3 -m venv venv
source venv/bin/activate

# Cài Python packages
pip install crawl4ai beautifulsoup4

# Tải trình điều khiển Chrome cho Playwright
google-chrome --remote-debugging-port=9222 --user-data-dir=$HOME/.config/google-chrome --profile-directory=Default --new-window

# Chạy crawler
node crawler.js https://globis.jp/courses/a6f72bce/
