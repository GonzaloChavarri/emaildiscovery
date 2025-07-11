# Email Provider Checker (Cloudflare Worker)

This Cloudflare Worker lets users enter a domain (e.g. `example.com`) and check whether it's using:

- Google Workspace
- Microsoft 365
- Or another email provider

## How it Works

It uses Cloudflare's public DNS-over-HTTPS API to look up MX records and identify the provider.

## Deployment

1. Clone this repo
2. Install Wrangler: `npm install -g wrangler`
3. Update `wrangler.toml` with your `account_id`
4. Deploy: `wrangler publish`

## Usage

Open the deployed site and enter a domain like `domain.com` — the page will tell you what email provider it uses.
