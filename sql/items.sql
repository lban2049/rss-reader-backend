drop table if exists rss_subscribe_items;
CREATE TABLE rss_subscribe_items (
    id    INTEGER PRIMARY KEY autoincrement,
    author TEXT,
    content TEXT,
    guid TEXT,
    link TEXT,
    pubDate TEXT,
    title TEXT,
    isRead INTEGER,
    subscribeId INTEGER
);