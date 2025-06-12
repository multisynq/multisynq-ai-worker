import { validateRequest } from "./util";

const allowedHosts = [
	/^multisynq\.github\.io$/,
	/(^|.*\/\.)multisynq\.io$/,
];

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (!validateRequest(request, allowedHosts, true)) {
			return new Response("Forbidden", { status: 403 });
		}

		if (request.method !== "POST") {
			return new Response("Method Not Allowed", { status: 405 });
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
				return new Response("Missing arguments", { status: 400 });
			}
		} catch (error) {
			return new Response("Invalid Request", { status: 400 });
		}

		const { model, options } = body.run;
		const response = await env.AI.run(model, options);

		if (response.usage) console.log("AI usage", response.usage);

		return new Response(JSON.stringify(response));
	},
} satisfies ExportedHandler<Env>;

