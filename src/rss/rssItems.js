import { getDB } from "../db";

// 新增内容
const addRssItem = async (item) => {
  const db = getDB();

  console.log('item', JSON.stringify(item));
  const { author, description, id, link, pubDate, title, subscribeId } = item;
  const sql = 'INSERT INTO rss_subscribe_items (author, content, guid, link, pubDate, title, isRead, subscribeId) VALUES (? ,?, ?, ?, ?, ?, ?, ?)';
  return await db.prepare(sql).bind( author, description, id, link, pubDate.toISO(), title, 0, subscribeId ).run();
}

// 查询内容，支持查询条件isRead，按pubDate倒序，分页参数，lastDate, pageSize
const queryRssItems = async (subscribeId, isRead, lastDate, pageSize) => {
  const db = getDB();
  let sql = 'SELECT * FROM rss_subscribe_items WHERE 1=1 ';
  if (subscribeId !== undefined) {
    sql += ' AND subscribeId = ?';
  }

  if (isRead !== undefined) {
    sql += ' AND isRead = ?';
  }

  if (lastDate !== undefined) {
    sql += ' AND pubDate < ?';
  }

  sql += ' ORDER BY pubDate DESC';
  sql += ' LIMIT ?';

  if (pageSize === undefined) {
    pageSize = 10;
  }

  const stmt = db.prepare(sql);

  // 根据参数是否传递，按组合绑定参数
  if (subscribeId !== undefined && isRead !== undefined && lastDate !== undefined) {
    return await stmt.bind(subscribeId, isRead, lastDate, pageSize).all();
  } else if (subscribeId !== undefined && isRead !== undefined) {
    return await stmt.bind(subscribeId, isRead, pageSize).all();
  } else if (subscribeId !== undefined && lastDate !== undefined) {
    return await stmt.bind(subscribeId, lastDate, pageSize).all();
  } else if (isRead !== undefined && lastDate !== undefined) {
    return await stmt.bind(isRead, lastDate, pageSize).all();
  } else if (subscribeId !== undefined) {
    return await stmt.bind(subscribeId, pageSize).all();
  } else if (isRead !== undefined) {
    return await stmt.bind(isRead, pageSize).all();
  } else if (lastDate !== undefined) {
    return await stmt.bind(lastDate, pageSize).all();
  } else {
    return await stmt.bind(pageSize).all();
  }
}

// 修改内容为已读
const updateRssItemRead = async (id) => {
  const db = getDB();
  const sql = 'UPDATE rss_subscribe_items SET isRead = 1 WHERE id = ?';
  return await db.prepare(sql).bind(id).run();
}

export {
  addRssItem,
  queryRssItems,
  updateRssItemRead,
}