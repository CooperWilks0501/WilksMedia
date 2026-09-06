// Little DAW: OPFS-backed project storage + Web Audio/Tone playback engine.
import * as Tone from "tone";

// ---------------------------------------------------------------- types

export type FxName = "reverb" | "delay" | "comp" | "dist";

export type Fx = { on: boolean; amt: number }; // amt 0..1

export type Track = {
  id: string;
  name: string;
  file: string | null; // filename inside the project dir
  gain: number; // 0..1.5
  pan: number; // -1..1
  mute: boolean;
  solo: boolean;
  trimMs: number; // front trim that aligns the take with song time zero
  fx: Record<FxName, Fx>;
  eq: { lo: number; mid: number; hi: number }; // dB, -12..12
};

export type Project = {
  name: string;
  bpm: number;
  click: boolean;
  bleedGuard: boolean; // let iOS echo-cancel speaker bleed out of new takes
  inputId: string; // deviceId of the mic to record from; "" means system default
  offsetMs: number; // manual sync nudge applied to every new take
  tracks: Track[];
};

export type Entry = { name: string; kind: "folder" | "project"; tracks?: number };

export const FX_LABELS: Record<FxName, string> = {
  reverb: "Reverb",
  delay: "Delay",
  comp: "Compressor",
  dist: "Distortion"
};

export function newTrack(name: string): Track {
  return {
    id: Math.random().toString(36).slice(2, 10),
    name,
    file: null,
    gain: 0.8,
    pan: 0,
    mute: false,
    solo: false,
    trimMs: 0,
    fx: {
      reverb: { on: false, amt: 0.3 },
      delay: { on: false, amt: 0.25 },
      comp: { on: false, amt: 0.5 },
      dist: { on: false, amt: 0.3 }
    },
    eq: { lo: 0, mid: 0, hi: 0 }
  };
}

export function newProject(name: string): Project {
  return { name, bpm: 92, click: true, bleedGuard: true, inputId: "", offsetMs: 0, tracks: [] };
}

// ------------------------------------------------------------------ fs
// OPFS *is* a hierarchical filesystem, so folders are real directories and a
// project is just a directory holding project.json plus its audio clips.

const ROOT = "littledaw";

export function sanitize(name: string) {
  return name.replace(/[\/\\:*?"<>|]/g, "-").trim().slice(0, 60) || "Untitled";
}

async function root(): Promise<FileSystemDirectoryHandle> {
  const opfs = await navigator.storage.getDirectory();
  return opfs.getDirectoryHandle(ROOT, { create: true });
}

export async function dirAt(path: string[], create = false): Promise<FileSystemDirectoryHandle> {
  let dir = await root();
  for (const seg of path) dir = await dir.getDirectoryHandle(seg, { create });
  return dir;
}

// A directory is a project if it holds project.json; otherwise it is a folder.
async function isProject(dir: FileSystemDirectoryHandle) {
  try {
    await dir.getFileHandle("project.json");
    return true;
  } catch {
    return false;
  }
}

export async function list(path: string[]): Promise<Entry[]> {
  const dir = await dirAt(path, true);
  const out: Entry[] = [];
  // @ts-expect-error values() exists on OPFS handles but is missing from lib.dom
  for await (const handle of dir.values()) {
    if (handle.kind !== "directory") continue;
    const d = handle as FileSystemDirectoryHandle;
    if (await isProject(d)) {
      const p = await readProject([...path, d.name]).catch(() => null);
      out.push({ name: d.name, kind: "project", tracks: p?.tracks.length ?? 0 });
    } else {
      out.push({ name: d.name, kind: "folder" });
    }
  }
  return out.sort((a, b) =>
    a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "folder" ? -1 : 1
  );
}

export async function readProject(path: string[]): Promise<Project> {
  const dir = await dirAt(path);
  const file = await (await dir.getFileHandle("project.json")).getFile();
  const saved = JSON.parse(await file.text()) as Partial<Project>;
  // merge over defaults so projects written by older builds pick up new fields
  return { ...newProject(saved.name ?? "Untitled"), ...saved };
}

export async function writeProject(path: string[], project: Project) {
  const dir = await dirAt(path, true);
  await writeFile(dir, "project.json", new Blob([JSON.stringify(project)], { type: "application/json" }));
}

// ponytail: createWritable only — Safari 17+. Older WebKit needs a worker
// sync-access-handle shim; add it if a write ever actually fails in the wild.
export async function writeFile(dir: FileSystemDirectoryHandle, name: string, blob: Blob) {
  const handle = await dir.getFileHandle(name, { create: true });
  const w = await handle.createWritable();
  await w.write(blob);
  await w.close();
}

export async function readFile(path: string[], name: string): Promise<File> {
  const dir = await dirAt(path);
  return (await dir.getFileHandle(name)).getFile();
}

export async function mkdir(path: string[], name: string) {
  await (await dirAt(path, true)).getDirectoryHandle(sanitize(name), { create: true });
}

export async function remove(path: string[], name: string) {
  await (await dirAt(path)).removeEntry(name, { recursive: true });
}

// OPFS has no rename/move, so copy the tree then drop the original.
// ponytail: recursive copy, fine at phone-song sizes; revisit if projects get big.
async function copyDir(from: FileSystemDirectoryHandle, to: FileSystemDirectoryHandle) {
  // @ts-expect-error values() exists on OPFS handles but is missing from lib.dom
  for await (const h of from.values()) {
    if (h.kind === "file") {
      await writeFile(to, h.name, await (h as FileSystemFileHandle).getFile());
    } else {
      const sub = await to.getDirectoryHandle(h.name, { create: true });
      await copyDir(h as FileSystemDirectoryHandle, sub);
    }
  }
}

export async function copy(path: string[], name: string, toPath: string[], toName: string) {
  const from = await dirAt([...path, name]);
  const to = await (await dirAt(toPath, true)).getDirectoryHandle(sanitize(toName), { create: true });
  await copyDir(from, to);
}

export async function move(path: string[], name: string, toPath: string[], toName: string) {
  await copy(path, name, toPath, toName);
  await remove(path, name);
}

// Every folder in the tree, for the "Move to..." picker.
export async function allFolders(path: string[] = []): Promise<string[][]> {
  const out: string[][] = [path];
  for (const e of await list(path)) {
    if (e.kind === "folder") out.push(...(await allFolders([...path, e.name])));
  }
  return out;
}

export async function requestPersist() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
    /* not fatal — WAV export is the real safety net */
  }
}

