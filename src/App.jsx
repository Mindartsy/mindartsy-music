import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Home, Search, Library, Plus, Heart, Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Shuffle, Repeat, ListMusic, Maximize2, Minimize2,
  Share2, Check, ChevronLeft, ChevronRight, Upload, Disc, Music,
  Sparkles, Sliders, Eye, EyeOff, Trash2, ArrowUp, ArrowDown,
  Cloud, CloudOff, Settings, ExternalLink, Info, User
} from 'lucide-react';

// --- ARTWORK SVGs (Mỗi album một tác phẩm riêng biệt, không trùng lặp) ---
const ARTWORKS = {
  sky: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E293B"/><stop offset="55%" stop-color="#334155"/><stop offset="100%" stop-color="#B9D9C3"/></linearGradient></defs><rect width="600" height="600" fill="url(#g1)"/><circle cx="430" cy="170" r="95" fill="#F5F5F2" opacity="0.88"/><path d="M0 420 Q180 350 340 410 T600 390 L600 600 L0 600 Z" fill="#101114" opacity="0.85"/><path d="M0 470 Q220 430 420 480 T600 460 L600 600 L0 600 Z" fill="#17181C"/><text x="42" y="545" fill="#F5F5F2" font-family="Inter,sans-serif" font-size="18" letter-spacing="6" opacity="0.75">AURENTH</text></svg>`)}`,
  vetnang: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g2" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#141316"/><stop offset="55%" stop-color="#3D2C2E"/><stop offset="100%" stop-color="#D4A373"/></linearGradient></defs><rect width="600" height="600" fill="url(#g2)"/><polygon points="140,600 440,0 560,0 290,600" fill="#F5F5F2" opacity="0.14"/><circle cx="395" cy="195" r="54" fill="#E9C46A" opacity="0.85"/><rect x="44" y="44" width="512" height="512" fill="none" stroke="#F5F5F2" stroke-opacity="0.18" stroke-width="1.5"/><text x="44" y="545" fill="#F5F5F2" font-family="Inter,sans-serif" font-size="16" letter-spacing="5" opacity="0.8">VỆT NẮNG CUỐI CÙNG</text></svg>`)}`,
  chanson: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#1C1917"/><circle cx="300" cy="270" r="165" fill="none" stroke="#B9D9C3" stroke-width="1.5" stroke-opacity="0.55"/><circle cx="300" cy="270" r="118" fill="none" stroke="#F5F5F2" stroke-width="1" stroke-opacity="0.25"/><path d="M220 340 C260 220, 340 220, 380 340" fill="none" stroke="#E7E5E4" stroke-width="2.5"/><circle cx="300" cy="215" r="14" fill="#B9D9C3"/><text x="300" y="510" text-anchor="middle" fill="#F5F5F2" font-family="Georgia,serif" font-style="italic" font-size="24" letter-spacing="3">French Chanson</text></svg>`)}`,
  nocturne: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#0F1419"/><g stroke="#B9D9C3" stroke-opacity="0.25" stroke-width="1"><line x1="0" y1="150" x2="600" y2="150"/><line x1="0" y1="300" x2="600" y2="300"/><line x1="0" y1="450" x2="600" y2="450"/><line x1="150" y1="0" x2="150" y2="600"/><line x1="300" y1="0" x2="300" y2="600"/><line x1="450" y1="0" x2="450" y2="600"/></g><rect x="190" y="190" width="220" height="220" rx="110" fill="#B9D9C3" fill-opacity="0.16" stroke="#B9D9C3" stroke-width="2"/><text x="300" y="307" text-anchor="middle" fill="#F5F5F2" font-family="Inter,sans-serif" font-size="16" letter-spacing="8">NOCTURNES</text></svg>`)}`,
  linen: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#23221F"/><ellipse cx="300" cy="310" rx="135" ry="175" fill="#D6CFC2" opacity="0.9"/><ellipse cx="300" cy="145" rx="68" ry="16" fill="#A89F91"/><path d="M210 380 Q300 420 390 380" fill="none" stroke="#23221F" stroke-width="2" opacity="0.4"/><text x="48" y="548" fill="#D6CFC2" font-family="Inter,sans-serif" font-size="15" letter-spacing="5">STILLNESS IN LINEN</text></svg>`)}`
};

// --- INITIAL ARTISTIC CATALOG ---
const INITIAL_ARTISTS = [
  { id: 'art-aurenth', name: 'Aurenth', bio: 'Dự án Dream Pop & Ambient khám phá không gian tĩnh lặng giữa ánh sáng phương Bắc và băng từ analog.', avatar_url: ARTWORKS.sky, followers: '28.4K' },
  { id: 'art-minhquan', name: 'Minh Quân & Hà An', bio: 'Bộ đôi sáng tác Indie Ballad & Acoustic kể những lát cắt ký ức Hà Nội qua tiếng đàn mộc và ca từ giàu chất thơ.', avatar_url: ARTWORKS.vetnang, followers: '41.2K' },
  { id: 'art-camille', name: 'Camille Laurent', bio: 'Giọng hát Chanson đương đại mang hơi thở điện ảnh Paris thập niên 70 hòa quyện cùng dàn dây tối giản.', avatar_url: ARTWORKS.chanson, followers: '19.8K' },
  { id: 'art-kaito', name: 'Kaito Mori', bio: 'Nhà soạn nhạc Cinematic & Neoclassical kết hợp dương cầm đệm nỉ và âm thanh băng cối.', avatar_url: ARTWORKS.nocturne, followers: '33.1K' },
];

const INITIAL_ALBUMS = [
  {
    id: 'alb-sky',
    slug: 'a-whole-sky-away',
    title: 'A Whole Sky Away',
    artist_id: 'art-aurenth',
    artist_name: 'Aurenth',
    release_year: 2026,
    genre: 'Dream Pop & Alternative',
    description: 'Tám bản thu được hoàn thiện trong phòng thu ven biển với guitar vang vọng, synth ấm và những khoảng lặng giàu cảm xúc.',
    cover_url: ARTWORKS.sky,
    featured: true,
    published: true,
  },
  {
    id: 'alb-vetnang',
    slug: 'vet-nang-cuoi-cung',
    title: 'Vệt Nắng Cuối Cùng',
    artist_id: 'art-minhquan',
    artist_name: 'Minh Quân & Hà An',
    release_year: 2026,
    genre: 'Acoustic & Ballads',
    description: 'Tuyển tập những bản tình ca mộc mạc ghi lại khoảnh khắc hoàng hôn rơi trên những mái phố cũ.',
    cover_url: ARTWORKS.vetnang,
    featured: false,
    published: true,
  },
  {
    id: 'alb-chanson',
    slug: 'french-chanson-collection',
    title: 'French Chanson Collection',
    artist_id: 'art-camille',
    artist_name: 'Camille Laurent',
    release_year: 2025,
    genre: 'French Chanson',
    description: 'Những giai điệu tự sự bằng tiếng Pháp tinh tế, nhẹ nhàng như một thước phim 35mm chiều mưa.',
    cover_url: ARTWORKS.chanson,
    featured: false,
    published: true,
  },
  {
    id: 'alb-nocturne',
    slug: 'nocturnes-for-glass-and-tape',
    title: 'Nocturnes for Glass & Tape',
    artist_id: 'art-kaito',
    artist_name: 'Kaito Mori',
    release_year: 2026,
    genre: 'Cinematic & Soundtracks',
    description: 'Âm nhạc khí tài dành cho những đêm khuya tĩnh mịch, nơi tiếng dương cầm chạm vào không gian điện ảnh.',
    cover_url: ARTWORKS.nocturne,
    featured: false,
    published: true,
  },
  {
    id: 'alb-linen',
    slug: 'stillness-in-linen',
    title: 'Stillness in Linen',
    artist_id: 'art-kaito',
    artist_name: 'Sora Ensemble',
    release_year: 2026,
    genre: 'Instrumental',
    description: 'Những tiểu phẩm hòa tấu tối giản lấy cảm hứng từ gốm men mộc và ánh sáng tự nhiên buổi sớm.',
    cover_url: ARTWORKS.linen,
    featured: false,
    published: true,
  },
];

