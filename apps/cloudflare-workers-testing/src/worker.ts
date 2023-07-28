import { sendNotification } from 'web-push-notification';

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// get subscription from somewhere. Most likely a DB like Postgres.
		const pushSubscription = {
			endpoint:
				'https://fcm.googleapis.com/fcm/send/fy2hK-ceglQ:APA91bFsj9NNwriJv6X63RvPfCSrToogNFkycIuk9r1xkCZgZTyJgxm4zGqqzPFYprJiJks3YSRxVu9QD0gUDHMjoil3XTEOpR7xQ-wSZ7u27A5H3w178vN2F_UwH8yIuyOo8igQNIs1',
			expirationTime: null,
			keys: {
				p256dh: 'BOeZPXXropUz0ZAxqCsRFWpDp4VeV4tZiwBiCUOflabc7ggKVrlNcJ7awKHtU8o8WsTodc9afmLDhLQS-yAQHFI',
				auth: 'bi4XGrVWr0sTM1m_2FGJsA',
			},
		};

		// create notification information
		const notification = {
			text: '....',
		};

		// your Vapid Details from Step 1
		const vapidDetails = {
			subject: 'mailto:example@yourdomain.com',
			publicKey: 'BC5koZoTOHO9_M818EO3AgJDSMM16GoecgTAKeBk4dAH0q8X2Kao8hh5o0ycK2_t3vu3cBWm-p2f6fUX_BIhb-E',
			privateKey: 's3R9JPNveMo6SMY5BQn23jJNlUwKeinGYE1EM2Rw2WQ',
		};

		const something = await sendNotification(notification.text, pushSubscription, vapidDetails);

		return new Response(JSON.stringify(something));
	},
};
