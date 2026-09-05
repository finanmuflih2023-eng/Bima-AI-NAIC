// Corpus Knowledge Base Sosiolinguistik & Unggah-Ungguh Basa Jawa
export const JAVANESE_KNOWLEDGE_BASE = {
  // Aturan Unggah-Ungguh & Deteksi Kata Salah (Ngoko vs Krama vs Inggil awake dhewe)
  ngokoToKramaDictionary: {
    'aku': { krama: 'kula', type: 'ngoko', reason: 'Ganti "aku" nganggo "kula" kanggo ragam Krama.' },
    'kowe': { krama: 'panjenengan / sampeyan', type: 'ngoko', reason: 'Ganti "kowe" nganggo "panjenengan" utawa "sampeyan".' },
    'arep': { krama: 'badhe', type: 'ngoko', reason: 'Tembung "arep" iku Ngoko, ing Krama dadi "badhe".' },
    'tuku': { krama: 'tumbas / mundhut', type: 'ngoko', reason: 'Tembung "tuku" iku Ngoko, gunakake "tumbas" (awake dhewe) utawi "mundhut" (tiyang sanes).' },
    'mangan': { krama: 'nedha / dhahar', type: 'ngoko', reason: 'Tembung "mangan" iku Ngoko, gunakake "nedha" (awake dhewe) utawi "dhahar" (tiyang sanes).' },
    'dolan': { krama: 'kesah / tindak', type: 'ngoko', reason: 'Tembung "dolan" iku Ngoko.' },
    'omah': { krama: 'griya / dalem', type: 'ngoko', reason: 'Tembung "omah" iku Ngoko.' },
    'piye': { krama: 'pripun / kadospundi', type: 'ngoko', reason: 'Tembung "piye" iku Ngoko, gunakake "pripun" utawi "kadospundi".' },
    'pira': { krama: 'pinten', type: 'ngoko', reason: 'Tembung "pira" iku Ngoko, gunakake "pinten".' },
    'piro': { krama: 'pinten', type: 'ngoko', reason: 'Tembung "piro" iku Ngoko, gunakake "pinten".' },
    'niki': { krama: 'puniki', type: 'ngoko', reason: 'Tembung "niki" iku Ngoko Lugu, gunakake "puniki" ing Krama.' },
    'nomer': { krama: 'nomer / angka', type: 'ngoko', reason: 'Gaya penulisan kurang santun.' },
    'regane': { krama: 'reganipun', type: 'ngoko', reason: 'Akhiran "-ne" iku Ngoko, gunakake "-nipun" dadi "reganipun".' },
    'kabare': { krama: 'kabaripun', type: 'ngoko', reason: 'Akhiran "-ne/-re" iku Ngoko.' },
    'karo': { krama: 'kaliyan', type: 'ngoko', reason: 'Tembung "karo" iku Ngoko, gunakake "kaliyan".' },
    'nanging': { krama: 'nanging / ananging', type: 'ngoko', reason: 'Gunakake tembung krama ingkang trep.' },
    'kok': { krama: 'kok / kenging menapa', type: 'ngoko', reason: 'Partikel "kok" kurang trep ing konteks resmi.' },
    'ngoten': { krama: 'ngaten / kados mekaten', type: 'ngoko', reason: 'Pocapan "ngoten" dadi "ngaten" utawa "kados mekaten".' },
    'nyeukwun': { krama: 'nyuwun', type: 'typo', reason: 'Salah ketik (typo), ingkang bener "nyuwun".' },
    'pirso': { krama: 'pirsa / pirsa', type: 'typo', reason: 'Pocapan konsonan pungkasan "pirsa".' }
  },

  // Deteksi Salah Kaprah Krama Inggil untuk Diri Sendiri (Self Misuse)
  selfInggilMisuse: {
    'tindak': { correct: 'kesah', reason: 'Tembung "tindak" iku Krama Inggil kagem tiyang sanes. Kanggo awake dhewe nggunakake "kesah".' },
    'dhahar': { correct: 'nedha', reason: 'Tembung "dhahar" iku Krama Inggil kagem tiyang sanes. Kanggo awake dhewe nggunakake "nedha".' },
    'paring': { correct: 'nyuwun / maringi', reason: 'Tembung "paring" iku Krama Inggil kagem tiyang sanes.' },
    'mundhut': { correct: 'tumbas', reason: 'Menawi awake dhewe ingkang tumbas, nggunakake "tumbas", sanes "mundhut".' },
    'kagungan': { correct: 'gadhah', reason: 'Tembung "kagungan" iku Krama Inggil. Kanggo awake dhewe nggunakake "gadhah".' },
    'kondur': { correct: 'mantuk', reason: 'Tembung "kondur" iku Krama Inggil. Kanggo awake dhewe nggunakake "mantuk".' },
    'rawuh': { correct: 'dhateng / dumugi', reason: 'Tembung "rawuh" iku Krama Inggil kagem tiyang sanes.' }
  },

  characterContexts: {
    'mbok-bakul': {
      persona: 'Mbok Bakul Pasar Tradisional Jogja',
      level: 'Krama Madya / Lugu',
      tone: 'Grapyak, ramah, humoris, pinter tawar-menawar, dinamis',
      variationsInstruction: 'Berikan jawaban dialog yang bervariasi, ramah, dan interaktif. Jika pembeli menawar atau menanyakan barang, berikan tanggapan yang spesifik dengan harga, kondisi barang seger dari petani, atau saran bumbu/sayur lain.'
    },
    'simbah': {
      persona: 'Simbah Putri ing Omah',
      level: 'Krama Alus / Ngoko Alus',
      tone: 'Welas asih, bijaksana, hangat, paring donga pangestu, nresnani putu',
      variationsInstruction: 'Berikan tanggapan yang hangat, penuh perhatian seperti seorang nenek penyayang. Tanyakan kabar sekolah, beri nasihat etika Jawa, atau tawarkan jajanan/makanan rumah.'
    },
    'pak-rt': {
      persona: 'Pak RT Mulyono Tokoh Masyarakat',
      level: 'Krama Lugu / Alus',
      tone: 'Resmi, wicaksana, ngemong warga, santun, lugas',
      variationsInstruction: 'Berikan jawaban sebagai ketua RT yang mengayomi warga. Tanggapi surat pengantar, jadwal kerja bakti, atau informasi lingkungan desa dengan bahasa Krama santun.'
    },
    'pak-guru': {
      persona: 'Pak Guru Basa Jawa Sekolah',
      level: 'Krama Alus',
      tone: 'Pendidik, wicaksana, paring motivasi pasinaon, komunikatif',
      variationsInstruction: 'Berikan tanggapan mendidik, beri dorongan semangat belajar Basa Jawa, dan ajak siswa mempraktikkan unggah-ungguh wicara.'
    }
  }
};
