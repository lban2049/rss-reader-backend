import { parseFeed } from "htmlparser2";

// 获取rss订阅内容
async function getFeedData(rssLink) {
  const res = await fetch(rssLink);

  if (!res.ok) {
    return null;
  }

  const htmlString = await res.text()
  const feed = parseFeed(htmlString)
  if (!feed) {
    return null
  }

  return feed;
}

export {
  getFeedData
}