// --------------------------------------------------------------- engine

// `ready` resolves when Reverb has generated its impulse response. Live
// playback can ignore it (it fills in within ms); an offline render MUST await
// it or the mixdown comes out with no reverb at all.
// `ready` resolves when Reverb has generated its impulse response. Live
// playback can ignore it (it fills in within ms); an offline render MUST await
// it or the mixdown comes out with no reverb at all.
type Chain = {
  player: Tone.Player;
  meter: Tone.Meter;
  vol: Tone.PanVol;
  eq: Tone.EQ3;
  comp: Tone.Compressor;
  dist: Tone.Distortion;
  delay: Tone.FeedbackDelay;
  reverb: Tone.Reverb;
  ready: Promise<unknown>;
};

const RAMP = 0.02; // short ramp so live slider moves don't click

/** Push a track's settings onto its live nodes. Called both when the chain is
 *  built and on every change while playing, so the mixer is editable on the fly. */
export function applyTrack(c: Chain, t: Track, anySolo: boolean, ramp = RAMP) {
  // Always linearRampTo, never rampTo: rampTo picks an EXPONENTIAL ramp for
  // decibel params, and an exponential ramp through or to zero yields NaN,
  // which silences the whole chain downstream. Compressor.threshold holds
  // negative dB and targets 0 when bypassed, so it hits exactly that case.
  // gainToDb(0) is -Infinity, and any ramp rejects a non-finite target.
  c.vol.volume.linearRampTo(t.gain > 0.001 ? Tone.gainToDb(t.gain) : -60, ramp);
  c.vol.pan.linearRampTo(t.pan, ramp);
  c.vol.mute = !isAudible(t, anySolo);

  c.eq.low.linearRampTo(t.eq.lo, ramp);
  c.eq.mid.linearRampTo(t.eq.mid, ramp);
  c.eq.high.linearRampTo(t.eq.hi, ramp);

  c.comp.threshold.linearRampTo(t.fx.comp.on ? -6 - t.fx.comp.amt * 34 : 0, ramp);
  c.comp.ratio.linearRampTo(t.fx.comp.on ? 1 + t.fx.comp.amt * 11 : 1, ramp);

  // setting .distortion rebuilds a 4096-sample waveshaper curve, so skip it
  // unless the knob actually moved
  if (c.dist.distortion !== t.fx.dist.amt) c.dist.distortion = t.fx.dist.amt;
  c.dist.wet.linearRampTo(t.fx.dist.on ? 1 : 0, ramp);
  c.delay.wet.linearRampTo(t.fx.delay.on ? t.fx.delay.amt : 0, ramp);
  // ponytail: reverb decay is fixed and the knob rides wet only. Changing decay
  // regenerates the impulse response asynchronously, which is not something to
  // do on every frame of a slider drag.
  c.reverb.wet.linearRampTo(t.fx.reverb.on ? t.fx.reverb.amt : 0, ramp);
}

