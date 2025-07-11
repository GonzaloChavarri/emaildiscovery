export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/check") {
      const domain = url.searchParams.get("domain");

      if (!domain) {
        return new Response(JSON.stringify({ error: "Missing domain" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      try {
        const dnsQuery = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=MX`, {
          headers: {
            Accept: "application/dns-json",
          },
        });

        const dnsResult = await dnsQuery.json();
        const answers = dnsResult.Answer || [];

        let provider = "Other";

        for (const answer of answers) {
          const exchange = answer.data.toLowerCase();

          if (exchange.includes("google.com")) {
            provider = "Google Workspace";
            break;
          } else if (exchange.includes("outlook.com") || exchange.includes("microsoft.com")) {
            provider = "Microsoft 365";
            break;
          }
        }

        return new Response(JSON.stringify({ domain, provider }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "DNS lookup failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
