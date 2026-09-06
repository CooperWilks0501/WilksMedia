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
  return { name, bpm: 92, click: true, offsetMs: 0, tracks: [] };
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
  return JSON.parse(await file.text()) as Project;
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
type Chain = { player: Tone.Player; meter: Tone.Meter; vol: Tone.PanVol; ready: Promise<unknown> };

function buildChain(t: Track, buffer: AudioBuffer, anySolo: boolean): Chain {
  const player = new Tone.Player(buffer);
  const eq = new Tone.EQ3(t.eq.lo, t.eq.mid, t.eq.hi);
  const comp = new Tone.Compressor({
    threshold: t.fx.comp.on ? -6 - t.fx.comp.amt * 34 : 0,
    ratio: t.fx.comp.on ? 1 + t.fx.comp.amt * 11 : 1
  });
  const dist = new Tone.Distortion({ distortion: t.fx.dist.amt, wet: t.fx.dist.on ? 1 : 0 });
  const delay = new Tone.FeedbackDelay({
    delayTime: 0.3,
    feedback: 0.3,
    wet: t.fx.delay.on ? t.fx.delay.amt : 0
  });
  const reverb = new Tone.Reverb({
    decay: 1 + t.fx.reverb.amt * 5,
    wet: t.fx.reverb.on ? t.fx.reverb.amt : 0
  });
  const audible = !t.mute && (!anySolo || t.solo);
  const vol = new Tone.PanVol(t.pan, Tone.gainToDb(audible ? t.gain : 0));
  const meter = new Tone.Meter({ smoothing: 0.7 });

  player.chain(eq, comp, dist, delay, reverb, vol, Tone.getDestination());
  vol.connect(meter);
  return { player, meter, vol, ready: reverb.ready };
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
  private startedAt = 0;
  private startOffset = 0;
  playing = false;

  async unlock() {
    await Tone.start();
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

    for (const t of p.tracks) {
      const buf = this.buffers.get(t.id);
      if (!buf || t.id === skipId) continue;
      const chain = buildChain(t, buf, anySolo);
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
      c.player.dispose();
      c.meter.dispose();
      c.vol.dispose();
    }
    this.chains = [];
    this.chainIds = [];
    this.playing = false;
  }

  /** Offline mixdown with every effect applied, ready for encodeWav. */
  async render(p: Project): Promise<AudioBuffer> {
    const dur = this.duration(p);
    if (dur <= 0) throw new Error("Nothing to export yet.");
    const anySolo = p.tracks.some((t) => t.solo);
    const rendered = await Tone.Offline(async () => {
      const chains = [];
      for (const t of p.tracks) {
        const buf = this.buffers.get(t.id);
        if (!buf) continue;
        chains.push(buildChain(t, buf, anySolo));
        chains[chains.length - 1].player.start(0, Math.max(0, t.trimMs) / 1000);
      }
      await Promise.all(chains.map((c) => c.ready));
    }, dur);
    return rendered.get() as AudioBuffer;
  }
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
