/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import handleProxy from './proxy';
import handleRedirect from './redirect';
import apiRouter from './router';
import { initDB } from './db';
import { err } from './result';
import { updateSubscribeInfo } from './rss/rssSubscribes';

// Export a default object containing event handlers
export default {
	// The fetch handler is invoked when this worker receives a HTTP(S) request
	// and should return a Response (optionally wrapped in a Promise)
	async fetch(request, env, ctx) {
		// 保存DB实例
		console.log('env', env)
		initDB(env.RSSDB);

		// You'll find it helpful to parse the request.url string into a URL object. Learn more at https://developer.mozilla.org/en-US/docs/Web/API/URL
		const url = new URL(request.url);

		let res = null;

		// You can get pretty far with simple logic like if/switch-statements
		switch (url.pathname) {
			case '/redirect':
				res = await handleRedirect.fetch(request, env, ctx);

			case '/proxy':
				res = await handleProxy.fetch(request, env, ctx);
		}

		if (url.pathname.startsWith('/api/')) {
			// You can also use more robust routing
			try {
				res = await apiRouter.handle(request);
			} catch (error) {
				res = err(error.message);
			}
		}

		if (res == null) {

			res = new Response(
				`Try making requests to:
      <ul>
      <li><code><a href="/redirect?redirectUrl=https://example.com/">/redirect?redirectUrl=https://example.com/</a></code>,</li>
      <li><code><a href="/proxy?modify&proxyUrl=https://example.com/">/proxy?modify&proxyUrl=https://example.com/</a></code>, or</li>
      <li><code><a href="/api/todos">/api/todos</a></code></li>`,
				{ headers: { 'Content-Type': 'text/html' } }
			);
		}

		res.headers.set("Access-Control-Allow-Origin", request.headers.get("Origin"));

		return res;
	},
	// 定时任务，获取订阅内容
	async scheduled(event, env, ctx) {
		initDB(env.RSSDB);
		ctx.waitUntil(updateSubscribeInfo(event, env, ctx));
	},
};