function buildChain(t: Track, buffer: AudioBuffer, anySolo: boolean, dest: Tone.InputNode): Chain {
  const player = new Tone.Player(buffer);
  const eq = new Tone.EQ3(0, 0, 0);
  const comp = new Tone.Compressor();
  const dist = new Tone.Distortion();
  const delay = new Tone.FeedbackDelay({ delayTime: 0.3, feedback: 0.3, wet: 0 });
  const reverb = new Tone.Reverb({ decay: 3, wet: 0 });
  const vol = new Tone.PanVol();
  const meter = new Tone.Meter({ smoothing: 0.7 });

  player.chain(eq, comp, dist, delay, reverb, vol, dest);
  vol.connect(meter);

  const chain = { player, meter, vol, eq, comp, dist, delay, reverb, ready: reverb.ready };
  applyTrack(chain, t, anySolo, 0);
  return chain;
}

function clickAt(ctx: BaseAudioContext, time: number, accent: boolean) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.frequency.value = accent ? 1600 : 1000;
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.25, time + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
  osc.connect(g).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.06);
}

/** Solo wins over everything except an explicit mute: with any track soloed,
 *  only soloed tracks are heard. Easy to get backwards, hence the self-check. */
export function isAudible(t: { mute: boolean; solo: boolean }, anySolo: boolean) {
  return !t.mute && (!anySolo || t.solo);
}

/** Loudest absolute sample in the buffer. */
export function peak(buf: AudioBuffer) {
  let max = 0;
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < d.length; i++) {
      const v = Math.abs(d[i]);
      if (v > max) max = v;
    }
  }
  return max;
}

/** Fader setting that brings a take to a sane level. iOS mic input is quiet
 *  and we deliberately record with AGC off, so takes need making up. */
export function normalizeGain(buf: AudioBuffer) {
  const p = peak(buf);
  if (p < 0.0005) return 0.8; // silence: leave it alone rather than boosting noise
  return Math.max(0.1, Math.min(MAX_GAIN, 0.7 / p));
}

export const MAX_GAIN = 4;

export function encodeWav(buf: AudioBuffer): Blob {
  const chans = buf.numberOfChannels;
  const frames = buf.length;
  const bytes = new ArrayBuffer(44 + frames * chans * 2);
  const view = new DataView(bytes);
  const str = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  str(0, "RIFF");
  view.setUint32(4, 36 + frames * chans * 2, true);
  str(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, chans, true);
  view.setUint32(24, buf.sampleRate, true);
  view.setUint32(28, buf.sampleRate * chans * 2, true);
  view.setUint16(32, chans * 2, true);
  view.setUint16(34, 16, true);
  str(36, "data");
  view.setUint32(40, frames * chans * 2, true);

  const data = Array.from({ length: chans }, (_, c) => buf.getChannelData(c));
  let off = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < chans; c++) {
      const s = Math.max(-1, Math.min(1, data[c][i]));
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
  }
  return new Blob([bytes], { type: "audio/wav" });
}

export class Engine {
  buffers = new Map<string, AudioBuffer>(); // track.id -> decoded take
  private chains: Chain[] = [];
  private chainIds: string[] = [];
  private master: Tone.Limiter | null = null;
  private startedAt = 0;
  private startOffset = 0;
  playing = false;

  /** Bring the audio clock back up. iOS suspends or "interrupts" the context
   *  whenever the audio session changes — opening the mic does exactly that —
   *  and a stopped context never advances currentTime, so nothing scheduled
   *  ever fires. Call before anything that schedules, not just on first touch. */
  async unlock() {
    await Tone.start();
    const raw = Tone.getContext().rawContext as unknown as AudioContext;
    if (raw.state !== "running") await raw.resume();
  }

