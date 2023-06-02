drop table if exists rss_subscribes;
CREATE TABLE rss_subscribes (
    id    INTEGER PRIMARY KEY autoincrement,
    title TEXT,
    description TEXT,
    link TEXT,
    rssLink TEXT,
    imageUrl TEXT,
    lastBuildDate TEXT,
    isFollow INTEGER
);