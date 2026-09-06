// BIMA Interactive Documentation Scripts

document.addEventListener('DOMContentLoaded', () => {
  // 1. Copy to Clipboard Functionality
  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const codeId = btn.getAttribute('data-code');
      const codeElement = document.getElementById(codeId);
      if (codeElement) {
        const textToCopy = codeElement.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = btn.innerText;
          btn.innerText = 'Tersalin! ✓';
          btn.style.background = '#10B981';
          setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '';
          }, 2000);
        }).catch(err => {
          console.error('Gagal menyalin:', err);
        });
      }
    });
  });

  // 2. Interactive Pronunciation Simulator Demo
  const simMicBtn = document.getElementById('sim-mic-btn');
  const simStatus = document.getElementById('sim-status');
  const simWaveform = document.getElementById('sim-waveform');
  const simResult = document.getElementById('sim-result');
  const simCorrectionBox = document.getElementById('sim-correction-box');

  if (simMicBtn) {
    let isSimulating = false;
    simMicBtn.addEventListener('click', () => {
      if (isSimulating) return;
      isSimulating = true;

      // Phase 1: Recording simulation
      simMicBtn.style.background = '#DC2626';
      simMicBtn.innerHTML = '<span>🔴</span> Mendengarkan Suara Siswa...';
      simStatus.innerText = 'Audio Streaming: 16kHz WAV ke Whisper AI STT Engine...';
      simWaveform.style.display = 'block';
      simResult.style.display = 'none';
      if (simCorrectionBox) simCorrectionBox.style.display = 'none';

      // Phase 2: Processing simulation (after 1.8s)
      setTimeout(() => {
        simStatus.innerText = 'LangGraph & Whisper STT sedang memproses analisis fonetik & unggah-ungguh...';
        simMicBtn.innerHTML = '<span>⚡</span> Memproses Umpan Balik (3 Detik)...';
        simMicBtn.style.background = '#D97706';
      }, 1800);

      // Phase 3: Instant Feedback Result (after 3.2s)
      setTimeout(() => {
        isSimulating = false;
        simMicBtn.style.background = '';
        simMicBtn.innerHTML = '<span>🎙️</span> Mulai Tes Simulasi Pelafalan Lisan';
        simStatus.innerText = 'Analisis Selesai dalam 2.8 detik! Akurasi Krama: 85%';
        simWaveform.style.display = 'none';
        simResult.style.display = 'block';
      }, 3200);
    });
  }

  // Interactive Red word click handler
  const redWord = document.getElementById('interactive-red-word');
  if (redWord && simCorrectionBox) {
    redWord.addEventListener('click', () => {
      simCorrectionBox.style.display = 'block';
      simCorrectionBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
});
