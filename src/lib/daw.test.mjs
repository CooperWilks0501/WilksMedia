// Self-check for the two bits of non-trivial math in Little DAW:
// the WAV header/PCM encoder and the take-alignment trim.
// Run: node src/lib/daw.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// daw.ts pulls in Tone (needs a browser AudioContext), so compile the file and
// evaluate only the pure functions under test.
const src = readFileSync(new URL("./daw.ts", import.meta.url), "utf8");
const body = src.slice(src.indexOf("export function peak"), src.indexOf("export class Engine"));
const js = ts.transpileModule(body, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }
}).outputText;
const { encodeWav, peak, normalizeGain, MAX_GAIN } = await import("data:text/javascript," + encodeURIComponent(js));

// --- encodeWav: header fields and sample round-trip -----------------------
const sampleRate = 48000, frames = 100;
const left = new Float32Array(frames).fill(0.5);
const right = new Float32Array(frames).fill(-0.5);
const fake = {
  numberOfChannels: 2, length: frames, sampleRate,
  getChannelData: (c) => (c === 0 ? left : right)
};
const buf = Buffer.from(await encodeWav(fake).arrayBuffer());

assert.equal(buf.subarray(0, 4).toString(), "RIFF");
assert.equal(buf.subarray(8, 12).toString(), "WAVE");
assert.equal(buf.readUInt16LE(22), 2, "channel count");
assert.equal(buf.readUInt32LE(24), sampleRate, "sample rate");
assert.equal(buf.readUInt32LE(28), sampleRate * 2 * 2, "byte rate");
assert.equal(buf.readUInt16LE(34), 16, "bit depth");
assert.equal(buf.readUInt32LE(40), frames * 2 * 2, "data size");
assert.equal(buf.length, 44 + frames * 2 * 2, "total length");
// interleaved L,R — 0.5 and -0.5 at 16-bit
assert.equal(buf.readInt16LE(44), 16383); // 0.5 * 0x7fff, truncated by setInt16
assert.equal(buf.readInt16LE(46), -0.5 * 0x8000);
// clipping must not wrap around to the opposite sign
const hot = { numberOfChannels: 1, length: 2, sampleRate, getChannelData: () => new Float32Array([9, -9]) };
const hotBuf = Buffer.from(await encodeWav(hot).arrayBuffer());
assert.equal(hotBuf.readInt16LE(44), 0x7fff, "positive clip");
assert.equal(hotBuf.readInt16LE(46), -0x8000, "negative clip");

// --- take alignment ------------------------------------------------------
// The recorder starts first, playback is scheduled `lead` seconds later, so the
// count-in must be trimmed off the front of the take or every overdub drifts.
const trim = (recStart, playStart, offsetMs) => (playStart - recStart) * 1000 + offsetMs;
const bpm = 92, lead = 0.08 + (60 / bpm) * 4;
assert.ok(Math.abs(trim(10, 10 + lead, 0) - lead * 1000) < 1e-6, "trims the whole count-in");
assert.ok(trim(10, 10 + lead, 0) > 2000, "4 beats at 92bpm is over 2s");
// more trim = more removed from the front = the take lands earlier
assert.equal(trim(10, 10.5, 50), 550, "positive nudge pulls the take earlier");
assert.equal(trim(10, 10.5, -50), 450, "negative nudge pushes it later");

// --- level normalization -------------------------------------------------
// iOS records quiet with AGC off, so the fader is set from the take's peak.
// Float32Array rounds, so compare with a tolerance.
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg} (got ${a}, want ${b})`);
const mono = (samples) => ({
  numberOfChannels: 1, length: samples.length, sampleRate,
  getChannelData: () => Float32Array.from(samples)
});

near(peak(mono([0.1, -0.6, 0.3])), 0.6, "peak scans both signs");
near(peak({ numberOfChannels: 2, length: 1, sampleRate,
  getChannelData: (c) => Float32Array.from([c === 0 ? 0.2 : 0.9]) }), 0.9, "peak scans every channel");

near(normalizeGain(mono([0.35])), 2, "half-level take gets 2x");
near(normalizeGain(mono([1.0])), 0.7, "peaking take is pulled down, not left alone");
assert.ok(normalizeGain(mono([1.0])) < 1, "hot take must attenuate");
assert.equal(normalizeGain(mono([0.07])), MAX_GAIN, "very quiet take clamps at max gain");
assert.equal(normalizeGain(mono([0, 0.0001, -0.0002])), 0.8, "silence keeps the default fader");
for (const p of [0.001, 0.05, 0.2, 0.7, 1]) {
  const g = normalizeGain(mono([p]));
  assert.ok(g >= 0.1 && g <= MAX_GAIN, `gain stays in fader range for peak ${p}`);
}

console.log("daw self-check ok");
