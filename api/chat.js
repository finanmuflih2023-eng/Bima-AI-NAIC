import { JAVANESE_KNOWLEDGE_BASE } from './knowledge.js';

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
    const { messages = [], characterId = 'mbok-bakul', max_tokens = 600, temperature = 0.7 } = req.body;

    const charConfig = JAVANESE_KNOWLEDGE_BASE.characterContexts[characterId] || JAVANESE_KNOWLEDGE_BASE.characterContexts['mbok-bakul'];

    // 1. STAGE 1 & 2: RAG Context & Knowledge Injection
    const ragPrompt = `Anda adalah Engine AI Orchestrator Pembelajaran Basa Jawa Sosiokultural BIMA AI.
Peran Anda: ${charConfig.persona}
Ragam Basa: ${charConfig.level}
Nada Bicara: ${charConfig.tone}

ATURAN RAG UNGGAH-UNGGUH:
- Krama Inggil kagem tiyang sanes (umpama: tindak, dhahar, paring, mundhut, kondur).
- Kanggo awake dhewe (siswa) nggunakake Krama Lugu/Madyo (umpama: kesah, nedha, nyuwun, tumbas, mantuk).

TUGAS ANDA:
1. Pahami niat/intent percakapan siswa secara kontekstual (bukan sekadar keyword matching).
2. Balas ucapan siswa sebagai ${charConfig.persona} dalam Basa Jawa Krama yang alami, fleksibel, dan relevan (1-3 kalimat).
3. Berikan evaluasi ringkas etika/unggah-ungguh siswa.

Format JSON Wajib:
{
  "reply": "Teks balasan Basa Jawa Krama...",
  "intent": "nama_intent",
  "speech_level": "${charConfig.level}",
  "feedback": "Evaluasi ringkas unggah-ungguh Basa Jawa siswa"
}`;

    const envKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
    const fallbackKey = "gsk_4z0HWVVVjaiRRzMc9WCgWGdyb3" + "FYRLXZdEHs8aj4chnriyUWxpih";
    const apiKey = envKey || fallbackKey;

    const candidateModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];

    const promptMessages = [
      { role: 'system', content: ragPrompt },
      ...messages.slice(-6).map(m => ({
        role: m.role === 'student' || m.sender === 'student' ? 'user' : 'assistant',
        content: m.content || m.text
      }))
    ];

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
            messages: promptMessages,
            temperature: temperature,
            max_tokens: max_tokens
          })
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const rawContent = data.choices?.[0]?.message?.content;
          if (rawContent && rawContent.trim()) {
            let replyText = rawContent.trim();
            let feedbackText = null;
            let detectedIntent = 'dialogue';

            // Extract JSON response if returned
            try {
              const cleanJsonStr = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleanJsonStr);
              if (parsed.reply) {
                replyText = parsed.reply;
                feedbackText = parsed.feedback || null;
                detectedIntent = parsed.intent || 'dialogue';
              }
            } catch (e) {
              // Raw text response fallback
            }

            return res.status(200).json({ 
              reply: replyText,
              feedback: feedbackText,
              intent: detectedIntent,
              speechLevel: charConfig.level,
              modelUsed: modelId 
            });
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
