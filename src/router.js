import { Router } from 'itty-router';
import { getAllSubscribes, addSubscribe } from './rss/rssSubscribes';
import { dbResult, ok } from './result';
import { queryRssItems, updateRssItemRead } from './rss/rssItems';

// now let's create a router (note the lack of "new")
const router = Router();

// 查询全部订阅
router.get('/api/subscriptions/all', async () => {
	const subscribes = await getAllSubscribes();
	return dbResult(subscribes);
});

// 新增订阅
router.post('/api/subscriptions/add', async (request) => {
	const content = await request.json();
	const result = await addSubscribe(content);

	return dbResult(result);
});

// 查询订阅内容
router.get('/api/subscriptions/items', async (request) => {
	const { subscribeId, isRead, lastDate, pageSize } = request.query;
	const items = await queryRssItems(subscribeId, isRead, lastDate, pageSize);
	return dbResult(items);
});

// 修改内容为已读
router.post('/api/subscriptions/items/read', async (request) => {
	const content = await request.json();
	const result = await updateRssItemRead(content.id);

	return dbResult(result);
});

// // GET collection index
// router.get('/api/todos', () => new Response('Todos Index!'));

// // GET item
// router.get('/api/todos/:id', ({ params }) => new Response(`Todo #${params.id}`));

// // POST to the collection (we'll use async here)
// router.post('/api/todos', async (request) => {
// 	const content = await request.json();

// 	return new Response('Creating Todo: ' + JSON.stringify(content));
// });

const handleOptions = (req) => new Response('',{
	headers: { 
		'content-type': 'application/json;charset=UTF-8',
		"Access-Control-Allow-Headers": "*"
	 },
});
router.routes.push(['OPTIONS', /(.*)/, [handleOptions]]);

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
