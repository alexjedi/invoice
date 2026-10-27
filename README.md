# Invoice

A free, minimal invoice generator. Fill in the form, save a clean A4 PDF.

Nothing is saved — no accounts, no server, no browser storage. Close the tab and it's gone.

**[invoice.alexvoid.com](https://invoice.alexvoid.com)**

## Run it yourself

```sh
pnpm install
pnpm dev
```

Open http://localhost:5173. To build a static site: `pnpm build` (output in `dist/`, host it anywhere).

## Fill it with an AI agent

Ask any agent to read [`/llms.txt`](public/llms.txt) and give you a prefilled link, for example:

```
/#to.name=Acme+Inc&item=Design+work|80|hours|70&currency=EUR&tax=VAT:23
```

## Deploy to Cloudflare

```sh
cp .env.example .env   # add your Cloudflare token and account id
set -a; source .env; set +a
pnpm deploy
```

Change the domain in `wrangler.jsonc` first.

## License

MIT
