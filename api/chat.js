import { JAVANESE_KNOWLEDGE_BASE } from './knowledge.js';

// Helper: Evaluasi kata demi kata pesan siswa untuk deteksi kata Ngoko / Salah Kaprah Krama Inggil
function evaluateStudentMessageWords(text) {
  if (!text || typeof text !== 'string') return [];

  const rawWords = text.trim().split(/\s+/);
  const { ngokoToKramaDictionary, selfInggilMisuse } = JAVANESE_KNOWLEDGE_BASE;

  let isPreviousWordKula = false;

  return rawWords.map((w) => {
    const cleanWord = w.toLowerCase().replace(/[^a-z=]/g, '');
    let isCorrect = true;
    let correction = null;
    let reason = null;

    // 1. Cek Ngoko / Typo Dictionary
    if (ngokoToKramaDictionary[cleanWord]) {
      isCorrect = false;
      correction = ngokoToKramaDictionary[cleanWord].krama;
      reason = ngokoToKramaDictionary[cleanWord].reason;
    } 
    // 2. Cek Salah Kaprah Krama Inggil untuk Diri Sendiri (misal: kula badhe tindak / kula badhe dhahar)
    else if (selfInggilMisuse[cleanWord] && (isPreviousWordKula || text.toLowerCase().includes('kula') || text.toLowerCase().includes('kulo'))) {
      isCorrect = false;
      correction = selfInggilMisuse[cleanWord].correct;
      reason = selfInggilMisuse[cleanWord].reason;
    }

    if (cleanWord === 'kula' || cleanWord === 'kulo') {
      isPreviousWordKula = true;
    } else {
      isPreviousWordKula = false;
    }

    return {
      word: w,
      cleanWord,
      isCorrect,
      correction,
      reason
    };
  });
}

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
    const { messages = [], characterId = 'mbok-bakul', max_tokens = 600, temperature = 0.85 } = req.body;

    const charConfig = JAVANESE_KNOWLEDGE_BASE.characterContexts[characterId] || JAVANESE_KNOWLEDGE_BASE.characterContexts['mbok-bakul'];

    // Ambil pesan terakhir siswa
    const lastStudentMsgObj = [...messages].reverse().find(m => m.role === 'student' || m.sender === 'student');
    const lastStudentText = lastStudentMsgObj ? (lastStudentMsgObj.content || lastStudentMsgObj.text || '') : '';

    // Lakukan evaluasi kata demi kata untuk penandaan teks merah
    const evaluatedWords = evaluateStudentMessageWords(lastStudentText);

    // RAG Prompt dengan Variasi Bahasa Tinggi (Temperature 0.85)
    const ragPrompt = `Anda adalah Engine AI Orchestrator Pembelajaran Basa Jawa Sosiokultural BIMA AI.
Persona Karakter: ${charConfig.persona}
Ragam Basa: ${charConfig.level}
Nada Bicara: ${charConfig.tone}
Instruksi Variasi Balasan: ${charConfig.variationsInstruction}

ATURAN RAG UNGGAH-UNGGUH:
- Gunakan bahasa Jawa Krama yang SANGAT BERVARIASI, hidup, kreatif, ramah, dan alami. Jangan mengulang-ulang kalimat template yang sama.
- Krama Inggil kagem tiyang sanes (umpama: tindak, dhahar, paring, mundhut, kondur).
- Kanggo awake dhewe (siswa) nggunakake Krama Lugu/Madyo (umpama: kesah, nedha, nyuwun, tumbas, mantuk).

TUGAS ANDA:
1. Pahami niat/intent percakapan siswa secara kontekstual dan spesifik.
2. Balas ucapan siswa sebagai ${charConfig.persona} dalam Basa Jawa Krama yang alami, ekspresif, dan bervariasi (1-3 kalimat). Berikan detail nyata (umpama sebutkan harga, jenis barang seger, tawaran bumbu, saran menu, utawi donga pangestu).
3. Berikan evaluasi ringkas etika/unggah-ungguh siswa.

Format JSON Wajib:
{
  "reply": "Teks balasan Basa Jawa Krama bervariasi...",
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
            temperature: 0.85,
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

            try {
              const cleanJsonStr = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleanJsonStr);
              if (parsed.reply) {
                replyText = parsed.reply;
                feedbackText = parsed.feedback || null;
                detectedIntent = parsed.intent || 'dialogue';
              }
            } catch (e) {
              // Raw text fallback
            }

            return res.status(200).json({ 
              reply: replyText,
              evaluatedWords: evaluatedWords,
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

    return res.status(500).json({ 
      error: 'All Groq models failed', 
      evaluatedWords: evaluatedWords, 
      detail: lastError 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
