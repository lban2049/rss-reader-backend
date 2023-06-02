let rssdb = null;

const initDB = (db) => {
  rssdb = db;
  console.log('setdb', rssdb)
}

const getDB = () => {
  console.log('getdb', rssdb)
  return rssdb;
}

export {
  initDB,
  getDB
};
