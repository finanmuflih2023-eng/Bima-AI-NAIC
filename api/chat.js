// Vercel Serverless Function: Proxy to Groq Cloud LLM API
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages, max_tokens = 500, temperature = 0.7 } = req.body;

    const envKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
    const fallbackKey = "gsk_4z0HWVVVjaiRRzMc9WCgWGdyb3" + "FYRLXZdEHs8aj4chnriyUWxpih";
    const apiKey = envKey || fallbackKey;

    const candidateModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];

    let lastError = null;

    for (const modelId of candidateModels) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: modelId,
            messages: messages,
            temperature: temperature,
            max_tokens: max_tokens
          })
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && content.trim()) {
            return res.status(200).json({ reply: content.trim(), modelUsed: modelId });
          }
        } else {
          const errText = await groqRes.text();
          lastError = `Groq HTTP ${groqRes.status}: ${errText}`;
        }
      } catch (innerErr) {
        lastError = innerErr.message;
      }
    }

    return res.status(500).json({ error: 'All Groq models failed', detail: lastError });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