const INITIAL_TRACKS = [
  { id: 'trk-1', slug: 'a-whole-sky-away', album_id: 'alb-sky', track_number: 1, title: 'A Whole Sky Away', artist_name: 'Aurenth', composer: 'Aurenth', genre: 'Dream Pop & Alternative', duration_sec: 248, audio_url: 'synth://sky-1', cover_url: ARTWORKS.sky, plays_count: 18420, published: true, lyrics: 'Beneath the silver quiet of the tide\nWe left our footprints fading in the blue\nA whole sky away from yesterday\nStill every frequency returns to you.' },
  { id: 'trk-2', slug: 'velvet-horizon', album_id: 'alb-sky', track_number: 2, title: 'Velvet Horizon', artist_name: 'Aurenth', composer: 'Aurenth', genre: 'Dream Pop & Alternative', duration_sec: 214, audio_url: 'synth://sky-2', cover_url: ARTWORKS.sky, plays_count: 14210, published: true, lyrics: 'Soft static hums across the windowpane\nPale mint light on the bedroom floor\nHold the note before it dissolves.' },
  { id: 'trk-3', slug: 'paper-satellites', album_id: 'alb-sky', track_number: 3, title: 'Paper Satellites', artist_name: 'Aurenth', composer: 'Aurenth', genre: 'Mindartsy Originals', duration_sec: 265, audio_url: 'synth://sky-3', cover_url: ARTWORKS.sky, plays_count: 11890, published: true, lyrics: 'Drifting higher than the city noise\nTwo quiet signals crossing in the dark.' },
  { id: 'trk-4', slug: 'vet-nang-cuoi-cung', album_id: 'alb-vetnang', track_number: 1, title: 'Vệt Nắng Cuối Cùng', artist_name: 'Minh Quân & Hà An', composer: 'Minh Quân', genre: 'Acoustic & Ballads', duration_sec: 276, audio_url: 'synth://vn-1', cover_url: ARTWORKS.vetnang, plays_count: 32900, published: true, lyrics: 'Chiều nghiêng qua hiên nhà cũ\nVệt nắng cuối cùng đậu trên phím đàn\nTa giữ lại một câu hát nhỏ\nCho những ngày gió đi ngang.' },
  { id: 'trk-5', slug: 'em-con-thay-anh-sac-mau', album_id: 'alb-vetnang', track_number: 2, title: 'Em Còn Thấy Anh Sắc Màu...', artist_name: 'Minh Quân & Hà An', composer: 'Minh Quân', genre: 'Mindartsy Originals', duration_sec: 294, audio_url: 'synth://vn-2', cover_url: ARTWORKS.vetnang, plays_count: 29450, published: true, lyrics: 'Khi phố lên đèn mờ sương\nEm còn thấy anh sắc màu như thuở ban đầu\nTiếng guitar trầm lắng giữa khoảng không\nGọi tên nhau qua từng nhịp thở.' },
  { id: 'trk-6', slug: 'sous-le-ciel-de-minuit', album_id: 'alb-chanson', track_number: 1, title: 'Sous le Ciel de Minuit', artist_name: 'Camille Laurent', composer: 'Camille Laurent', genre: 'French Chanson', duration_sec: 203, audio_url: 'synth://fr-1', cover_url: ARTWORKS.chanson, plays_count: 15640, published: true, lyrics: 'Sous le ciel de minuit, Paris respire\nUn vieux disque tourne doucement\nDans le silence de nos souvenirs.' },
  { id: 'trk-7', slug: 'lettre-sur-la-seine', album_id: 'alb-chanson', track_number: 2, title: 'Lettre sur la Seine', artist_name: 'Camille Laurent', composer: 'Camille Laurent', genre: 'French Chanson', duration_sec: 229, audio_url: 'synth://fr-2', cover_url: ARTWORKS.chanson, plays_count: 12300, published: true, lyrics: 'Les lumières dansent sur l’eau grise\nChaque mot devient une mélodie.' },
  { id: 'trk-8', slug: 'glass-rain-study-i', album_id: 'alb-nocturne', track_number: 1, title: 'Glass Rain, Study I', artist_name: 'Kaito Mori', composer: 'Kaito Mori', genre: 'Cinematic & Soundtracks', duration_sec: 198, audio_url: 'synth://noc-1', cover_url: ARTWORKS.nocturne, plays_count: 21500, published: true, lyrics: '[Instrumental — Felt Piano & Analog Tape]' },
  { id: 'trk-9', slug: 'morning-ceramic', album_id: 'alb-linen', track_number: 1, title: 'Morning Ceramic', artist_name: 'Sora Ensemble', composer: 'Kaito Mori', genre: 'Instrumental', duration_sec: 186, audio_url: 'synth://lin-1', cover_url: ARTWORKS.linen, plays_count: 17120, published: true, lyrics: '[Instrumental — Acoustic Strings & Rhodes]' },
];

const INITIAL_PLAYLISTS = [
  { id: 'pl-1', title: 'Dream Pop Selection', subtitle: 'Không gian mơ màng & synth ấm áp', cover_url: ARTWORKS.sky, track_ids: ['trk-1', 'trk-2', 'trk-3', 'trk-8'] },
  { id: 'pl-2', title: 'French Chanson', subtitle: 'Tự sự Paris & điện ảnh cổ điển', cover_url: ARTWORKS.chanson, track_ids: ['trk-6', 'trk-7', 'trk-4'] },
  { id: 'pl-3', title: 'Cinematic Memories', subtitle: 'Nhạc nền cho những suy tư tĩnh lặng', cover_url: ARTWORKS.nocturne, track_ids: ['trk-8', 'trk-9', 'trk-1'] },
  { id: 'pl-4', title: 'Acoustic Evenings', subtitle: 'Tiếng đàn mộc và những bản ballad Việt', cover_url: ARTWORKS.vetnang, track_ids: ['trk-4', 'trk-5', 'trk-9'] },
];

const GENRES = [
  { name: 'Mindartsy Originals', cover: ARTWORKS.vetnang },
  { name: 'Dream Pop & Alternative', cover: ARTWORKS.sky },
  { name: 'Cinematic & Soundtracks', cover: ARTWORKS.nocturne },
  { name: 'French Chanson', cover: ARTWORKS.chanson },
  { name: 'Acoustic & Ballads', cover: ARTWORKS.vetnang },
  { name: 'Instrumental', cover: ARTWORKS.linen },
];

