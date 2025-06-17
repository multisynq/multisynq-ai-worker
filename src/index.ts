import { validateRequest } from "./util";

const allowedHosts = [
	/^multisynq\.github\.io$/,
	/(^|.*\.)multisynq\.io$/,
];

function withCORS(response: Response, origin: string | null): Response {
	const newHeaders = new Headers(response.headers);
	newHeaders.set("Access-Control-Allow-Origin", origin || "null");
	newHeaders.set("Access-Control-Allow-Methods", "POST, OPTIONS");
	newHeaders.set("Access-Control-Allow-Headers", "Content-Type");
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders,
	});
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const origin = request.headers.get("Origin");

		if (!validateRequest(request, allowedHosts, true)) {
			return new Response("Forbidden", { status: 403 });
		}

		if (request.method === "OPTIONS") {
			return withCORS(new Response(null, { status: 204 }), origin);
		}

		if (request.method !== "POST") {
			return withCORS(new Response("Method Not Allowed", { status: 405 }), origin);
		}

		let body: {
			run: {
				model: keyof AiModels,
				options: Record<string, any>,
			}
		};

		try {
			body = await request.json();
			console.log("Parsed body:", body);
			if (!(typeof body?.run?.model === "string" && typeof body?.run?.options === "object")) {
				return withCORS(new Response("Missing arguments", { status: 400 }), origin);
			}
		} catch (error) {
			return withCORS(new Response("Invalid Request", { status: 400 }), origin);
		}

		const { model, options } = body.run;
		const response = await env.AI.run(model, options);

		// Only log usage if response is an object and has a usage property
		if (response && typeof response === "object" && "usage" in response && response.usage) {
			console.log("AI usage", response.usage);
		}

		// some models return images as a binary ReadableStream
		if (response instanceof ReadableStream) {
			return withCORS(new Response(response, {
				headers: {
					"Content-Type": "application/octet-stream",
				},
			}), origin);
		}

		return withCORS(new Response(JSON.stringify(response)), origin);
	},
} satisfies ExportedHandler<Env>;

