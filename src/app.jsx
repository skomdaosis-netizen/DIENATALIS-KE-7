import React, { useState, useRef, useCallback, useEffect } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';
import { Analytics } from '@vercel/analytics/react';
import './app.css';

// Frame twibbon (ada di folder public)
const FRAME_URL = "/frame-diesnatalis.png";
const LOGO_URL = "/logo-diesnatalis.png";

// Ukuran canvas mengikuti ukuran asli frame (1080 x 1440) supaya tidak gepeng
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1440;

// Batas zoom: min sangat kecil (bebas zoom out), max sangat besar
const MIN_SCALE = 0.05;
const MAX_SCALE = 10;

// Hitung initial scale supaya foto langsung "cover" canvas (tidak ada area kosong)
const calcInitialScale = (img) => {
  if (!img) return 1;
  const { width: iw, height: ih } = img;
  const scaleW = CANVAS_WIDTH / iw;
  const scaleH = CANVAS_HEIGHT / ih;
  // Ambil yang lebih besar agar foto cover seluruh canvas
  return Math.max(scaleW, scaleH);
};

// --- DATA LOMBA & CAPTION ---
const COMPETITIONS = [
  {
    id: 'nurfa',
    icon: '📖',
    name: 'NURFA',
    tagline: 'Musabaqah Tilawatil Qur\'an',
    text: `📖 LET YOUR VOICE LEAVE A TRACE. ✨\n🌙 NURFA 2026 🌙\n\nPerkenalkan Saya [Nama Lengkap] dari [Asal Sekolah], siap menjadi bagian dari NURFA 2026 dan melantunkan ayat suci Al-Qur'an dengan penuh penghayatan dan keindahan. 🤍\n\n✨ Mari jadikan setiap lantunan sebagai bagian dari perjalanan dan tinggalkan jejak kebaikan melalui setiap ayat yang dibaca.\n\n🏁 RUN YOUR RACE. 📖 LEAVE YOUR TRACE.\n\n#NURFA2026 #SkomdaDiesnatalis7 #RunTheRaceLeaveYourTrace #SMKTelkomSidoarjo`
  },
  {
    id: 'stellar',
    icon: '🧠',
    name: 'STELLAR',
    tagline: 'Olimpiade Matematika & IPA',
    text: `🧠 READY TO CHALLENGE YOUR MIND? 🌟\n\nHalo! Aku [Nama] dari [Sekolah/Instansi], dan aku siap mengikuti STELLAR — Olimpiade Matematika & IPA dalam rangka SKOMDA DIESNATALIS 7! Saatnya menguji pengetahuan, logika, dan kemampuan berpikirmu dalam menghadapi berbagai tantangan.\n\n⚡ Bersiap untuk bersaing, pecahkan setiap soal, dan tunjukkan kemampuan terbaikmu. Karena setiap tantangan adalah langkah untuk membuktikan seberapa jauh kamu bisa melangkah!\n\nThink. Solve. Shine. ✨\n\n🏁 Run Your Race, Leave Your Trace.\n\n#STELLAR #SkomdaDiesnatalis7 #RunTheRaceLeaveYourTrace #SMKTelkomSidoarjo`
  },
  {
    id: 'smc',
    icon: '🎮',
    name: 'SMC',
    tagline: 'Skomda Mobile Legend Competition S4',
    text: `🎮 I'M READY FOR SMC SEASON 4! 👋\n\nHalo! [Nama] dari [Asal Sekolah/Instansi], siap turun ke battlefield dan ikut meramaikan SMC — Skomda Mobile Legend Competition Season 4 dalam rangka SKOMDA DIESNATALIS 7! 🔥🏆\n\nEsport is our battlefield, teamwork is our weapon, and victory is the goal! 🔥\n\n🏁 RUN YOUR RACE. 🔥 LEAVE YOUR TRACE.\n\n#SMC #SkomdaMobileLegend #SkomdaDiesnatalis7 #RunYourRaceLeaveYourTrace #SMKTelkomSidoarjo`
  },
  {
    id: 'techup',
    icon: '💻',
    name: 'TECH UP',
    tagline: 'Olimpiade TIK',
    text: `💻 READY TO ENTER THE DIGITAL RACE? ⚡\n\nHalo! Aku [Nama] dari [Sekolah/Instansi], dan aku siap berkompetisi di TECH UP — Olimpiade TIK dalam rangka SKOMDA Dies Natalis 7! 🚀\n\nDunia digital terus berkembang, dan sekarang saatnya menguji seberapa jauh kemampuanmu. Tantang logikamu, perluas pengetahuanmu, dan tunjukkan kemampuanmu dalam menghadapi berbagai tantangan TIK!\n\n💡 Buktikan bahwa kamu bukan hanya mengikuti perkembangan teknologi, tapi juga siap menjadi bagian dari masa depannya.\n\nThink smart. Go beyond. Leave your trace. 🔥\n\n🏁 Run the Race, Leave Your Trace.\n\n#TechUp #OlimpiadeTIK #SkomdaDiesnatalis7 #RunTheRaceLeaveYourTrace #SMKTelkomSidoarjo`
  },
  {
    id: 'sync',
    icon: '🎬',
    name: 'SYNC',
    tagline: 'Skomda Youth Narative Cinema',
    text: `🎬 LIGHTS, CAMERA, LEAVE YOUR TRACE! ✨\n\nHalo! Aku [Nama] dari [Sekolah/Instansi], dan aku siap berkompetisi di SYNC — Skomda Youth Narative Cinema dalam rangka SKOMDA Dies Natalis 7! 🎞️\n\nSaatnya menuangkan ide dan cerita ke dalam gambar bergerak, mengasah kreativitas, dan menunjukkan sudut pandang lewat karya sinema terbaik!\n\n💡 Buktikan bahwa kamu siap menjadi bagian dari perjalanan ini.\n\nCreate boldly. Tell your story. Leave your trace. 🔥\n\n🏁 Run the Race, Leave Your Trace.\n\n#SYNC #SkomdaYouthNarativeCinema #SkomdaDiesnatalis7 #RunTheRaceLeaveYourTrace #SMKTelkomSidoarjo`
  },
];

