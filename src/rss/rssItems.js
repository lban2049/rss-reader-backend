import { getDB } from "../db";

// 新增内容
const addRssItem = async (item) => {
  const db = getDB();

  console.log('item', JSON.stringify(item));
  const { author, description, id, link, pubDate, title, subscribeId } = item;
  const sql = 'INSERT INTO rss_subscribe_items (author, content, guid, link, pubDate, title, isRead, subscribeId) VALUES (? ,?, ?, ?, ?, ?, ?, ?)';
  return await db.prepare(sql).bind( author, description, id, link, pubDate.toISO(), title, 0, subscribeId ).run();
}

export {
  addRssItem
}