const video = document.getElementById('video-player');
const playerStage = document.getElementById('player-stage');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');
const seekBar = document.getElementById('seek-bar');
const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');
const loopBtn = document.getElementById('loop-btn');
const autoAdvanceBtn = document.getElementById('autoadvance-btn');
const speedSelect = document.getElementById('speed-select');
const filterSelect = document.getElementById('filter-select');
const subtitleInput = document.getElementById('subtitle-input');
const ccBtn = document.getElementById('cc-btn');
const pipBtn = document.getElementById('pip-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const toggleAmbientBtn = document.getElementById('toggle-ambient-btn');
const ambientColorInput = document.getElementById('ambient-color');
const toggleShortcutsBtn = document.getElementById('toggle-shortcuts-btn');
const closeShortcutsBtn = document.getElementById('close-shortcuts-btn');
const shortcutsModal = document.getElementById('shortcuts-modal');
const playlistListEl = document.getElementById('playlist-list');
const playlistCountEl = document.getElementById('playlist-count');
const addVideoForm = document.getElementById('add-video-form');
const newTitleInput = document.getElementById('new-title');
const newUrlInput = document.getElementById('new-url');
const osdToast = document.getElementById('osd-toast');

let playlist = [
  {
    title: 'Big Buck Bunny (Sample)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    title: 'Elephants Dream (Sample)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    title: 'Tears of Steel (Sample)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  }
];

let currentIndex = 0;
let autoAdvance = true;
let subtitlesEnabled = false;
let activeTrackUrl = null;
let toastTimer = null;

function showToast(msg) {
  osdToast.textContent = msg;
  osdToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => osdToast.classList.remove('show'), 1400);
}

function formatTime(sec) {
  if (!Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function loadVideo(index, autoplay = true) {
  if (playlist.length === 0) return;
  currentIndex = (index + playlist.length) % playlist.length;
  const item = playlist[currentIndex];
  video.src = item.url;
  video.playbackRate = parseFloat(speedSelect.value);
  renderPlaylist();
  if (autoplay) {
    video.play().catch(() => {});
  }
}

function renderPlaylist() {
  playlistListEl.innerHTML = '';
  playlistCountEl.textContent = `${playlist.length} Video${playlist.length === 1 ? '' : 's'}`;

  playlist.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = `playlist-item ${idx === currentIndex ? 'active' : ''}`;
    li.innerHTML = `
      <div class="item-meta">
        <span class="item-title">${idx + 1}. ${item.title}</span>
        <span class="item-url">${item.url}</span>
      </div>
      <div class="item-actions">
        <button type="button" class="mini-btn" data-action="up" data-idx="${idx}">Up</button>
        <button type="button" class="mini-btn" data-action="down" data-idx="${idx}">Down</button>
        <button type="button" class="mini-btn" data-action="remove" data-idx="${idx}">Remove</button>
      </div>
    `;

    li.addEventListener('click', (e) => {
      if (e.target.dataset.action) return;
      loadVideo(idx, true);
    });

    playlistListEl.appendChild(li);
  });
}

playlistListEl.addEventListener('click', (e) => {
  const action = e.target.dataset.action;
  if (!action) return;
  const idx = Number(e.target.dataset.idx);

  if (action === 'up' && idx > 0) {
    [playlist[idx - 1], playlist[idx]] = [playlist[idx], playlist[idx - 1]];
    if (currentIndex === idx) currentIndex--;
    else if (currentIndex === idx - 1) currentIndex++;
    renderPlaylist();
  } else if (action === 'down' && idx < playlist.length - 1) {
    [playlist[idx + 1], playlist[idx]] = [playlist[idx], playlist[idx + 1]];
    if (currentIndex === idx) currentIndex++;
    else if (currentIndex === idx + 1) currentIndex--;
    renderPlaylist();
  } else if (action === 'remove') {
    playlist.splice(idx, 1);
    if (playlist.length === 0) {
      video.removeAttribute('src');
      video.load();
    } else if (idx <= currentIndex) {
      currentIndex = Math.max(0, currentIndex - 1);
      loadVideo(currentIndex, false);
    }
    renderPlaylist();
  }
});

addVideoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = newTitleInput.value.trim();
  const url = newUrlInput.value.trim();
  if (!title || !url) return;
  playlist.push({ title, url });
  newTitleInput.value = '';
  newUrlInput.value = '';
  renderPlaylist();
  showToast(`Added: ${title}`);
  if (playlist.length === 1) {
    loadVideo(0, true);
  }
});

function togglePlay() {
  if (video.paused) {
    video.play().catch(() => {});
  } else {
    video.pause();
  }
}

playPauseBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => loadVideo(currentIndex - 1, true));
nextBtn.addEventListener('click', () => loadVideo(currentIndex + 1, true));

video.addEventListener('play', () => {
  playPauseBtn.textContent = 'Pause';
});

video.addEventListener('pause', () => {
  playPauseBtn.textContent = 'Play';
});

video.addEventListener('loadedmetadata', () => {
  durationTimeEl.textContent = formatTime(video.duration);
  seekBar.value = 0;
});

video.addEventListener('timeupdate', () => {
  currentTimeEl.textContent = formatTime(video.currentTime);
  if (video.duration) {
    seekBar.value = (video.currentTime / video.duration) * 100;
  }
});

video.addEventListener('ended', () => {
  if (!video.loop && autoAdvance && playlist.length > 1) {
    loadVideo(currentIndex + 1, true);
  }
});

seekBar.addEventListener('input', () => {
  if (video.duration) {
    video.currentTime = (seekBar.value / 100) * video.duration;
  }
});

function toggleMute() {
  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
  muteBtn.classList.toggle('active', video.muted);
  showToast(video.muted ? 'Muted' : `Volume: ${Math.round(video.volume * 100)}%`);
}