// Ubah teks caption (dengan \n) menjadi elemen React yang rapi,
// serta menebalkan placeholder seperti [Nama Lengkap]
const renderCaption = (text) => {
  const paragraphs = text.split('\n\n');
  return paragraphs.map((para, pIdx) => {
    const lines = para.split('\n');
    return (
      <p key={pIdx} style={{ margin: '0 0 14px 0' }}>
        {lines.map((line, lIdx) => {
          const parts = line.split(/(\[[^\]]+\])/g);
          return (
            <React.Fragment key={lIdx}>
              {parts.map((part, i) =>
                part.startsWith('[') && part.endsWith(']')
                  ? <b key={i}>{part}</b>
                  : part
              )}
              {lIdx < lines.length - 1 && <br />}
            </React.Fragment>
          );
        })}
      </p>
    );
  });
};

const App = () => {
  // --- STATE ---
  const [selectedComp, setSelectedComp] = useState(null);
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [initialScale, setInitialScale] = useState(1); // dipakai tombol Reset
  const [rotate, setRotate] = useState(0);
  const [copySuccess, setCopySuccess] = useState("Salin Caption");
  const [uploadError, setUploadError] = useState("");
  const [toast, setToast] = useState(""); // notifikasi kecil (download berhasil, dll)
  const [showAdvanced, setShowAdvanced] = useState(false); // sembunyikan slider Putar by default
  const [resetKey, setResetKey] = useState(0); // dipakai untuk re-mount AvatarEditor saat Reset

  const editorRef = useRef(null);
  const lastPinchDist = useRef(null);
  const wrapperRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showToast = (msg, duration = 3000) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), duration);
  };

  // --- LOGIC DROPZONE ---
  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setUploadError("");

    if (fileRejections && fileRejections.length > 0) {
      const reason = fileRejections[0]?.errors?.[0]?.code;
      if (reason === 'file-too-large') {
        setUploadError("Ukuran file terlalu besar. Maksimal 15MB ya.");
      } else if (reason === 'file-invalid-type') {
        setUploadError("Format file tidak didukung. Gunakan JPG atau PNG.");
      } else {
        setUploadError("File tidak bisa dipakai, coba foto lain ya.");
      }
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const initScale = calcInitialScale(img);
        setScale(initScale);
        setInitialScale(initScale);
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        setUploadError("Foto gagal dibaca. Coba gunakan file JPG/PNG lain.");
        URL.revokeObjectURL(url);
      };
      img.src = url;
      setImage(file);
      setRotate(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 15 * 1024 * 1024, // 15MB
    multiple: false,
    noClick: !!image
  });

  // --- RESET POSISI & ZOOM (tanpa perlu upload ulang) ---
  const handleReset = () => {
    setScale(initialScale);
    setRotate(0);
    // react-avatar-editor tidak punya API reset posisi drag secara langsung,
    // jadi kita re-mount komponennya lewat key agar posisi geser ikut kembali ke tengah.
    setResetKey((k) => k + 1);
  };

  // --- LOGIC ZOOM (MOUSE SCROLL) ---
  // Dipasang manual lewat addEventListener (bukan prop onWheel React) karena
  // browser modern sering memasang wheel listener sebagai "passive" secara
  // default, sehingga e.preventDefault() gagal jalan (error di console &
  // halaman ikut ke-scroll, foto tidak zoom). Dengan { passive: false } di
  // bawah ini, preventDefault() bisa berjalan normal dan zoom scroll berfungsi.
  useEffect(() => {
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl || !image) return;

    const onWheel = (e) => {
      e.preventDefault();
      const zoomSensitivity = 0.08;
      // Scroll ke atas = zoom in, scroll ke bawah = zoom out
      const delta = e.deltaY > 0 ? -zoomSensitivity : zoomSensitivity;
      // Gunakan perkalian agar zoom terasa lebih natural di semua level
      const factor = 1 + delta;
      setScale((prevScale) => {
        return Math.min(Math.max(prevScale * factor, MIN_SCALE), MAX_SCALE);
      });
    };

    wrapperEl.addEventListener('wheel', onWheel, { passive: false });
    return () => wrapperEl.removeEventListener('wheel', onWheel);
  }, [image]);

  // --- LOGIC ZOOM (PINCH / CUBIT DI HP) ---
  const getDistance = (touch1, touch2) => {
    return Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY);
  };

  // Sama seperti wheel, touchmove untuk pinch-zoom juga dipasang manual
  // dengan { passive: false } supaya preventDefault() (mencegah halaman ikut
  // ter-zoom/scroll saat pinch di HP) benar-benar berfungsi.
  useEffect(() => {
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl || !image) return;

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        lastPinchDist.current = getDistance(e.touches[0], e.touches[1]);
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && lastPinchDist.current) {
        e.preventDefault();
        const dist = getDistance(e.touches[0], e.touches[1]);
        const zoomFactor = dist / lastPinchDist.current;
        setScale((prevScale) => Math.min(Math.max(prevScale * zoomFactor, MIN_SCALE), MAX_SCALE));
        lastPinchDist.current = dist;
      }
    };

    const onTouchEnd = () => {
      lastPinchDist.current = null;
    };

    wrapperEl.addEventListener('touchstart', onTouchStart, { passive: false });
    wrapperEl.addEventListener('touchmove', onTouchMove, { passive: false });
    wrapperEl.addEventListener('touchend', onTouchEnd);

    return () => {
      wrapperEl.removeEventListener('touchstart', onTouchStart);
      wrapperEl.removeEventListener('touchmove', onTouchMove);
      wrapperEl.removeEventListener('touchend', onTouchEnd);
    };
  }, [image]);

  // --- DOWNLOAD LOGIC ---
  const handleDownload = async () => {
    if (!editorRef.current) return;

    const canvas = editorRef.current.getImageScaledToCanvas();
    const ctx = canvas.getContext('2d');

    const frameImg = new Image();
    frameImg.src = FRAME_URL;
    frameImg.crossOrigin = "anonymous";

    frameImg.onload = () => {
      try {
        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `TWIBBON-DIESNATALIS-7-${activeComp.name}.png`;
        link.href = dataUrl;
        link.click();
        showToast("Berhasil diunduh! Cek folder Download kamu 📥");
      } catch (err) {
        showToast("Gagal mengunduh, coba lagi ya.");
      }
    };

    frameImg.onerror = () => {
      showToast("Gagal memuat frame, coba refresh halaman.");
    };
  };

  // --- CAPTION LOGIC (menyesuaikan lomba yang dipilih) ---
  const activeComp = COMPETITIONS.find(c => c.id === selectedComp) || COMPETITIONS[0];
  const captionText = activeComp.text;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setCopySuccess("Berhasil Disalin!");
      setTimeout(() => setCopySuccess("Salin Caption"), 3000);
    } catch (err) {
      setCopySuccess("Gagal Menyalin");
    }
  };

  // Konversi scale ke persentase untuk tampilan slider yang intuitif
  // Slider range: 0–100, di mana 50 = scale saat ini saat foto baru diupload
  // Kita pakai log scale agar slider terasa linear
  const scaleToSlider = (s) => {
    // Jaga-jaga: pastikan s tetap di dalam batas MIN/MAX supaya log() tidak
    // menghasilkan NaN/Infinity (misalnya kalau foto sangat kecil/besar).
    const clamped = Math.min(Math.max(s, MIN_SCALE), MAX_SCALE);
    // log scale: slider 0 = MIN_SCALE, slider 100 = MAX_SCALE
    return Math.round(
      ((Math.log(clamped) - Math.log(MIN_SCALE)) / (Math.log(MAX_SCALE) - Math.log(MIN_SCALE))) * 100
    );
  };
  const sliderToScale = (v) => {
    return Math.exp(
      Math.log(MIN_SCALE) + (v / 100) * (Math.log(MAX_SCALE) - Math.log(MIN_SCALE))
    );
  };

  // --- LAYAR PILIHAN LOMBA (tampil sebelum masuk ke editor) ---
  if (!selectedComp) {
    return (
      <div className="app-container">
        <div className="main-wrapper" style={{ justifyContent: 'center' }}>
          <div className="card twibbon-card" style={{ maxWidth: 500 }}>
            <span className="step-badge">Langkah 1 dari 3</span>
            <img src={LOGO_URL} alt="Dies Natalis ke-7 SMK Telkom Sidoarjo" className="header-logo" />
            <h1>Twibbon Dies Natalis ke-7 SMK Telkom Sidoarjo</h1>
            <p className="subtitle">Pilih lomba yang kamu ikuti untuk menyesuaikan caption 👇</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
              {COMPETITIONS.map((comp) => (
                <button
                  key={comp.id}
                  className="btn btn-download"
                  style={{
                    background: 'var(--teal-dies)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 12,
                    textAlign: 'left',
                    padding: '14px 18px'
                  }}
                  onClick={() => setSelectedComp(comp.id)}
                >
                  <span style={{ fontSize: '1.4rem' }}>{comp.icon}</span>
                  <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                    <span style={{ fontWeight: 700 }}>{comp.name}</span>
                    <span style={{ fontWeight: 400, fontSize: '0.8rem', opacity: 0.9 }}>{comp.tagline}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-wrapper">

        {/* KARTU EDITOR */}
        <div className="card twibbon-card">
          <span className="step-badge">Langkah 2 dari 3</span>
          <img src={LOGO_URL} alt="Dies Natalis ke-7 SMK Telkom Sidoarjo" className="header-logo" />
          <h1>Twibbon Dies Natalis ke-7 SMK Telkom Sidoarjo</h1>
          <p className="subtitle" style={{ marginBottom: 6 }}>
            Lomba: <b>{activeComp.name}</b>
          </p>
          <button className="btn-ganti-lomba" onClick={() => setSelectedComp(null)}>
            🔁 Ganti Lomba
          </button>
          <p className="subtitle">Cubit (Pinch) / Scroll untuk Zoom bebas, Geser untuk atur posisi.</p>

          {!image ? (
            <>
              <div {...getRootProps()} className={`dropzone-area ${isDragActive ? 'dropzone-active' : ''}`}>
                <input {...getInputProps()} />
                <span className="icon-upload">☁️</span>
                <p>Klik atau Tarik Foto ke Sini</p>
                <small style={{ color: '#999', fontSize: '0.75rem' }}>JPG, PNG, atau WEBP · maks 15MB</small>
              </div>
              {uploadError && <p className="upload-error">⚠️ {uploadError}</p>}
            </>
          ) : (
            <div className="editor-container">
              {/* AREA INTERAKSI */}
              <div
                ref={wrapperRef}
                className="twibbon-wrapper"
              >
                <AvatarEditor
                  key={resetKey}
                  ref={editorRef}
                  image={image}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  border={0}
                  scale={scale}
                  rotate={rotate}
                  style={{ background: '#fff', cursor: 'move' }}
                />
                <img src={FRAME_URL} alt="Frame" className="frame-overlay" />
              </div>

              {/* SLIDER CONTROLS */}
              <div className="controls">
                <div className="slider-group">
                    <span className="slider-label">🔍 Zoom ({Math.round(scale * 100)}%)</span>
                    <input
                      type="range"
                      onChange={(e) => setScale(sliderToScale(parseFloat(e.target.value)))}
                      min="0" max="100" step="1"
                      value={scaleToSlider(scale)}
                    />
                </div>

                {showAdvanced && (
                  <div className="slider-group">
                      <span className="slider-label">🔄 Putar</span>
                      <input
                        type="range"
                        onChange={(e) => setRotate(parseFloat(e.target.value))}
                        min="-180" max="180" step="1" value={rotate}
                      />
                  </div>
                )}

                <button
                  className="btn-link-toggle"
                  onClick={() => setShowAdvanced((v) => !v)}
                  type="button"
                >
                  {showAdvanced ? '▲ Sembunyikan pengaturan putar' : '▼ Pengaturan lanjutan (putar foto)'}
                </button>

                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="btn btn-ganti" style={{ flex: 1 }} onClick={handleReset}>
                    ↺ Reset
                  </button>
                  <button className="btn btn-ganti" style={{ flex: 1 }} onClick={() => setImage(null)}>
                    📂 Ganti Foto
                  </button>
                </div>
              </div>

              <button className="btn btn-download" onClick={handleDownload}>
                DOWNLOAD DISINI
              </button>
            </div>
          )}
        </div>

        {/* KARTU CAPTION */}
        <div className="card caption-card">
          <span className="step-badge">Langkah 3 dari 3</span>
          <h2>📋 Caption — {activeComp.name}</h2>
          <div className="caption-box">
            {renderCaption(captionText)}
          </div>

          <button
            className={`btn btn-copy ${copySuccess.includes("Berhasil") ? 'success' : ''}`}
            onClick={handleCopyCaption}
          >
            {copySuccess}
          </button>
        </div>

      </div>

      {/* TOAST NOTIFIKASI */}
      {toast && <div className="toast">{toast}</div>}
      <Analytics />
    </div>
  );
};

export default App;
