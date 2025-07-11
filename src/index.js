export default {
  async fetch(request) {
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

    // Inline the HTML to avoid asset serving issues
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Provider Checker</title>
  <style>
    body {
      font-family: sans-serif;
      background-color: #f3f4f6;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    input {
      padding: 0.5rem;
      width: 250px;
      margin-bottom: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      padding: 0.5rem 1rem;
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .result {
      margin-top: 1rem;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>Email Provider Checker</h1>
  <input type="text" id="domainInput" placeholder="Enter domain (e.g. domain.com)" />
  <button onclick="checkProvider()">Check Provider</button>
  <div class="result" id="result"></div>

  <script>
    async function checkProvider() {
      const domain = document.getElementById("domainInput").value.trim();
      const resultEl = document.getElementById("result");

      resultEl.textContent = "Checking...";
      try {
        const res = await fetch(\`/check?domain=\${domain}\`);
        const data = await res.json();
        if (data.provider) {
          resultEl.textContent = \`Provider: \${data.provider}\`;
        } else {
          resultEl.textContent = "Error: " + (data.error || "Unknown error");
        }
      } catch (err) {
        resultEl.textContent = "Request failed. Please try again.";
      }
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  },
};