muteBtn.addEventListener('click', toggleMute);

volumeSlider.addEventListener('input', () => {
  video.volume = parseFloat(volumeSlider.value);
  video.muted = video.volume === 0;
  muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
  muteBtn.classList.toggle('active', video.muted);
});

function toggleLoop() {
  video.loop = !video.loop;
  loopBtn.textContent = `Loop: ${video.loop ? 'On' : 'Off'}`;
  loopBtn.classList.toggle('active', video.loop);
  showToast(`Loop ${video.loop ? 'Enabled' : 'Disabled'}`);
}

loopBtn.addEventListener('click', toggleLoop);

function toggleAutoAdvance() {
  autoAdvance = !autoAdvance;
  autoAdvanceBtn.textContent = `Auto-Next: ${autoAdvance ? 'On' : 'Off'}`;
  autoAdvanceBtn.classList.toggle('active', autoAdvance);
  showToast(`Auto-Advance ${autoAdvance ? 'On' : 'Off'}`);
}

autoAdvanceBtn.addEventListener('click', toggleAutoAdvance);

speedSelect.addEventListener('change', () => {
  video.playbackRate = parseFloat(speedSelect.value);
  showToast(`Speed: ${video.playbackRate}x`);
});

filterSelect.addEventListener('change', () => {
  video.className = '';
  if (filterSelect.value !== 'none') {
    video.classList.add(`filter-${filterSelect.value}`);
  }
  showToast(`Filter: ${filterSelect.options[filterSelect.selectedIndex].text}`);
});

function srtToVtt(srtText) {
  const vttBody = srtText
    .replace(/+/g, '')
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
  return `WEBVTT

${vttBody}`;
}

subtitleInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let content = reader.result;
    if (file.name.toLowerCase().endsWith('.srt')) {
      content = srtToVtt(content);
    }
    if (activeTrackUrl) URL.revokeObjectURL(activeTrackUrl);
    const blob = new Blob([content], { type: 'text/vtt' });
    activeTrackUrl = URL.createObjectURL(blob);

    Array.from(video.querySelectorAll('track')).forEach((t) => t.remove());
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = file.name;
    track.srclang = 'en';
    track.src = activeTrackUrl;
    track.default = true;
    video.appendChild(track);

    subtitlesEnabled = true;
    setTimeout(() => {
      if (video.textTracks[0]) {
        video.textTracks[0].mode = 'showing';
      }
    }, 50);

    ccBtn.disabled = false;
    ccBtn.textContent = 'CC: On';
    ccBtn.classList.add('active');
    showToast(`Loaded subtitles: ${file.name}`);
  };
  reader.readAsText(file);
});

function toggleSubtitles() {
  if (ccBtn.disabled || !video.textTracks[0]) return;
  subtitlesEnabled = !subtitlesEnabled;
  video.textTracks[0].mode = subtitlesEnabled ? 'showing' : 'hidden';
  ccBtn.textContent = `CC: ${subtitlesEnabled ? 'On' : 'Off'}`;
  ccBtn.classList.toggle('active', subtitlesEnabled);
  showToast(`Subtitles ${subtitlesEnabled ? 'On' : 'Off'}`);
}

ccBtn.addEventListener('click', toggleSubtitles);

async function togglePiP() {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      await video.requestPictureInPicture();
    }
  } catch (err) {
    showToast('PiP unavailable for this video');
  }
}

pipBtn.addEventListener('click', togglePiP);

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    playerStage.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);

function toggleAmbient() {
  const isOn = document.body.classList.toggle('ambient-on');
  toggleAmbientBtn.textContent = `Theater Lights: ${isOn ? 'ON' : 'OFF'}`;
  toggleAmbientBtn.classList.toggle('active', isOn);
}

toggleAmbientBtn.addEventListener('click', toggleAmbient);

ambientColorInput.addEventListener('input', (e) => {
  document.documentElement.style.setProperty('--ambient-color', e.target.value);
});

toggleShortcutsBtn.addEventListener('click', () => {
  shortcutsModal.classList.toggle('hidden');
});

closeShortcutsBtn.addEventListener('click', () => {
  shortcutsModal.classList.add('hidden');
});

document.addEventListener('keydown', (e) => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

  switch (e.key.toLowerCase()) {
    case ' ':
    case 'k':
      e.preventDefault();
      togglePlay();
      break;
    case 'm':
      toggleMute();
      break;
    case 'f':
      toggleFullscreen();
      break;
    case 'i':
      togglePiP();
      break;
    case 'l':
      toggleLoop();
      break;
    case 'a':
      toggleAutoAdvance();
      break;
    case 'c':
      toggleSubtitles();
      break;
    case 't':
      toggleAmbient();
      break;
    case 'n':
      loadVideo(currentIndex + 1, true);
      break;
    case 'p':
      loadVideo(currentIndex - 1, true);
      break;
    case 'arrowleft':
      video.currentTime = Math.max(0, video.currentTime - 5);
      showToast('-5s');
      break;
    case 'arrowright':
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
      showToast('+5s');
      break;
    case 'arrowup':
      e.preventDefault();
      video.volume = Math.min(1, +(video.volume + 0.05).toFixed(2));
      volumeSlider.value = video.volume;
      video.muted = false;
      showToast(`Volume: ${Math.round(video.volume * 100)}%`);
      break;
    case 'arrowdown':
      e.preventDefault();
      video.volume = Math.max(0, +(video.volume - 0.05).toFixed(2));
      volumeSlider.value = video.volume;
      showToast(`Volume: ${Math.round(video.volume * 100)}%`);
      break;
    case '?':
      shortcutsModal.classList.toggle('hidden');
      break;
  }
});

loadVideo(0, false);
