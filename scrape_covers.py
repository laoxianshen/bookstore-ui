"""
爬取豆瓣图书 Top250 封面图片
- 来源：https://book.douban.com/top250
- 最多 50 张
- 保存到 ./picture/ 目录
- 输出 books.json 映射表（书名 → 图片文件名、豆瓣链接）
"""

import urllib.request
import urllib.error
import re
import os
import json
import time

PICTURE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "picture")
MAX_IMAGES = 50
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

IMG_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://book.douban.com/",  # 豆瓣防盗链必须加 Referer
}

os.makedirs(PICTURE_DIR, exist_ok=True)

books = []
downloaded = 0


def fetch_page(url):
    """请求页面，返回 HTML 文本"""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"  [ERROR] 请求失败: {url} → {e}")
        return ""


def download_image(img_url, filename):
    """下载单张封面，保存为 filename"""
    path = os.path.join(PICTURE_DIR, filename)
    if os.path.exists(path):
        print(f"  [SKIP] 已存在: {filename}")
        return True

    req = urllib.request.Request(img_url, headers=IMG_HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if len(data) < 500:  # 太小不是真实图片
                return False
        with open(path, "wb") as f:
            f.write(data)
        print(f"  [OK] {filename} ({len(data)} bytes)")
        return True
    except Exception as e:
        print(f"  [FAIL] {img_url[:60]}... → {e}")
        return False


def parse_top250(html):
    """从豆瓣 Top250 页面提取书名和封面"""
    results = []

    # 每条记录在 <tr class="item"> 中
    items = re.findall(r'<tr class="item">(.*?)</tr>', html, re.DOTALL)
    print(f"  找到 {len(items)} 条图书记录")

    for item in items:
        # 封面图片 URL（src 属性，找 jpg/webp 的）
        img_match = re.search(r'<img[^>]*src="([^"]*\.(?:jpg|jpeg|png|webp))"', item, re.IGNORECASE)
        # 书名（在 <a title="书名" 或 <img alt="书名" 中）
        title_match = re.search(r'title="([^"]+)"', item)
        if not title_match:
            # 尝试从 img alt 获取
            title_match = re.search(r'alt="([^"]+)"', item)

        # 豆瓣详情链接
        link_match = re.search(r'<a\s+href="(https://book\.douban\.com/subject/\d+/)"', item)

        if img_match and title_match:
            title = title_match.group(1).strip()
            img_url = img_match.group(1).strip()
            link = link_match.group(1).strip() if link_match else ""

            # 跳过默认占位图
            if "default" in img_url.lower() or "nopic" in img_url.lower():
                continue

            # 将小图 /s/public/ 替换为大图 /l/public/
            img_url = img_url.replace("/s/public/", "/l/public/")

            results.append({"title": title, "img_url": img_url, "link": link})

    return results


# ---- 主流程 ----

print("=" * 60)
print("豆瓣图书封面爬虫")
print("=" * 60)

for page_num in [0, 25]:  # page 1 (start=0), page 2 (start=25)
    if downloaded >= MAX_IMAGES:
        break

    url = f"https://book.douban.com/top250?start={page_num}"
    print(f"\n>>> 请求页面: {url}")
    html = fetch_page(url)

    if not html:
        print("  跳过（请求失败）")
        continue

    items = parse_top250(html)
    for b in items:
        if downloaded >= MAX_IMAGES:
            break

        # 生成文件名：清理标题，保留中文/英文/数字
        safe_title = re.sub(r'[\\/*?:"<>|\s]', '_', b["title"])
        safe_title = re.sub(r'_+', '_', safe_title)[:40]
        ext = b["img_url"].rsplit(".", 1)[-1].split("?")[0]
        if ext not in ("jpg", "jpeg", "png", "webp"):
            ext = "jpg"
        filename = f"{downloaded+1:02d}_{safe_title}.{ext}"

        print(f"\n  [{downloaded+1}/{MAX_IMAGES}] {b['title']}")
        print(f"  封面: {b['img_url'][:80]}...")
        print(f"  豆瓣: {b['link']}")

        ok = download_image(b["img_url"], filename)
        if ok:
            books.append({
                "title": b["title"],
                "filename": filename,
                "douban_url": b["link"],
                "img_url": b["img_url"],
            })
            downloaded += 1
            time.sleep(0.3)  # 温和间隔，避免被 ban

# ---- 输出结果 ----
print("\n" + "=" * 60)
print(f"完成！共下载 {downloaded} 张封面")
print(f"图片目录: {PICTURE_DIR}")
print(f"图书列表: books.json")
print("=" * 60)

# 写入 books.json 映射表
json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "books.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(books, f, ensure_ascii=False, indent=2)
print(f"JSON 已写入: {json_path}")
