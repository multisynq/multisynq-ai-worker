# Cloudflare AI Worker

This is a simple interface to Cloudflare's [AI workers](https://developers.cloudflare.com/workers-ai/) to be called directly from a Multisynq app. It is used, for example, in [Multisynq AI Chat](https://github.com/multisynq/multisynq-ai-chat/).

If you want to deploy this to your own Cloudflare account, there's two changes necessary:

* in [wrangler.toml](wrangler.toml) remove the `account_id` line (it will default to your own account)
* in [src/index.ts](src/index.ts) change `allowedHosts` to your own hosts (this is so nobody else can use your worker on their website)

Then deploy as described in [Cloudflare's docs](https://developers.cloudflare.com/workers-ai/get-started/workers-wrangler/).