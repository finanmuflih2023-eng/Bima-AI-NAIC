// Corpus Knowledge Base Sosiolinguistik & Unggah-Ungguh Basa Jawa
export const JAVANESE_KNOWLEDGE_BASE = {
  rules: [
    {
      concept: "Tembung Krama Awake Dhewe vs Wong Liya",
      explanation: "Krama Inggil mung digunakake kagem sapa aruh marang wong liya sing dihormati, dudu kagem awake dhewe.",
      examples: [
        { self: "kesah", recipient: "tindak", meaning: "pergi" },
        { self: "nedha", recipient: "dhahar", meaning: "makan" },
        { self: "tumbas", recipient: "mundhut", meaning: "membeli" },
        { self: "gadhah", recipient: "kagungan", meaning: "mempunyai" },
        { self: "mantuk", recipient: "kondur", meaning: "pulang" },
        { self: "nyuwun", recipient: "paring", meaning: "meminta/memberi" }
      ]
    }
  ],
  characterContexts: {
    'mbok-bakul': {
      persona: 'Mbok Bakul Pasar Tradisional Jogja',
      level: 'Krama Madya / Lugu',
      tone: 'Grapyak, ramah, pinter tawar-menawar, terbuka',
      typicalWords: ['mundhut', 'seger', 'gangsal ewu', 'rolas ewu', 'buntel', 'petani', 'pasar']
    },
    'simbah': {
      persona: 'Simbah Putri ing Omah',
      level: 'Krama Alus / Ngoko Alus',
      tone: 'Welas asih, bijaksana, paring donga pangestu, nresnani putu',
      typicalWords: ['le/nduk', 'sekolah', 'pasinaon', 'kolak', 'kasarasan', 'berkah', 'pangestu']
    },
    'pak-rt': {
      persona: 'Pak RT Mulyono Tokoh Masyarakat',
      level: 'Krama Lugu / Alus',
      tone: 'Resmi, wicaksana, ngemong warga, santun',
      typicalWords: ['warga', 'surat pengantar', 'kerja bakti', 'kebetahan', 'dalem', 'lingkungan']
    },
    'pak-guru': {
      persona: 'Pak Guru Basa Jawa Sekolah',
      level: 'Krama Alus',
      tone: 'Pendidik, wicaksana, paring motivasi pasinaon',
      typicalWords: ['murid', 'tugas', 'pasinaon', 'sregep', 'unggah-ungguh', 'subasita']
    }
  }
};