  async loadTrack(id: string, file: File) {
    const raw = await file.arrayBuffer();
    this.buffers.set(id, await Tone.getContext().decodeAudioData(raw));
  }

  /** Song length in seconds: the longest take once its front trim is removed. */
  duration(p: Project) {
    let d = 0;
    for (const t of p.tracks) {
      const b = this.buffers.get(t.id);
      if (b) d = Math.max(d, b.duration - Math.max(0, t.trimMs) / 1000);
    }
    return d;
  }

  /** Starts playback; returns the context time playback begins at, so a
   *  simultaneous recording can be trimmed to line up with song time zero. */
  play(p: Project, from = 0, countIn = false, skipId?: string) {
    this.stop();
    const ctx = Tone.getContext();
    const anySolo = p.tracks.some((t) => t.solo);
    const spb = 60 / p.bpm;
    const lead = countIn ? 0.08 + spb * 4 : 0.08; // never schedule into the past
    const at = ctx.currentTime + lead;

    if (countIn && p.click) {
      const raw = ctx.rawContext as unknown as BaseAudioContext;
      for (let i = 0; i < 4; i++) clickAt(raw, ctx.currentTime + 0.08 + i * spb, i === 0);
    }

    this.master = new Tone.Limiter(-1).toDestination();
    for (const t of p.tracks) {
      const buf = this.buffers.get(t.id);
      if (!buf || t.id === skipId) continue;
      const chain = buildChain(t, buf, anySolo, this.master);
      const offset = Math.max(0, t.trimMs) / 1000 + from;
      if (offset < buf.duration) chain.player.start(at, offset);
      this.chains.push(chain);
      this.chainIds.push(t.id);
    }
    this.startedAt = at;
    this.startOffset = from;
    this.playing = true;
    return at;
  }

  /** Re-apply every track's settings to the running graph, without restarting. */
  update(p: Project) {
    if (!this.playing) return;
    const anySolo = p.tracks.some((t) => t.solo);
    this.chains.forEach((c, i) => {
      const t = p.tracks.find((x) => x.id === this.chainIds[i]);
      if (t) applyTrack(c, t, anySolo);
    });
  }

  position() {
    if (!this.playing) return this.startOffset;
    return Math.max(0, Tone.getContext().currentTime - this.startedAt) + this.startOffset;
  }

  /** Normalized 0..1 level per track id, for the row meters. */
  levels(): Record<string, number> {
    const out: Record<string, number> = {};
    this.chains.forEach((c, i) => {
      const v = c.meter.getValue();
      const db = typeof v === "number" ? v : v[0];
      out[this.chainIds[i]] = Math.max(0, Math.min(1, (db + 60) / 60));
    });
    return out;
  }

  stop() {
    for (const c of this.chains) {
      try {
        c.player.stop();
      } catch {
        /* already stopped */
      }
      for (const n of [c.player, c.meter, c.vol, c.eq, c.comp, c.dist, c.delay, c.reverb]) n.dispose();
    }
    this.chains = [];
    this.chainIds = [];
    this.master?.dispose();
    this.master = null;
    this.playing = false;
  }

  /** Offline mixdown with every effect applied, ready for encodeWav. */
  async render(p: Project): Promise<AudioBuffer> {
    const dur = this.duration(p);
    if (dur <= 0) throw new Error("Nothing to export yet.");
    const anySolo = p.tracks.some((t) => t.solo);
    const rendered = await Tone.Offline(async () => {
      const master = new Tone.Limiter(-1).toDestination();
      const chains = [];
      for (const t of p.tracks) {
        const buf = this.buffers.get(t.id);
        if (!buf) continue;
        chains.push(buildChain(t, buf, anySolo, master));
        chains[chains.length - 1].player.start(0, Math.max(0, t.trimMs) / 1000);
      }
      await Promise.all(chains.map((c) => c.ready));
    }, dur);
    return rendered.get() as AudioBuffer;
  }
}

/** Audio inputs available for recording. Labels are blank until the user has
 *  granted mic permission at least once, so call after a successful capture. */
export async function listInputs(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  const all = await navigator.mediaDevices.enumerateDevices();
  return all.filter((d) => d.kind === "audioinput");
}

export function pickMime() {
  const opts = ["audio/mp4", "audio/aac", "audio/webm;codecs=opus", "audio/webm"];
  return opts.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
}

export function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}.${String(Math.floor((s % 1) * 10))}`;
}

export function ctxTime() {
  return Tone.getContext().currentTime;
}
