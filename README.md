## Cloudflare workers

* Every push to the `master` branch deploys the dashboard to the staging environment at https://evm-ui.agorafi.co

To define env vars:
- Runtime env vars, are defined using the [wrangler.toml](wrangler.toml) file
- Runtime secrets are defined per env using [Pulumi apps/workers](https://github.com/amphora-atlas/infra/blob/main/apps/cloudflare/workers) secrets.
- Build time variables (typically `NEXT_PUBLIC` vars that are baked into the assets) are defined using the `.env.staging.worker` file

### Run Cloudflare Workers build locally

You can run the same build locally using a Workers simulator, run:

```bash
cp .env.local .dev.vars
pnpm preview:worker
```
