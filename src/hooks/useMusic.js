import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'daq_music_volume';
const DEFAULT_VOLUME = 0.75;

function getStoredVolume() {
  return parseFloat(localStorage.getItem(STORAGE_KEY) ?? DEFAULT_VOLUME);
}

// Module-level so all active useMusic instances update together when volume changes
const _listeners = new Set();

function setGlobalVolume(v) {
  const clamped = Math.max(0, Math.min(1.2, v));
  localStorage.setItem(STORAGE_KEY, String(clamped));
  _listeners.forEach(fn => fn(clamped));
}

// Use this in any component that needs to read or set the master music volume
export function useMusicVolume() {
  const [volume, setVolume] = useState(getStoredVolume);

  useEffect(() => {
    _listeners.add(setVolume);
    return () => _listeners.delete(setVolume);
  }, []);

  return [volume, setGlobalVolume];
}

// ── UI volume (menu/button sounds) ───────────────────────────────────────────
const UI_STORAGE_KEY = 'daq_ui_volume';
const UI_DEFAULT_VOLUME = 1.0;


function getStoredUiVolume() {
  return parseFloat(localStorage.getItem(UI_STORAGE_KEY) ?? UI_DEFAULT_VOLUME);
}

let _uiVolume = getStoredUiVolume();
const _uiListeners = new Set();

export function getUiVolume() {
  return _uiVolume;
}

function setGlobalUiVolume(v) {
  _uiVolume = Math.max(0, Math.min(1.0, v));
  localStorage.setItem(UI_STORAGE_KEY, String(_uiVolume));
  _uiListeners.forEach(fn => fn(_uiVolume));
}

export function useUiVolume() {
  const [volume, setVolume] = useState(getStoredUiVolume);

  useEffect(() => {
    _uiListeners.add(setVolume);
    return () => _uiListeners.delete(setVolume);
  }, []);

  return [volume, setGlobalUiVolume];
}

// ── SFX volume (battle sound effects) ────────────────────────────────────────
const SFX_STORAGE_KEY = 'daq_sfx_volume';
const SFX_DEFAULT_VOLUME = 0.7;

function getStoredSfxVolume() {
  return parseFloat(localStorage.getItem(SFX_STORAGE_KEY) ?? SFX_DEFAULT_VOLUME);
}

let _sfxVolume = getStoredSfxVolume();
const _sfxListeners = new Set();

export function getSfxVolume() {
  return _sfxVolume;
}

function setGlobalSfxVolume(v) {
  _sfxVolume = Math.max(0, Math.min(1.0, v));
  localStorage.setItem(SFX_STORAGE_KEY, String(_sfxVolume));
  _sfxListeners.forEach(fn => fn(_sfxVolume));
}

export function useSfxVolume() {
  const [volume, setVolume] = useState(getStoredSfxVolume);

  useEffect(() => {
    _sfxListeners.add(setVolume);
    return () => _sfxListeners.delete(setVolume);
  }, []);

  return [volume, setGlobalSfxVolume];
}

// Plays a single music track. Cleans up on unmount or when deps change.
// baseVolume  — the track's natural mix level (from scenario data or a hardcoded default)
// enabled     — set false to stop without unmounting (e.g. when entering RESULT phase)
// restartKey  — change this value to restart the track from the beginning (e.g. gs.retryKey)
export function useMusic(src, { loop = true, baseVolume = 0.2, enabled = true, restartKey } = {}) {
  const audioRef = useRef(null);
  const [masterVolume, setMasterVolume] = useState(getStoredVolume);

  useEffect(() => {
    _listeners.add(setMasterVolume);
    return () => _listeners.delete(setMasterVolume);
  }, []);

  // Start / stop the track
  useEffect(() => {
    if (!src || !enabled) return;
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = Math.min(1, baseVolume * getStoredVolume());
    audio.play().catch(() => {});
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, [src, loop, enabled, restartKey]); // baseVolume and masterVolume intentionally omitted — volume syncs via the effect below

  // Sync volume without restarting the track
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1, baseVolume * masterVolume);
    }
  }, [masterVolume, baseVolume]);
}
