# 🎥 Web Video Crawler (Playwright + Python AI)

This project uses **Playwright** (Node.js) to connect to a real Chrome browser session (with the user’s own profile), listens to network traffic to detect video links (`.m3u8`, `.mpd`, `.mp4`), downloads them, and then processes the page using **Python + Crawl4AI** for extra metadata extraction.

---

## 🔧 Requirements

- **Node.js** v18 or higher
- **Python** 3.8 or higher (with `pip`)
- **Google Chrome** installed
- **FFmpeg** installed (required for video download/merge)

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/yourname/crawl-video.git
cd crawl-video
```

Install Node.js dependencies:

```bash
npm install playwright
```

Install Python dependencies:

```bash
pip install crawl4ai beautifulsoup4
```
Install FFmpeg:

- Linux / MacOS:
```bash
sudo apt update && sudo apt install ffmpeg -y
```

## 📂 Project Structure

```bash
crawl-video/
├── crawler.js        # Main crawler (Node.js + Playwright)
├── downloader.js     # Helper module for downloading videos
├── analyze.py        # Python script for HTML analysis with Crawl4AI
├── package.json
├── downloads/        # Downloaded videos are stored here
└── README.md
```

## 🚀 Usage

1. Find your Chrome user profile

Windows:
`C:\Users\<USERNAME>\AppData\Local\Google\Chrome\User Data\Default`
or `Profile 1`, `Profile 2`, etc.

Linux:
`~/.config/google-chrome/Default`

MacOS:
`~/Library/Application Support/Google/Chrome/Default`

Update the following line in crawler.js if you are not using Default:
```js
const profileDir = 'Default'; // change to "Profile 1" or another if needed
```

2. Start Chrome with remote debugging

Run this command in a terminal:
```bash
node start-chrome-debug.js --profile "Profile 2"
```

(Replace the path with your OS-specific Chrome profile path if necessary.)

This ensures Chrome runs with your existing user data (including login sessions).

3. Run the crawler

Pass the course (or target) URL:
```bash
node crawler.js https://globis.jp/courses/a6f72bce/
```