const formatTime = (sec) => {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const slugify = (text) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function App() {
  // --- SUPABASE CONNECTION (ENV OR LOCAL STORAGE) ---
  const [sbUrl, setSbUrl] = useState(() => import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('mindartsy_sb_url') || '');
  const [sbKey, setSbKey] = useState(() => import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('mindartsy_sb_key') || '');
  const [adminPin, setAdminPin] = useState(() => localStorage.getItem('mindartsy_admin_pin') || 'mindartsy2026');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => sessionStorage.getItem('mindartsy_admin_ok') === '1');
  const [pinInput, setPinInput] = useState('');

  const supabase = useMemo(() => {
    if (sbUrl && sbKey && sbUrl.startsWith('http')) {
      try {
        return createClient(sbUrl, sbKey);
      } catch {
        return null;
      }
    }
    return null;
  }, [sbUrl, sbKey]);

  // --- CATALOG STATE ---
  const [artists, setArtists] = useState(INITIAL_ARTISTS);
  const [albums, setAlbums] = useState(() => {
    const saved = localStorage.getItem('mindartsy_albums_v1');
    return saved ? JSON.parse(saved) : INITIAL_ALBUMS;
  });
  const [tracks, setTracks] = useState(() => {
    const saved = localStorage.getItem('mindartsy_tracks_v1');
    return saved ? JSON.parse(saved) : INITIAL_TRACKS;
  });
  const [playlists, setPlaylists] = useState(() => {
    const saved = localStorage.getItem('mindartsy_playlists_v1');
    return saved ? JSON.parse(saved) : INITIAL_PLAYLISTS;
  });
  const [likedIds, setLikedIds] = useState(() => {
    const saved = localStorage.getItem('mindartsy_likes_v1');
    return saved ? JSON.parse(saved) : ['trk-1', 'trk-4', 'trk-5'];
  });
  const [recentIds, setRecentIds] = useState(() => {
    const saved = localStorage.getItem('mindartsy_recent_v1');
    return saved ? JSON.parse(saved) : ['trk-1', 'trk-4', 'trk-6', 'trk-8'];
  });

  // Sync from Supabase if connected
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const [{ data: dbAlbums }, { data: dbTracks }, { data: dbPlaylists }] = await Promise.all([
        supabase.from('albums').select('*').order('created_at', { ascending: false }),
        supabase.from('tracks').select('*').order('track_number', { ascending: true }),
        supabase.from('playlists').select('*'),
      ]);
      if (dbAlbums && dbAlbums.length > 0) setAlbums(dbAlbums);
      if (dbTracks && dbTracks.length > 0) setTracks(dbTracks);
      if (dbPlaylists && dbPlaylists.length > 0) setPlaylists(dbPlaylists);
    })();
  }, [supabase]);

  useEffect(() => {
    localStorage.setItem('mindartsy_albums_v1', JSON.stringify(albums));
  }, [albums]);
  useEffect(() => {
    localStorage.setItem('mindartsy_tracks_v1', JSON.stringify(tracks));
  }, [tracks]);
  useEffect(() => {
    localStorage.setItem('mindartsy_playlists_v1', JSON.stringify(playlists));
  }, [playlists]);
  useEffect(() => {
    localStorage.setItem('mindartsy_likes_v1', JSON.stringify(likedIds));
  }, [likedIds]);
  useEffect(() => {
    localStorage.setItem('mindartsy_recent_v1', JSON.stringify(recentIds));
  }, [recentIds]);

  // --- NAVIGATION ---
  const [route, setRoute] = useState({ page: 'home', id: null });
  const [history, setHistory] = useState([{ page: 'home', id: null }]);
  const [histIdx, setHistIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryTab, setLibraryTab] = useState('albums');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const navigate = (page, id = null) => {
    const next = { page, id };
    const sliced = history.slice(0, histIdx + 1);
    setHistory([...sliced, next]);
    setHistIdx(sliced.length);
    setRoute(next);
  };

  const goBack = () => {
    if (histIdx > 0) {
      setHistIdx(histIdx - 1);
      setRoute(history[histIdx - 1]);
    }
  };
  const goForward = () => {
    if (histIdx < history.length - 1) {
      setHistIdx(histIdx + 1);
      setRoute(history[histIdx + 1]);
    }
  };

  // --- GLOBAL AUDIO ENGINE (HTML5 AUDIO + AMBIENT SYNTH FALLBACK) ---
  const audioRef = useRef(null);
  const synthTimerRef = useRef(null);
  const audioCtxRef = useRef(null);

  const [queue, setQueue] = useState(() => INITIAL_TRACKS.slice(0, 5));
  const [currentTrack, setCurrentTrack] = useState(() => INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(INITIAL_TRACKS[0].duration_sec);
  const [volume, setVolume] = useState(0.82);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('all'); // 'off' | 'all' | 'one'
  const [showQueue, setShowQueue] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState(false);

  const stopSynth = () => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
  };

  const playWarmChord = (seedIndex = 0) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const chords = [
        [220.0, 261.63, 329.63, 392.0],
        [174.61, 220.0, 261.63, 349.23],
        [196.0, 246.94, 293.66, 392.0],
        [164.81, 196.0, 246.94, 329.63],
      ];
      const notes = chords[seedIndex % chords.length];
      const now = ctx.currentTime;
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime((isMuted ? 0 : volume) * 0.035, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3.3);
      });
    } catch {
      // Ignore if browser blocks audio before gesture
    }
  };

  useEffect(() => {
    stopSynth();
    if (!currentTrack) return;

    const isSynth = currentTrack.audio_url?.startsWith('synth://');
    if (isSynth) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setDuration(currentTrack.duration_sec || 210);
      if (isPlaying) {
        let step = 0;
        playWarmChord(step);
        synthTimerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev + 1 >= (currentTrack.duration_sec || 210)) {
              handleNextTrack();
              return 0;
            }
            if ((prev + 1) % 4 === 0) {
              step += 1;
              playWarmChord(step);
            }
            return prev + 1;
          });
        }, 1000);
      }
    } else if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
    return () => stopSynth();
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Keyboard shortcut Space = Play/Pause
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const playTrack = (track, list = null) => {
    if (list && list.length > 0) setQueue(list);
    if (currentTrack?.id === track.id) {
      setIsPlaying((p) => !p);
      return;
    }
    setCurrentTrack(track);
    setProgress(0);
    setIsPlaying(true);
    setRecentIds((prev) => [track.id, ...prev.filter((id) => id !== track.id)].slice(0, 12));
    setTracks((prev) =>
      prev.map((t) => (t.id === track.id ? { ...t, plays_count: (t.plays_count || 0) + 1 } : t))
    );
  };

  const handleNextTrack = () => {
    if (!queue.length) return;
    if (repeatMode === 'one') {
      setProgress(0);
      if (audioRef.current && !currentTrack.audio_url?.startsWith('synth://')) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    if (isShuffle) {
      const next = queue[Math.floor(Math.random() * queue.length)];
      playTrack(next);
      return;
    }
    if (idx + 1 < queue.length) {
      playTrack(queue[idx + 1]);
    } else if (repeatMode === 'all') {
      playTrack(queue[0]);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevTrack = () => {
    if (progress > 4) {
      setProgress(0);
      if (audioRef.current && !currentTrack.audio_url?.startsWith('synth://')) {
        audioRef.current.currentTime = 0;
      }
      return;
    }
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    const prevIdx = idx - 1 >= 0 ? idx - 1 : queue.length - 1;
    if (queue[prevIdx]) playTrack(queue[prevIdx]);
  };

  const handleSeek = (val) => {
    const sec = Number(val);
    setProgress(sec);
    if (audioRef.current && !currentTrack?.audio_url?.startsWith('synth://')) {
      audioRef.current.currentTime = sec;
    }
  };

  const toggleLike = (trackId) => {
    setLikedIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [trackId, ...prev]
    );
    showToast(likedIds.includes(trackId) ? 'Đã xóa khỏi Bài hát yêu thích' : 'Đã lưu vào Bài hát yêu thích');
  };

  const shareItem = (title, slugPath) => {
    const url = `${window.location.origin}/${slugPath}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    showToast(`Đã sao chép liên kết chia sẻ: ${title}`);
  };

  const createNewPlaylist = () => {
    const name = `Mindartsy Mix #${playlists.length + 1}`;
    const newPl = {
      id: `pl-${Date.now()}`,
      title: name,
      subtitle: 'Tuyển tập cá nhân',
      cover_url: currentTrack?.cover_url || ARTWORKS.sky,
      track_ids: currentTrack ? [currentTrack.id] : [],
    };
    setPlaylists((prev) => [newPl, ...prev]);
    navigate('playlist', newPl.id);
    showToast(`Đã tạo playlist "${name}"`);
  };

  const addTrackToPlaylist = (playlistId, trackId) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistId && !pl.track_ids.includes(trackId)
          ? { ...pl, track_ids: [...pl.track_ids, trackId] }
          : pl
      )
    );
    showToast('Đã thêm bài hát vào playlist');
  };

  // --- ADMIN UPLOAD STATE ---
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadArtist, setUploadArtist] = useState('Mindartsy Artist');
  const [uploadAlbumId, setUploadAlbumId] = useState('new');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [uploadGenre, setUploadGenre] = useState('Mindartsy Originals');
  const [uploadYear, setUploadYear] = useState(2026);
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadLyrics, setUploadLyrics] = useState('');
  const [uploadPublished, setUploadPublished] = useState(true);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePublishTrack = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !audioFile) {
      showToast('Vui lòng nhập tên bài hát và chọn file nhạc (.mp3 / .wav)');
      return;
    }
    setIsUploading(true);
    try {
      let finalAudioUrl = URL.createObjectURL(audioFile);
      let finalCoverUrl = coverFile ? URL.createObjectURL(coverFile) : ARTWORKS.sky;

      // Upload thật lên Supabase Storage nếu đã kết nối
      if (supabase) {
        const audioExt = audioFile.name.split('.').pop();
        const audioPath = `${Date.now()}-${slugify(uploadTitle)}.${audioExt}`;
        const { error: audioErr } = await supabase.storage.from('tracks').upload(audioPath, audioFile);
        if (!audioErr) {
          const { data } = supabase.storage.from('tracks').getPublicUrl(audioPath);
          finalAudioUrl = data.publicUrl;
        }
        if (coverFile) {
          const coverExt = coverFile.name.split('.').pop();
          const coverPath = `${Date.now()}-${slugify(uploadTitle)}.${coverExt}`;
          const { error: covErr } = await supabase.storage.from('covers').upload(coverPath, coverFile);
          if (!covErr) {
            const { data } = supabase.storage.from('covers').getPublicUrl(coverPath);
            finalCoverUrl = data.publicUrl;
          }
        }
      }

      // Đọc thời lượng thực tế của file nhạc
      const detectedDuration = await new Promise((resolve) => {
        const tempAudio = new Audio(finalAudioUrl);
        tempAudio.onloadedmetadata = () => resolve(Math.round(tempAudio.duration) || 210);
        tempAudio.onerror = () => resolve(210);
      });

      let targetAlbumId = uploadAlbumId;
      if (uploadAlbumId === 'new') {
        const albTitle = newAlbumTitle.trim() || `${uploadTitle} (Single)`;
        targetAlbumId = `alb-${Date.now()}`;
        const newAlbumObj = {
          id: targetAlbumId,
          slug: slugify(albTitle),
          title: albTitle,
          artist_id: 'art-mindartsy',
          artist_name: uploadArtist,
          release_year: Number(uploadYear) || 2026,
          genre: uploadGenre,
          description: uploadDesc || `Phát hành độc quyền trên MINDARTSY MUSIC bởi ${uploadArtist}.`,
          cover_url: finalCoverUrl,
          featured: false,
          published: uploadPublished,
        };
        setAlbums((prev) => [newAlbumObj, ...prev]);
        if (supabase) await supabase.from('albums').insert(newAlbumObj);
      } else {
        const existingAlb = albums.find((a) => a.id === targetAlbumId);
        if (existingAlb && !coverFile) finalCoverUrl = existingAlb.cover_url;
      }

      const albumTracksCount = tracks.filter((t) => t.album_id === targetAlbumId).length;
      const newTrackObj = {
        id: `trk-${Date.now()}`,
        slug: slugify(uploadTitle),
        album_id: targetAlbumId,
        track_number: albumTracksCount + 1,
        title: uploadTitle.trim(),
        artist_name: uploadArtist.trim(),
        composer: uploadArtist.trim(),
        genre: uploadGenre,
        duration_sec: detectedDuration,
        audio_url: finalAudioUrl,
        cover_url: finalCoverUrl,
        lyrics: uploadLyrics.trim() || 'Lời bài hát đang được cập nhật.',
        plays_count: 1,
        published: uploadPublished,
      };

      setTracks((prev) => [newTrackObj, ...prev]);
      if (supabase) await supabase.from('tracks').insert(newTrackObj);

      setUploadTitle('');
      setNewAlbumTitle('');
      setUploadDesc('');
      setUploadLyrics('');
      setAudioFile(null);
      setCoverFile(null);
      showToast(supabase ? 'Đã xuất bản trực tiếp lên Cloud!' : 'Đã xuất bản ca khúc mới!');
      playTrack(newTrackObj, [newTrackObj, ...tracks]);
    } finally {
      setIsUploading(false);
    }
  };

  const publishedAlbums = albums.filter((a) => a.published);
  const publishedTracks = tracks.filter((t) => t.published);
  const featuredAlbum = publishedAlbums.find((a) => a.featured) || publishedAlbums[0];

  // --- SEARCH RESULTS ---
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return null;
    return {
      tracks: publishedTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist_name.toLowerCase().includes(q) ||
          (t.genre && t.genre.toLowerCase().includes(q))
      ),
      albums: publishedAlbums.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.artist_name.toLowerCase().includes(q) ||
          a.genre.toLowerCase().includes(q)
      ),
      artists: artists.filter((ar) => ar.name.toLowerCase().includes(q)),
    };
  }, [searchQuery, publishedTracks, publishedAlbums, artists]);

  // --- RENDER COMPONENTS ---
  const AlbumCard = ({ album }) => {
    const albumTracks = publishedTracks
      .filter((t) => t.album_id === album.id)
      .sort((a, b) => a.track_number - b.track_number);

    return (
      <div
        onClick={() => navigate('album', album.id)}
        className="group bg-[#202126] hover:bg-[#2A2C31] p-3.5 rounded-xl transition-all duration-200 cursor-pointer flex flex-col"
      >
        <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-[#17181C]">
          <img
            src={album.cover_url}
            alt={album.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (albumTracks.length > 0) playTrack(albumTracks[0], albumTracks);
            }}
            aria-label={`Play ${album.title}`}
            className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-[#B9D9C3] text-[#101114] flex items-center justify-center shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-105"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>
        <h3 className="font-semibold text-[#F5F5F2] text-sm truncate">{album.title}</h3>
        <p className="text-xs text-[#A3A5AA] truncate mt-1">
          {album.release_year} · {album.artist_name}
        </p>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#101114] text-[#F5F5F2] flex flex-col select-none">
      {/* Hidden Global HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={!currentTrack?.audio_url?.startsWith('synth://') ? currentTrack?.audio_url : undefined}
        onTimeUpdate={(e) => setProgress(Math.floor(e.target.currentTime))}
        onLoadedMetadata={(e) => setDuration(Math.floor(e.target.duration))}
        onEnded={handleNextTrack}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-6 z-50 bg-[#202126] border border-[#B9D9C3]/40 text-[#F5F5F2] px-4 py-2.5 rounded-xl shadow-2xl text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B9D9C3]" />
          {toast}
        </div>
      )}

      {/* MAIN WORKSPACE (SIDEBAR + CONTENT) */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP LEFT SIDEBAR */}
        <aside className="hidden md:flex w-[240px] shrink-0 bg-[#17181C] border-r border-[#303137]/60 flex-col p-4">
          <div
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 px-2 py-1.5 mb-6 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full border border-[#B9D9C3] flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#B9D9C3]" />
            </div>
            <div>
              <span className="font-bold tracking-wider text-sm text-[#F5F5F2]">mindartsy</span>
              <span className="block text-[10px] text-[#B9D9C3] tracking-widest uppercase">music</span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'search', label: 'Search', icon: Search },
              { id: 'library', label: 'Your Library', icon: Library },
              { id: 'about', label: 'About Mindartsy', icon: Info },
            ].map((item) => {
              const Icon = item.icon;
              const active = route.page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'bg-[#202126] text-[#B9D9C3]' : 'text-[#A3A5AA] hover:text-[#F5F5F2] hover:bg-[#202126]/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-5 border-t border-[#303137]/70">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#A3A5AA] mb-2">
              Your Collection
            </p>
            <button
              onClick={createNewPlaylist}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A3A5AA] hover:text-[#F5F5F2] hover:bg-[#202126]/50 transition-colors"
            >
              <Plus className="w-4 h-4 text-[#B9D9C3]" />
              Create Playlist
            </button>
            <button
              onClick={() => navigate('liked')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                route.page === 'liked' ? 'bg-[#202126] text-[#B9D9C3]' : 'text-[#A3A5AA] hover:text-[#F5F5F2]'
              }`}
            >
              <Heart className="w-4 h-4 text-[#B9D9C3]" />
              Liked Songs ({likedIds.length})
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-[#303137]/70 flex-1 overflow-y-auto">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#A3A5AA] mb-2">
              Playlists
            </p>
            <div className="space-y-0.5">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => navigate('playlist', pl.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${
                    route.page === 'playlist' && route.id === pl.id
                      ? 'bg-[#202126] text-[#B9D9C3]'
                      : 'text-[#A3A5AA] hover:text-[#F5F5F2]'
                  }`}
                >
                  {pl.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER CONTENT AREA */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#101114]">
          {/* TOP BAR */}
          <header className="h-16 px-4 md:px-8 border-b border-[#303137]/50 flex items-center justify-between shrink-0 bg-[#101114]/90 backdrop-blur">
            <div className="flex items-center gap-2">
              <button
                onClick={goBack}
                disabled={histIdx === 0}
                className="w-8 h-8 rounded-full bg-[#17181C] flex items-center justify-center text-[#A3A5AA] hover:text-[#F5F5F2] disabled:opacity-35"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goForward}
                disabled={histIdx >= history.length - 1}
                className="w-8 h-8 rounded-full bg-[#17181C] flex items-center justify-center text-[#A3A5AA] hover:text-[#F5F5F2] disabled:opacity-35"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="md:hidden ml-2 font-bold text-sm tracking-wider text-[#B9D9C3]">MINDARTSY</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#17181C] border border-[#303137]">
                {supabase ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-[#B9D9C3]" />
                    <span className="text-[#B9D9C3]">Cloud Live</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-[#A3A5AA]" />
                    <span className="text-[#A3A5AA]">Local Studio</span>
                  </>
                )}
              </div>

              <button
                onClick={() => navigate('admin')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B9D9C3] text-[#101114] text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Upload className="w-3.5 h-3.5" />
                Studio / Upload
              </button>
            </div>
          </header>

          {/* SCROLLABLE ROUTE CONTENT */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-36 md:pb-28 space-y-8">
            {/* 1. HOME PAGE */}
            {route.page === 'home' && (
              <>
                {/* Featured Album Hero */}
                {featuredAlbum && (
                  <section className="bg-[#17181C] border border-[#303137]/70 rounded-2xl p-5 md:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <img
                      src={featuredAlbum.cover_url}
                      alt={featuredAlbum.title}
                      onClick={() => navigate('album', featuredAlbum.id)}
                      className="w-36 h-36 md:w-44 md:h-44 rounded-xl object-cover cursor-pointer shrink-0 shadow-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B9D9C3]">
                        Featured Release · Mindartsy Originals
                      </span>
                      <h1
                        onClick={() => navigate('album', featuredAlbum.id)}
                        className="text-2xl md:text-4xl font-bold text-[#F5F5F2] mt-1.5 cursor-pointer hover:underline"
                      >
                        {featuredAlbum.title}
                      </h1>
                      <p className="text-sm text-[#A3A5AA] mt-1">
                        {featuredAlbum.artist_name} · {featuredAlbum.release_year}
                      </p>
                      <p className="text-sm text-[#A3A5AA] mt-2.5 max-w-2xl line-clamp-2">
                        {featuredAlbum.description}
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => {
                            const list = publishedTracks.filter((t) => t.album_id === featuredAlbum.id);
                            if (list.length) playTrack(list[0], list);
                          }}
                          className="px-5 py-2.5 rounded-full bg-[#B9D9C3] text-[#101114] text-sm font-semibold flex items-center gap-2 hover:scale-[1.02] transition-transform"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Play Album
                        </button>
                        <button
                          onClick={() => navigate('album', featuredAlbum.id)}
                          className="px-4 py-2.5 rounded-full bg-[#202126] text-[#F5F5F2] text-sm font-medium hover:bg-[#2A2C31]"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {/* Recently Released */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold tracking-tight">Recently Released</h2>
                    <button
                      onClick={() => navigate('library')}
                      className="text-xs text-[#A3A5AA] hover:text-[#B9D9C3]"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {publishedAlbums.map((alb) => (
                      <AlbumCard key={alb.id} album={alb} />
                    ))}
                  </div>
                </section>

                {/* Popular Tracks */}
                <section>
                  <h2 className="text-xl font-bold tracking-tight mb-4">Popular Tracks</h2>
                  <div className="bg-[#17181C] rounded-xl border border-[#303137]/60 divide-y divide-[#303137]/50">
                    {publishedTracks.slice(0, 6).map((trk, idx) => {
                      const active = currentTrack?.id === trk.id;
                      return (
                        <div
                          key={trk.id}
                          onClick={() => playTrack(trk, publishedTracks)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-[#202126] transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className={`w-5 text-xs text-center ${active ? 'text-[#B9D9C3] font-bold' : 'text-[#A3A5AA]'}`}>
                              {active && isPlaying ? '▶' : idx + 1}
                            </span>
                            <img src={trk.cover_url} alt={trk.title} className="w-10 h-10 rounded-md object-cover" />
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate ${active ? 'text-[#B9D9C3]' : 'text-[#F5F5F2]'}`}>
                                {trk.title}
                              </p>
                              <p
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('track', trk.id);
                                }}
                                className="text-xs text-[#A3A5AA] hover:underline truncate"
                              >
                                {trk.artist_name} · Xem lời bài hát
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="hidden sm:inline text-xs text-[#A3A5AA]">
                              {(trk.plays_count || 0).toLocaleString()} lượt nghe
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(trk.id);
                              }}
                              className="text-[#A3A5AA] hover:text-[#B9D9C3]"
                            >
                              <Heart className={`w-4 h-4 ${likedIds.includes(trk.id) ? 'fill-[#B9D9C3] text-[#B9D9C3]' : ''}`} />
                            </button>
                            <span className="text-xs text-[#A3A5AA] w-10 text-right">{formatTime(trk.duration_sec)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Curated Playlists */}
                <section>
                  <h2 className="text-xl font-bold tracking-tight mb-4">Curated Playlists</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {playlists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => navigate('playlist', pl.id)}
                        className="group bg-[#202126] hover:bg-[#2A2C31] p-3.5 rounded-xl cursor-pointer transition-colors"
                      >
                        <img src={pl.cover_url} alt={pl.title} className="aspect-square w-full rounded-lg object-cover mb-3" />
                        <h3 className="font-semibold text-sm truncate">{pl.title}</h3>
                        <p className="text-xs text-[#A3A5AA] truncate mt-1">{pl.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* 2. SEARCH PAGE */}
            {route.page === 'search' && (
              <div className="space-y-6">
                <div className="relative max-w-xl">
                  <Search className="w-5 h-5 text-[#A3A5AA] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm bài hát, album, nghệ sĩ hoặc thể loại..."
                    autoFocus
                    className="w-full bg-[#202126] border border-[#303137] focus:border-[#B9D9C3] rounded-full pl-12 pr-4 py-3 text-sm text-[#F5F5F2] outline-none"
                  />
                </div>

                {!searchResults ? (
                  <div>
                    <h2 className="text-lg font-bold mb-4">Khám phá theo thể loại</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {GENRES.map((g) => (
                        <div
                          key={g.name}
                          onClick={() => setSearchQuery(g.name)}
                          className="bg-[#202126] hover:bg-[#2A2C31] border border-[#303137]/60 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-colors"
                        >
                          <img src={g.cover} alt={g.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                          <span className="font-semibold text-sm">{g.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold mb-3">Bài hát ({searchResults.tracks.length})</h3>
                      {searchResults.tracks.length === 0 ? (
                        <p className="text-sm text-[#A3A5AA]">Không tìm thấy bài hát phù hợp.</p>
                      ) : (
                        <div className="bg-[#17181C] rounded-xl divide-y divide-[#303137]/50">
                          {searchResults.tracks.map((t) => (
                            <div
                              key={t.id}
                              onClick={() => playTrack(t, searchResults.tracks)}
                              className="flex items-center justify-between px-4 py-3 hover:bg-[#202126] cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <img src={t.cover_url} alt={t.title} className="w-10 h-10 rounded object-cover" />
                                <div>
                                  <p className="text-sm font-medium">{t.title}</p>
                                  <p className="text-xs text-[#A3A5AA]">{t.artist_name}</p>
                                </div>
                              </div>
                              <span className="text-xs text-[#A3A5AA]">{formatTime(t.duration_sec)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {searchResults.albums.length > 0 && (
                      <div>
                        <h3 className="text-base font-bold mb-3">Albums ({searchResults.albums.length})</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {searchResults.albums.map((a) => (
                            <AlbumCard key={a.id} album={a} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. ALBUM DETAIL PAGE */}
            {route.page === 'album' && (() => {
              const album = albums.find((a) => a.id === route.id) || publishedAlbums[0];
              if (!album) return null;
              const albumTracks = publishedTracks
                .filter((t) => t.album_id === album.id)
                .sort((a, b) => a.track_number - b.track_number);
              const totalSec = albumTracks.reduce((acc, t) => acc + (t.duration_sec || 0), 0);

              return (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 md:items-end">
                    <img
                      src={album.cover_url}
                      alt={album.title}
                      className="w-56 h-56 md:w-72 md:h-72 rounded-xl object-cover shadow-2xl shrink-0"
                    />
                    <div className="space-y-2.5">
                      <span className="text-xs uppercase tracking-widest text-[#B9D9C3] font-semibold">
                        Album · {album.genre}
                      </span>
                      <h1 className="text-3xl md:text-5xl font-bold text-[#F5F5F2]">{album.title}</h1>
                      <p className="text-sm text-[#A3A5AA]">
                        <button
                          onClick={() => navigate('artist', album.artist_id)}
                          className="text-[#F5F5F2] font-semibold hover:underline"
                        >
                          {album.artist_name}
                        </button>{' '}
                        · {album.release_year} · {albumTracks.length} bài hát ({Math.round(totalSec / 60)} phút)
                      </p>
                      <p className="text-sm text-[#A3A5AA] max-w-2xl pt-1">{album.description}</p>
                      <div className="flex items-center gap-3 pt-3">
                        <button
                          onClick={() => albumTracks.length && playTrack(albumTracks[0], albumTracks)}
                          className="px-6 py-2.5 rounded-full bg-[#B9D9C3] text-[#101114] font-semibold text-sm flex items-center gap-2 hover:scale-[1.02] transition-transform"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Play All
                        </button>
                        <button
                          onClick={() => shareItem(album.title, `album/${album.slug}`)}
                          className="px-4 py-2.5 rounded-full bg-[#202126] hover:bg-[#2A2C31] text-sm flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tracklist */}
                  <div className="bg-[#17181C] rounded-xl border border-[#303137]/60 divide-y divide-[#303137]/40">
                    {albumTracks.map((trk, i) => {
                      const active = currentTrack?.id === trk.id;
                      return (
                        <div
                          key={trk.id}
                          onClick={() => playTrack(trk, albumTracks)}
                          className="flex items-center justify-between px-4 py-3.5 hover:bg-[#202126] cursor-pointer group"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <span className={`w-5 text-xs text-center ${active ? 'text-[#B9D9C3] font-bold' : 'text-[#A3A5AA]'}`}>
                              {active && isPlaying ? '▶' : i + 1}
                            </span>
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate ${active ? 'text-[#B9D9C3]' : 'text-[#F5F5F2]'}`}>
                                {trk.title}
                              </p>
                              <p className="text-xs text-[#A3A5AA]">{trk.artist_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('track', trk.id);
                              }}
                              className="text-xs text-[#A3A5AA] hover:text-[#B9D9C3] px-2 py-1 rounded bg-[#202126]"
                            >
                              Lyrics
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (playlists[0]) addTrackToPlaylist(playlists[0].id, trk.id);
                              }}
                              title="Thêm vào playlist đầu tiên"
                              className="text-[#A3A5AA] hover:text-[#F5F5F2]"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(trk.id);
                              }}
                              className="text-[#A3A5AA] hover:text-[#B9D9C3]"
                            >
                              <Heart className={`w-4 h-4 ${likedIds.includes(trk.id) ? 'fill-[#B9D9C3] text-[#B9D9C3]' : ''}`} />
                            </button>
                            <span className="text-xs text-[#A3A5AA] w-10 text-right">{formatTime(trk.duration_sec)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* 4. TRACK DETAIL & LYRICS PAGE */}
            {route.page === 'track' && (() => {
              const trk = tracks.find((t) => t.id === route.id) || currentTrack;
              if (!trk) return null;
              return (
                <div className="max-w-3xl space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <img src={trk.cover_url} alt={trk.title} className="w-48 h-48 rounded-xl object-cover shadow-xl" />
                    <div className="space-y-2">
                      <span className="text-xs uppercase tracking-widest text-[#B9D9C3]">Track Detail</span>
                      <h1 className="text-3xl font-bold">{trk.title}</h1>
                      <p className="text-sm text-[#A3A5AA]">
                        Nghệ sĩ: <span className="text-[#F5F5F2]">{trk.artist_name}</span> · Sáng tác: {trk.composer || trk.artist_name}
                      </p>
                      <p className="text-xs text-[#A3A5AA]">Thể loại: {trk.genre} · Thời lượng: {formatTime(trk.duration_sec)}</p>
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => playTrack(trk, publishedTracks)}
                          className="px-5 py-2 rounded-full bg-[#B9D9C3] text-[#101114] text-sm font-semibold flex items-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Phát ca khúc
                        </button>
                        <button
                          onClick={() => shareItem(trk.title, `track/${trk.slug}`)}
                          className="px-4 py-2 rounded-full bg-[#202126] text-sm flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Chia sẻ link
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#17181C] border border-[#303137]/60 rounded-2xl p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B9D9C3] mb-3">Lời bài hát / Ghi chú</h2>
                    <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-[#F5F5F2]/90">
                      {trk.lyrics || 'Chưa có lời bài hát.'}
                    </pre>
                  </div>
                </div>
              );
            })()}

            {/* 5. ARTIST PAGE */}
            {route.page === 'artist' && (() => {
              const artist = artists.find((a) => a.id === route.id) || artists[0];
              const artistAlbums = publishedAlbums.filter((a) => a.artist_id === artist.id || a.artist_name === artist.name);
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-5 bg-[#17181C] p-6 rounded-2xl border border-[#303137]/60">
                    <img src={artist.avatar_url} alt={artist.name} className="w-24 h-24 rounded-full object-cover" />
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#B9D9C3]">Verified Mindartsy Artist</span>
                      <h1 className="text-3xl font-bold mt-1">{artist.name}</h1>
                      <p className="text-sm text-[#A3A5AA] mt-1 max-w-2xl">{artist.bio}</p>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold">Discography</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {artistAlbums.map((alb) => (
                      <AlbumCard key={alb.id} album={alb} />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 6. PLAYLIST & LIKED SONGS */}
            {(route.page === 'playlist' || route.page === 'liked') && (() => {
              const isLikedPage = route.page === 'liked';
              const pl = playlists.find((p) => p.id === route.id) || playlists[0];
              const listTracks = isLikedPage
                ? publishedTracks.filter((t) => likedIds.includes(t.id))
                : publishedTracks.filter((t) => pl?.track_ids.includes(t.id));

              return (
                <div className="space-y-6">
                  <div className="flex items-end gap-5">
                    <img
                      src={isLikedPage ? ARTWORKS.sky : pl?.cover_url}
                      alt="Cover"
                      className="w-40 h-40 rounded-xl object-cover shadow-xl"
                    />
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#B9D9C3]">Playlist</span>
                      <h1 className="text-3xl font-bold mt-1">{isLikedPage ? 'Liked Songs' : pl?.title}</h1>
                      <p className="text-sm text-[#A3A5AA] mt-1">{listTracks.length} bài hát</p>
                      {listTracks.length > 0 && (
                        <button
                          onClick={() => playTrack(listTracks[0], listTracks)}
                          className="mt-3 px-5 py-2 rounded-full bg-[#B9D9C3] text-[#101114] text-sm font-semibold inline-flex items-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Play All
                        </button>
                      )}
                    </div>
                  </div>

                  {listTracks.length === 0 ? (
                    <p className="text-sm text-[#A3A5AA]">Danh sách trống. Hãy nhấn biểu tượng trái tim hoặc dấu + trên bài hát để thêm.</p>
                  ) : (
                    <div className="bg-[#17181C] rounded-xl divide-y divide-[#303137]/50">
                      {listTracks.map((t, i) => (
                        <div
                          key={t.id}
                          onClick={() => playTrack(t, listTracks)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-[#202126] cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-[#A3A5AA] w-5">{i + 1}</span>
                            <img src={t.cover_url} alt={t.title} className="w-10 h-10 rounded object-cover" />
                            <div>
                              <p className="text-sm font-medium">{t.title}</p>
                              <p className="text-xs text-[#A3A5AA]">{t.artist_name}</p>
                            </div>
                          </div>
                          <span className="text-xs text-[#A3A5AA]">{formatTime(t.duration_sec)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 7. YOUR LIBRARY */}
            {route.page === 'library' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Your Library</h1>
                  <div className="flex gap-2">
                    {['albums', 'playlists', 'recent'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setLibraryTab(tab)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize ${
                          libraryTab === tab ? 'bg-[#B9D9C3] text-[#101114]' : 'bg-[#202126] text-[#A3A5AA]'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                {libraryTab === 'albums' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {publishedAlbums.map((a) => (
                      <AlbumCard key={a.id} album={a} />
                    ))}
                  </div>
                )}
                {libraryTab === 'playlists' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {playlists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => navigate('playlist', pl.id)}
                        className="bg-[#202126] p-3.5 rounded-xl cursor-pointer hover:bg-[#2A2C31]"
                      >
                        <img src={pl.cover_url} alt={pl.title} className="aspect-square rounded-lg object-cover mb-3" />
                        <p className="font-semibold text-sm">{pl.title}</p>
                      </div>
                    ))}
                  </div>
                )}
                {libraryTab === 'recent' && (
                  <div className="bg-[#17181C] rounded-xl divide-y divide-[#303137]/50">
                    {recentIds
                      .map((id) => publishedTracks.find((t) => t.id === id))
                      .filter(Boolean)
                      .map((t) => (
                        <div
                          key={t.id}
                          onClick={() => playTrack(t, publishedTracks)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-[#202126] cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img src={t.cover_url} alt={t.title} className="w-10 h-10 rounded object-cover" />
                            <div>
                              <p className="text-sm font-medium">{t.title}</p>
                              <p className="text-xs text-[#A3A5AA]">{t.artist_name}</p>
                            </div>
                          </div>
                          <span className="text-xs text-[#A3A5AA]">{formatTime(t.duration_sec)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* 8. ABOUT PAGE */}
            {route.page === 'about' && (
              <div className="max-w-2xl space-y-4 bg-[#17181C] p-6 md:p-8 rounded-2xl border border-[#303137]/60">
                <span className="text-xs uppercase tracking-widest text-[#B9D9C3]">Independent Music · Art · Stories</span>
                <h1 className="text-3xl font-bold">MINDARTSY MUSIC</h1>
                <p className="text-sm text-[#A3A5AA] leading-relaxed">
                  Mindartsy Music là không gian phát hành và thưởng thức âm nhạc độc lập, nơi mỗi album được chăm chút như một tác phẩm nghệ thuật thị giác gắn liền với câu chuyện sáng tác nguyên bản.
                </p>
                <p className="text-sm text-[#A3A5AA] leading-relaxed">
                  Nền tảng hỗ trợ phát nhạc chất lượng cao trực tuyến trên mọi thiết bị, tạo playlist cá nhân và chia sẻ liên kết trực tiếp tới bạn bè mà không cần đăng ký tài khoản.
                </p>
              </div>
            )}

            {/* 9. ADMIN STUDIO & UPLOAD DASHBOARD */}
            {route.page === 'admin' && (
              <div className="max-w-4xl space-y-6">
                {!isAdminUnlocked ? (
                  <div className="max-w-md mx-auto bg-[#17181C] border border-[#303137] rounded-2xl p-6 space-y-4">
                    <h2 className="text-xl font-bold">Mindartsy Studio Access</h2>
                    <p className="text-xs text-[#A3A5AA]">
                      Nhập mã PIN quản trị để upload nhạc và quản lý kho phát hành (mã mặc định: <code className="text-[#B9D9C3]">mindartsy2026</code>).
                    </p>
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Nhập mã PIN Studio..."
                      className="w-full bg-[#202126] border border-[#303137] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#B9D9C3]"
                    />
                    <button
                      onClick={() => {
                        if (pinInput === adminPin) {
                          setIsAdminUnlocked(true);
                          sessionStorage.setItem('mindartsy_admin_ok', '1');
                        } else {
                          showToast('Mã PIN chưa đúng');
                        }
                      }}
                      className="w-full py-2.5 rounded-lg bg-[#B9D9C3] text-[#101114] font-semibold text-sm"
                    >
                      Mở khóa Studio
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h1 className="text-2xl font-bold">Mindartsy Creator Studio</h1>
                        <p className="text-xs text-[#A3A5AA]">Upload ca khúc mới, quản lý album và kết nối lưu trữ đám mây</p>
                      </div>
                      <div className="flex gap-4 bg-[#17181C] px-4 py-2 rounded-xl border border-[#303137]">
                        <div>
                          <span className="text-[11px] text-[#A3A5AA] block">Tổng lượt nghe</span>
                          <span className="font-bold text-[#B9D9C3]">
                            {tracks.reduce((s, t) => s + (t.plays_count || 0), 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="border-l border-[#303137] pl-4">
                          <span className="text-[11px] text-[#A3A5AA] block">Ca khúc</span>
                          <span className="font-bold">{tracks.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Upload Form */}
                    <form onSubmit={handlePublishTrack} className="bg-[#17181C] border border-[#303137] rounded-2xl p-6 space-y-4">
                      <h2 className="text-base font-bold text-[#B9D9C3]">1. Upload & Xuất bản Ca khúc mới</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#A3A5AA] block mb-1">Tên bài hát *</label>
                          <input
                            type="text"
                            required
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                            placeholder="Ví dụ: Đêm Mưa Phố Cổ"
                            className="w-full bg-[#202126] border border-[#303137] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#B9D9C3]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#A3A5AA] block mb-1">Nghệ sĩ / Sáng tác *</label>
                          <input
                            type="text"
                            required
                            value={uploadArtist}
                            onChange={(e) => setUploadArtist(e.target.value)}
                            className="w-full bg-[#202126] border border-[#303137] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#B9D9C3]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#A3A5AA] block mb-1">Album phát hành</label>
                          <select
                            value={uploadAlbumId}
                            onChange={(e) => setUploadAlbumId(e.target.value)}
                            className="w-full bg-[#202126] border border-[#303137] rounded-lg px-3 py-2 text-sm outline-none"
                          >
                            <option value="new">+ Tạo Album / Single mới</option>
                            {albums.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.title} ({a.release_year})
                              </option>
                            ))}
                          </select>
                        </div>
                        {uploadAlbumId === 'new' ? (
                          <div>
                            <label className="text-xs text-[#A3A5AA] block mb-1">Tên Album mới</label>
                            <input
                              type="text"
                              value={newAlbumTitle}
                              onChange={(e) => setNewAlbumTitle(e.target.value)}
                              placeholder="Để trống nếu phát hành Single"
                              className="w-full bg-[#202126] border border-[#303137] rounded-lg px-3 py-2 text-sm outline-none"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="text-xs text-[#A3A5AA] block mb-1">Thể loại</label>
                            <select
                              value={uploadGenre}
                              onChange={(e) => setUploadGenre(e.target.value)}
                              className="w-full bg-[#202126] border border-[#303137] rounded-lg px-3 py-2 text-sm outline-none"
                            >
                              {GENRES.map((g) => (
                                <option key={g.name} value={g.name}>
                                  {g.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#202126] border border-dashed border-[#303137] rounded-xl p-4">
                          <label className="text-xs font-medium text-[#B9D9C3] block mb-1">
                            File Audio (.MP3, .WAV, .FLAC) *
                          </label>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                            className="text-xs text-[#A3A5AA] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-[#B9D9C3] file:text-[#101114] file:font-semibold"
                          />
                        </div>
                        <div className="bg-[#202126] border border-dashed border-[#303137] rounded-xl p-4">
                          <label className="text-xs font-medium text-[#B9D9C3] block mb-1">
                            Ảnh bìa vuông (.JPG, .PNG, .WEBP)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                            className="text-xs text-[#A3A5AA] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-[#2A2C31] file:text-[#F5F5F2]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#A3A5AA] block mb-1">Lời bài hát & Câu chuyện sáng tác</label>
                        <textarea
                          rows={3}
                          value={uploadLyrics}
                          onChange={(e) => setUploadLyrics(e.target.value)}
                          placeholder="Nhập lời bài hát hoặc cảm hứng sáng tác..."
                          className="w-full bg-[#202126] border border-[#303137] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#B9D9C3]"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-xs text-[#A3A5AA] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={uploadPublished}
                            onChange={(e) => setUploadPublished(e.target.checked)}
                            className="accent-[#B9D9C3]"
                          />
                          Xuất bản công khai ngay sau khi tải lên
                        </label>
                        <button
                          type="submit"
                          disabled={isUploading}
                          className="px-6 py-2.5 rounded-full bg-[#B9D9C3] text-[#101114] font-semibold text-sm hover:opacity-90 disabled:opacity-50"
                        >
                          {isUploading ? 'Đang tải lên...' : 'Xuất bản bài hát'}
                        </button>
                      </div>
                    </form>

                    {/* Manage Tracks */}
                    <div className="bg-[#17181C] border border-[#303137] rounded-2xl p-6 space-y-3">
                      <h2 className="text-base font-bold">2. Danh sách phát hành ({tracks.length} bài)</h2>
                      <div className="divide-y divide-[#303137]/50">
                        {tracks.map((t) => (
                          <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={t.cover_url} alt={t.title} className="w-9 h-9 rounded object-cover" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{t.title}</p>
                                <p className="text-xs text-[#A3A5AA] truncate">{t.artist_name} · {t.genre}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() =>
                                  setTracks((prev) =>
                                    prev.map((item) => (item.id === t.id ? { ...item, published: !item.published } : item))
                                  )
                                }
                                className="px-2.5 py-1 rounded bg-[#202126] text-xs text-[#A3A5AA] hover:text-[#F5F5F2]"
                              >
                                {t.published ? 'Công khai' : 'Bản nháp'}
                              </button>
                              <button
                                onClick={() => setTracks((prev) => prev.filter((item) => item.id !== t.id))}
                                className="p-1.5 text-[#A3A5AA] hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cloud Connection Settings */}
                    <div className="bg-[#17181C] border border-[#303137] rounded-2xl p-6 space-y-3">
                      <h2 className="text-base font-bold text-[#B9D9C3]">3. Kết nối Cloud Vĩnh Viễn (Supabase Storage)</h2>
                      <p className="text-xs text-[#A3A5AA]">
                        Dán URL và Anon Key từ dự án Supabase của bạn để mọi file nhạc upload lưu vĩnh viễn trên đám mây cho bạn bè toàn thế giới nghe.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={sbUrl}
                          onChange={(e) => {
                            setSbUrl(e.target.value);
                            localStorage.setItem('mindartsy_sb_url', e.target.value);
                          }}
                          placeholder="https://xxxx.supabase.co"
                          className="bg-[#202126] border border-[#303137] rounded-lg px-3 py-2 text-xs"
                        />
                        <input
                          type="password"
                          value={sbKey}
                          onChange={(e) => {
                            setSbKey(e.target.value);
                            localStorage.setItem('mindartsy_sb_key', e.target.value);
                          }}
                          placeholder="Supabase Anon Public Key"
                          className="bg-[#202126] border border-[#303137] rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* QUEUE DRAWER */}
      {showQueue && (
        <div className="fixed right-4 bottom-24 z-40 w-80 max-h-96 bg-[#17181C] border border-[#303137] rounded-2xl shadow-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#303137]">
            <span className="text-sm font-bold">Danh sách phát ({queue.length})</span>
            <button onClick={() => setShowQueue(false)} className="text-xs text-[#A3A5AA] hover:text-[#F5F5F2]">
              Đóng
            </button>
          </div>
          <div className="overflow-y-auto space-y-1.5">
            {queue.map((t) => (
              <div
                key={t.id}
                onClick={() => playTrack(t)}
                className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer ${
                  currentTrack?.id === t.id ? 'bg-[#202126] text-[#B9D9C3]' : 'hover:bg-[#202126]/60'
                }`}
              >
                <img src={t.cover_url} alt={t.title} className="w-9 h-9 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{t.title}</p>
                  <p className="text-[11px] text-[#A3A5AA] truncate">{t.artist_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPANDED FULLSCREEN NOW PLAYING */}
      {expandedPlayer && currentTrack && (
        <div className="fixed inset-0 z-50 bg-[#101114] flex flex-col p-6 md:p-12 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.25em] text-[#B9D9C3]">Now Playing · Mindartsy</span>
            <button
              onClick={() => setExpandedPlayer(false)}
              className="p-2 rounded-full bg-[#202126] text-[#F5F5F2] hover:bg-[#2A2C31]"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center my-auto py-6">
            <div className="space-y-4">
              <img
                src={currentTrack.cover_url}
                alt={currentTrack.title}
                className="w-full max-w-sm mx-auto aspect-square rounded-2xl object-cover shadow-2xl"
              />
              <div className="text-center md:text-left max-w-sm mx-auto">
                <h2 className="text-2xl font-bold">{currentTrack.title}</h2>
                <p className="text-sm text-[#A3A5AA]">{currentTrack.artist_name}</p>
              </div>
            </div>
            <div className="bg-[#17181C] border border-[#303137]/70 rounded-2xl p-6 max-h-96 overflow-y-auto">
              <span className="text-xs uppercase tracking-widest text-[#B9D9C3] block mb-3">Lyrics & Story</span>
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-[#F5F5F2]/90">
                {currentTrack.lyrics || 'Đang thưởng thức không gian âm nhạc độc lập Mindartsy.'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL FIXED BOTTOM MUSIC PLAYER */}
      {currentTrack && (
        <footer className="h-[84px] bg-[#17181C] border-t border-[#303137]/80 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-30">
          {/* Left: Track Info */}
          <div className="flex items-center gap-3 min-w-0 w-1/3">
            <img
              src={currentTrack.cover_url}
              alt={currentTrack.title}
              onClick={() => setExpandedPlayer(true)}
              className="w-12 h-12 rounded-lg object-cover cursor-pointer shrink-0"
            />
            <div className="min-w-0">
              <p
                onClick={() => navigate('track', currentTrack.id)}
                className="text-sm font-semibold text-[#F5F5F2] truncate cursor-pointer hover:underline"
              >
                {currentTrack.title}
              </p>
              <p className="text-xs text-[#A3A5AA] truncate">{currentTrack.artist_name}</p>
            </div>
            <button
              onClick={() => toggleLike(currentTrack.id)}
              className="hidden sm:block text-[#A3A5AA] hover:text-[#B9D9C3] ml-1"
            >
              <Heart className={`w-4 h-4 ${likedIds.includes(currentTrack.id) ? 'fill-[#B9D9C3] text-[#B9D9C3]' : ''}`} />
            </button>
          </div>

          {/* Center: Controls & Seek */}
          <div className="flex flex-col items-center max-w-md w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`hidden sm:block ${isShuffle ? 'text-[#B9D9C3]' : 'text-[#A3A5AA] hover:text-[#F5F5F2]'}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button onClick={handlePrevTrack} className="text-[#A3A5AA] hover:text-[#F5F5F2]">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-full bg-[#B9D9C3] text-[#101114] flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button onClick={handleNextTrack} className="text-[#A3A5AA] hover:text-[#F5F5F2]">
                <SkipForward className="w-5 h-5" />
              </button>
              <button
                onClick={() => setRepeatMode(repeatMode === 'all' ? 'one' : repeatMode === 'one' ? 'off' : 'all')}
                className={`hidden sm:block text-xs ${repeatMode !== 'off' ? 'text-[#B9D9C3]' : 'text-[#A3A5AA]'}`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-2.5 w-full mt-1.5">
              <span className="text-[11px] text-[#A3A5AA] w-9 text-right">{formatTime(progress)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={(e) => handleSeek(e.target.value)}
                className="flex-1 h-1 bg-[#303137] rounded-lg accent-[#B9D9C3] cursor-pointer"
              />
              <span className="text-[11px] text-[#A3A5AA] w-9">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Queue, Volume, Expand */}
          <div className="hidden md:flex items-center justify-end gap-3 w-1/3">
            <button
              onClick={() => shareItem(currentTrack.title, `track/${currentTrack.slug}`)}
              title="Chia sẻ bài hát"
              className="text-[#A3A5AA] hover:text-[#B9D9C3]"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={showQueue ? 'text-[#B9D9C3]' : 'text-[#A3A5AA] hover:text-[#F5F5F2]'}
            >
              <ListMusic className="w-4 h-4" />
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className="text-[#A3A5AA] hover:text-[#F5F5F2]">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setIsMuted(false);
                setVolume(Number(e.target.value));
              }}
              className="w-20 h-1 bg-[#303137] rounded-lg accent-[#B9D9C3] cursor-pointer"
            />
            <button onClick={() => setExpandedPlayer(true)} className="text-[#A3A5AA] hover:text-[#F5F5F2]">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </footer>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden h-14 bg-[#101114] border-t border-[#303137] flex items-center justify-around shrink-0">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'search', label: 'Search', icon: Search },
          { id: 'library', label: 'Library', icon: Library },
          { id: 'admin', label: 'Studio', icon: Upload },
        ].map((item) => {
          const Icon = item.icon;
          const active = route.page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-0.5 text-[10px] ${
                active ? 'text-[#B9D9C3]' : 'text-[#A3A5AA]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
