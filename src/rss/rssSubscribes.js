import { getDB } from "../db";
import { getFeedData } from "../utils";
import { addRssItem } from "./rssItems";
import { DateTime } from 'luxon'

// 获取全部订阅
const getAllSubscribes = async () => {
  const db = getDB();
  const sql = 'SELECT * FROM rss_subscribes';
  const stmt = db.prepare(sql);
  return await stmt.all();
}

// 添加订阅
const addSubscribe = async (item) => {
  const db = getDB();

  // 添加前校验rsslink 是否已存在
  const { rssLink } = item;
  const sqlCheck = 'SELECT * FROM rss_subscribes WHERE rssLink = ?';
  const stmtCheck = db.prepare(sqlCheck).bind(rssLink);
  const result = await stmtCheck.all();
  if (result.results.length > 0) {
    return {
      success: false,
      msg: '该订阅已存在'
    }
  }

  const { link, title, imageUrl, description } = item;
  const sql = 'INSERT INTO rss_subscribes (title, link, rssLink, imageUrl, lastBuildDate, description, isFollow) VALUES (?, ?, ?, ?, ?, ?, 1)';
  const dbRes = await db.prepare(sql).bind(title, link, rssLink, imageUrl, DateTime.now().toISO(), description).run();

  try {
    if (!dbRes.success) {
      return dbRes;
    }
    // 新增成功，根据rssLink 获取订阅信息
    let newRss = await db.prepare(sqlCheck).bind(rssLink).all();
    if (newRss.results.length > 0) {
      newRss = newRss.results[0];
    } else {
      return dbRes;
    }

    // 获取订阅内容，首次订阅，插入前五条内容
    const items = await getRssItems(newRss);
    // 如果多于5条，取前五条
    if (items.length > 5) {
      items.splice(5);
    }

    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.subscribeId = newRss.id;
        item.author = item.author || newRss.title;
        await addRssItem(item);
      }
    }

  } catch (err) {
    console.log('err', err);
  }

  return dbRes;
}

// 获取rss订阅内容items，使用rss-parser 解析rssLink
const getRssItems = async (rss) => {
  const feed = await getFeedData(rss.rssLink);
  const items = feed.items;
  // feed 中的 author 存入 items
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    item.author = feed.author || '';
    item.pubDate = DateTime.fromJSDate(item.pubDate);
  }

  return items;
}

// 更新订阅处理时间为设置时间
const updateSubscribeLastBuildDate = async (subscribeId, lastBuildDate) => {
  const db = getDB();
  const sql = 'UPDATE rss_subscribes SET lastBuildDate = ? WHERE id = ?';
  return await db.prepare(sql).bind(lastBuildDate, subscribeId).run();
}

// 定时获取订阅信息
const updateSubscribeInfo = async (event, env, ctx) => {
  console.log('开始更新订阅')

  // 获取所有订阅
  const subscribes = (await getAllSubscribes()).results;

  // 遍历订阅，获取订阅内容
  for (let i = 0; i < subscribes.length; i++) {
    const subscribe = subscribes[i];
    subscribe.lastBuildDate = DateTime.fromISO(subscribe.lastBuildDate);
    const now = DateTime.now();

    // 获取订阅内容
    const items = await getRssItems(subscribe);
    console.log(`更新：${subscribe.title}，共${items.length}条`)
    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.subscribeId = subscribe.id;
        item.author = item.author || subscribe.title;
        
        // 判断item pubDate 是否小于 lastBuildDate，如果小于，跳出循环
        if (item.pubDate < subscribe.lastBuildDate) {
          await updateSubscribeLastBuildDate(subscribe.id, now.toISO());
          break;
        }

        await addRssItem(item);
      }
    }
  }

}

export {
  getAllSubscribes,
  addSubscribe,
  updateSubscribeInfo,
};