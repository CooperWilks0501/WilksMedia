import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Folder, Music2, Plus, FolderPlus, Play, Square, Circle,
  Download, MoreHorizontal, Settings2, X, SkipBack, Trash2, Pencil, FolderInput, Copy
} from "lucide-react";
import * as daw from "../lib/daw";
import type { Entry, FxName, Project, Track } from "../lib/daw";
import "../styles/littledaw.css";

const FX_ORDER: FxName[] = ["reverb", "delay", "comp", "dist"];

/** Bottom sheet. Everything modal in here is one of these — thumb-reachable. */
function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="ld-sheet__scrim" onClick={onClose}>
      <div className="ld-sheet" onClick={(e) => e.stopPropagation()}>
        <header className="ld-sheet__head">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
        </header>
        <div className="ld-sheet__body">{children}</div>
      </div>
    </div>
  );
}

function NameSheet({ title, initial, cta, onSubmit, onClose }: {
  title: string; initial: string; cta: string; onSubmit: (v: string) => void; onClose: () => void;
}) {
  const [v, setV] = useState(initial);
  return (
    <Sheet title={title} onClose={onClose}>
      <input className="ld-input" value={v} autoFocus onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && v.trim() && onSubmit(v.trim())} />
      <button className="ld-btn ld-btn--primary" disabled={!v.trim()} onClick={() => onSubmit(v.trim())}>{cta}</button>
    </Sheet>
  );
}

// ------------------------------------------------------------- browser

function Browser({ path, setPath, onOpen }: {
  path: string[]; setPath: (p: string[]) => void; onOpen: (name: string) => void;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sheet, setSheet] = useState<"song" | "folder" | "rename" | "move" | null>(null);
  const [target, setTarget] = useState<Entry | null>(null);
  const [folders, setFolders] = useState<string[][]>([]);
  const [err, setErr] = useState("");

  const refresh = useCallback(() => {
    daw.list(path).then(setEntries).catch((e) => setErr(String(e)));
  }, [path]);
  useEffect(refresh, [refresh]);

  const act = async (fn: () => Promise<unknown>) => {
    try { await fn(); } catch (e) { setErr(String(e)); }
    setSheet(null); setTarget(null); refresh();
  };

  return (
    <div className="ld-browser">
      <header className="ld-top">
        {path.length > 0 && (
          <button className="ld-top__back" onClick={() => setPath(path.slice(0, -1))} aria-label="Up one folder">
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="ld-top__title">
          <h1>Little DAW</h1>
          <p className="ld-path">/{path.join("/")}</p>
        </div>
      </header>

      {err && <p className="ld-err" onClick={() => setErr("")}>{err}</p>}

      <ul className="ld-list">
        {entries.length === 0 && <li className="ld-empty">Empty. Start a new song below.</li>}
        {entries.map((e) => (
          <li key={e.name} className="ld-row">
            <button className="ld-row__main" onClick={() => (e.kind === "folder" ? setPath([...path, e.name]) : onOpen(e.name))}>
              {e.kind === "folder" ? <Folder size={20} /> : <Music2 size={20} />}
              <span className="ld-row__name">{e.name}</span>
              <span className="ld-row__meta">
                {e.kind === "folder" ? "" : `${e.tracks} track${e.tracks === 1 ? "" : "s"}`}
              </span>
            </button>
            <button className="ld-row__more" onClick={() => setTarget(e)} aria-label={`Actions for ${e.name}`}>
              <MoreHorizontal size={20} />
            </button>
          </li>
        ))}
      </ul>

      <footer className="ld-browser__foot">
        <button className="ld-btn" onClick={() => setSheet("song")}><Plus size={18} /> New Song</button>
        <button className="ld-btn" onClick={() => setSheet("folder")}><FolderPlus size={18} /> New Folder</button>
      </footer>

      {target && !sheet && (
        <Sheet title={target.name} onClose={() => setTarget(null)}>
          <button className="ld-btn" onClick={() => setSheet("rename")}><Pencil size={18} /> Rename</button>
          <button className="ld-btn" onClick={() => { daw.allFolders().then(setFolders); setSheet("move"); }}>
            <FolderInput size={18} /> Move to…
          </button>
          <button className="ld-btn" onClick={() => act(() => daw.copy(path, target.name, path, `${target.name} copy`))}>
            <Copy size={18} /> Duplicate
          </button>
          <button className="ld-btn ld-btn--danger" onClick={() => act(() => daw.remove(path, target.name))}>
            <Trash2 size={18} /> Delete
          </button>
        </Sheet>
      )}

      {sheet === "song" && (
        <NameSheet title="New Song" initial="Untitled" cta="Create" onClose={() => setSheet(null)}
          onSubmit={(v) => act(async () => {
            const name = daw.sanitize(v);
            await daw.writeProject([...path, name], daw.newProject(name));
            onOpen(name);
          })} />
      )}
      {sheet === "folder" && (
        <NameSheet title="New Folder" initial="New Folder" cta="Create" onClose={() => setSheet(null)}
          onSubmit={(v) => act(() => daw.mkdir(path, v))} />
      )}
      {sheet === "rename" && target && (
        <NameSheet title="Rename" initial={target.name} cta="Rename" onClose={() => setSheet(null)}
          onSubmit={(v) => act(() => daw.move(path, target.name, path, v))} />
      )}
      {sheet === "move" && target && (
        <Sheet title={`Move "${target.name}" to`} onClose={() => setSheet(null)}>
          {folders.map((f) => (
            <button key={"/" + f.join("/")} className="ld-btn" disabled={f.join("/") === path.join("/")}
              onClick={() => act(() => daw.move(path, target.name, f, target.name))}>
              /{f.join("/")}
            </button>
          ))}
        </Sheet>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- song

function Song({ path, name, onExit }: { path: string[]; name: string; onExit: () => void }) {
  const dir = [...path, name];
  const [project, setProject] = useState<Project | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [fxFor, setFxFor] = useState<string | null>(null);
  const [menu, setMenu] = useState<"more" | "bpm" | "rename" | "input" | null>(null);
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  const engine = useRef(new daw.Engine()).current;
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const takeRef = useRef<{ id: string; trimMs: number } | null>(null);
  const projRef = useRef<Project | null>(null);
  projRef.current = project;

  // load project + decode every take
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const p = await daw.readProject(dir);
        if (!alive) return;
        setProject(p);
        for (const t of p.tracks) {
          if (!t.file) continue;
          await engine.loadTrack(t.id, await daw.readFile(dir, t.file));
        }
        if (alive) setProject({ ...p });
      } catch (e) { setErr(String(e)); }
    })();
    return () => { alive = false; engine.stop(); streamRef.current?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, path.join("/")]);

  // State updates immediately so the UI and the live audio graph react at once;
  // the OPFS write is debounced so dragging a fader is not hundreds of writes.
  const saveTimer = useRef<number>(0);
  const save = useCallback((p: Project) => {
    setProject(p);
    clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(
      () => daw.writeProject(dir, p).catch((e) => setErr(String(e))),
      300
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir.join("/")]);

  // flush a pending write if the screen closes mid-drag
  useEffect(() => () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      if (projRef.current) daw.writeProject(dir, projRef.current).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir.join("/")]);

  // every mixer change reaches the running audio graph without restarting it
  useEffect(() => {
    const refresh = () => daw.listInputs().then(setInputs).catch(() => {});
    refresh();
    navigator.mediaDevices?.addEventListener?.("devicechange", refresh);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", refresh);
  }, []);

  useEffect(() => {
    if (project) engine.update(project);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  const patch = (id: string, fn: (t: Track) => Track) => {
    const p = projRef.current;
    if (p) save({ ...p, tracks: p.tracks.map((t) => (t.id === id ? fn(t) : t)) });
  };

  // playhead + meters, one rAF loop
  useEffect(() => {
    if (!playing && !recording) return;
    let frame = 0;
    const tick = () => {
      setPos(engine.position());
      setLevels(engine.levels());
      if (project && !recording && engine.position() >= engine.duration(project)) stopAll();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, recording, project]);

  function stopAll() {
    engine.stop();
    setPlaying(false);
    setLevels({});
  }

  async function togglePlay() {
    if (!project) return;
    if (playing || recording) { await stopRec(); stopAll(); return; }
    await engine.unlock();
    engine.play(project, 0, false);
    setPlaying(true);
  }

  async function toggleRec() {
    if (recording) { await stopRec(); stopAll(); return; }
    const p = projRef.current;
    if (!p) return;
    try {
      await engine.unlock();
      // Acquire per take and release on stop. Holding the stream open pins
      // iOS in PlayAndRecord, which attenuates playback and can route it to
      // the earpiece — everything sounds quiet until the mic is let go.
      // echoCancellation lets iOS subtract speaker bleed from the take. It costs
      // input quality (voice-processing unit ducks and gates), so it is a
      // per-song choice: on for speaker overdubs, off when wearing headphones.
      const audio: MediaTrackConstraints = {
        echoCancellation: p.bleedGuard,
        autoGainControl: false,
        noiseSuppression: false
      };
      // A saved device can be gone (headphones unplugged), so fall back to the
      // default input rather than failing the take outright.
      if (p.inputId) audio.deviceId = { exact: p.inputId };
      streamRef.current = await navigator.mediaDevices
        .getUserMedia({ audio })
        .catch(() => navigator.mediaDevices.getUserMedia({ audio: { ...audio, deviceId: undefined } }));
      daw.listInputs().then(setInputs);
      // armed track is overwritten; nothing armed means a fresh track
      let target = p.tracks.find((t) => t.id === armed);
      let next = p;
      if (!target) {
        target = daw.newTrack(`Track ${p.tracks.length + 1}`);
        next = { ...p, tracks: [...p.tracks, target] };
        setProject(next);
        setArmed(target.id);
      }
      const id = target.id;

      const rec = new MediaRecorder(streamRef.current, { mimeType: daw.pickMime() });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstart = () => {
        // Recorder is live now; start playback in the future and remember the
        // gap, so the count-in gets trimmed off the front of the take.
        const recStart = daw.ctxTime();
        const playStart = engine.play(next, 0, true, id);
        takeRef.current = { id, trimMs: (playStart - recStart) * 1000 + next.offsetMs };
      };
      rec.onstop = async () => {
        const take = takeRef.current;
        const cur = projRef.current;
        if (!take || !cur) return;
        setBusy("Saving take…");
        try {
          const blob = new Blob(chunks, { type: rec.mimeType });
          const file = `${take.id}-${Date.now()}.dat`;
          await daw.writeFile(await daw.dirAt(dir, true), file, blob);
          await engine.loadTrack(take.id, new File([blob], file));
          // AGC is off and iOS records hot-but-quiet, so set the fader from the
          // take's actual peak rather than leaving every track at 0.8.
          const buf = engine.buffers.get(take.id);
          const gain = buf ? daw.normalizeGain(buf) : 0.8;
          save({
            ...cur,
            tracks: cur.tracks.map((t) =>
              t.id === take.id ? { ...t, file, trimMs: take.trimMs, gain } : t
            )
          });
        } catch (e) { setErr(String(e)); }
        setBusy("");
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
    } catch (e) {
      setErr(`Mic unavailable: ${e}`);
    }
  }

  async function stopRec() {
    if (recRef.current?.state === "recording") recRef.current.stop();
    recRef.current = null;
    releaseMic();
    setRecording(false);
  }

  function releaseMic() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function exportWav() {
    if (!project) return;
    setBusy("Mixing down…");
    try {
      const blob = daw.encodeWav(await engine.render(project));
      const file = new File([blob], `${project.name}.wav`, { type: "audio/wav" });
      // Share sheet is the good path on iOS; anchor download is the fallback.
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: project.name });
      else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = file.name; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch (e) { setErr(String(e)); }
    setBusy("");
  }

  async function importFile(id: string, f: File) {
    setBusy("Importing…");
    try {
      const fname = `${id}-${Date.now()}.dat`;
      await daw.writeFile(await daw.dirAt(dir, true), fname, f);
      await engine.loadTrack(id, f);
      const buf = engine.buffers.get(id);
      patch(id, (t) => ({ ...t, file: fname, trimMs: 0, gain: buf ? daw.normalizeGain(buf) : t.gain }));
    } catch (e) { setErr(String(e)); }
    setBusy("");
  }

  if (!project) return <div className="ld-song"><p className="ld-empty">{err || "Loading…"}</p></div>;

  const fxTrack = project.tracks.find((t) => t.id === fxFor);
  const dur = engine.duration(project);

  return (
    <div className="ld-song">
      <header className="ld-top">
        <button className="ld-top__back" onClick={() => { stopAll(); onExit(); }} aria-label="Back to songs">
          <ChevronLeft size={22} />
        </button>
        <div className="ld-top__title"><h1>{project.name}</h1></div>
        <button className="ld-chip" onClick={() => setMenu("bpm")}>&#9834;={project.bpm}</button>
        <button className="ld-top__more" onClick={() => setMenu("more")} aria-label="Song menu">
          <MoreHorizontal size={20} />
        </button>
      </header>

      <div className="ld-playhead">
        <span>{daw.fmtTime(pos)}</span>
        <div className="ld-playhead__bar"><i style={{ width: `${dur ? Math.min(100, (pos / dur) * 100) : 0}%` }} /></div>
        <span>{daw.fmtTime(dur)}</span>
      </div>

      {err && <p className="ld-err" onClick={() => setErr("")}>{err}</p>}
      {busy && <p className="ld-busy">{busy}</p>}

      <div className="ld-tracks">
        {project.tracks.length === 0 && (
          <p className="ld-empty">Tap the red button to record your first track.<br />Headphones recommended.</p>
        )}
        {project.tracks.map((t, i) => (
          <div key={t.id} className={`ld-track ${armed === t.id ? "ld-track--armed" : ""}`}>
            <button className="ld-track__arm" onClick={() => setArmed(armed === t.id ? null : t.id)}
              aria-label={`${armed === t.id ? "Disarm" : "Arm"} ${t.name}`}>
              {i + 1}
            </button>
            <span className="ld-track__name">{t.name}{!t.file && <em> · empty</em>}</span>
            <button className={`ld-tog ${t.mute ? "ld-tog--on" : ""}`} onClick={() => patch(t.id, (x) => ({ ...x, mute: !x.mute }))}>M</button>
            <button className={`ld-tog ${t.solo ? "ld-tog--on" : ""}`} onClick={() => patch(t.id, (x) => ({ ...x, solo: !x.solo }))}>S</button>
            <button className="ld-tog" onClick={() => setFxFor(t.id)} aria-label={`Effects for ${t.name}`}><Settings2 size={16} /></button>
            <input className="ld-fader" type="range" min={0} max={daw.MAX_GAIN} step={0.01} value={t.gain}
              onChange={(e) => patch(t.id, (x) => ({ ...x, gain: +e.target.value }))} aria-label={`${t.name} volume`} />
            <div className="ld-meter"><i style={{ width: `${(levels[t.id] ?? 0) * 100}%` }} /></div>
          </div>
        ))}
        <button className="ld-addtrack" onClick={() => save({ ...project, tracks: [...project.tracks, daw.newTrack(`Track ${project.tracks.length + 1}`)] })}>
          <Plus size={16} /> Add Track
        </button>
      </div>

      <footer className="ld-transport">
        <button onClick={() => { stopAll(); setPos(0); }} aria-label="Back to start"><SkipBack size={24} /></button>
        <button onClick={togglePlay} aria-label={playing ? "Stop" : "Play"}>
          {playing || recording ? <Square size={26} /> : <Play size={26} />}
        </button>
        <button className={`ld-rec ${recording ? "ld-rec--live" : ""}`} onClick={toggleRec}
          aria-label={recording ? "Stop recording" : "Record"}>
          <Circle size={30} fill="currentColor" />
        </button>
        <button onClick={exportWav} aria-label="Export WAV"><Download size={24} /></button>
      </footer>

      {fxTrack && (
        <Sheet title={fxTrack.name} onClose={() => setFxFor(null)}>
          {FX_ORDER.map((k) => (
            <div key={k} className="ld-fx">
              <span>{daw.FX_LABELS[k]}</span>
              <input type="range" min={0} max={1} step={0.01} value={fxTrack.fx[k].amt}
                onChange={(e) => patch(fxTrack.id, (t) => ({ ...t, fx: { ...t.fx, [k]: { ...t.fx[k], amt: +e.target.value } } }))}
                aria-label={`${daw.FX_LABELS[k]} amount`} />
              <button className={`ld-tog ${fxTrack.fx[k].on ? "ld-tog--on" : ""}`}
                onClick={() => patch(fxTrack.id, (t) => ({ ...t, fx: { ...t.fx, [k]: { ...t.fx[k], on: !t.fx[k].on } } }))}>
                {fxTrack.fx[k].on ? "On" : "Off"}
              </button>
            </div>
          ))}
          <div className="ld-eq">
            {(["lo", "mid", "hi"] as const).map((b) => (
              <label key={b}>
                {b.toUpperCase()}
                <input type="range" min={-12} max={12} step={1} value={fxTrack.eq[b]}
                  onChange={(e) => patch(fxTrack.id, (t) => ({ ...t, eq: { ...t.eq, [b]: +e.target.value } }))} />
              </label>
            ))}
          </div>
          <div className="ld-fx">
            <span>Pan</span>
            <input type="range" min={-1} max={1} step={0.05} value={fxTrack.pan}
              onChange={(e) => patch(fxTrack.id, (t) => ({ ...t, pan: +e.target.value }))} aria-label="Pan" />
            <button className="ld-tog" onClick={() => patch(fxTrack.id, (t) => ({ ...t, pan: 0 }))}>C</button>
          </div>
          <button className="ld-btn" disabled={!fxTrack.file}
            onClick={() => {
              const buf = engine.buffers.get(fxTrack.id);
              if (buf) patch(fxTrack.id, (t) => ({ ...t, gain: daw.normalizeGain(buf) }));
            }}>
            Normalize Level
          </button>
          <label className="ld-btn">
            Import Audio File
            <input type="file" accept="audio/*" hidden
              onChange={(e) => e.target.files?.[0] && importFile(fxTrack.id, e.target.files[0])} />
          </label>
          <button className="ld-btn ld-btn--danger"
            onClick={() => { save({ ...project, tracks: project.tracks.filter((t) => t.id !== fxTrack.id) }); setFxFor(null); }}>
            <Trash2 size={18} /> Delete Track
          </button>
        </Sheet>
      )}

      {menu === "more" && (
        <Sheet title="Song" onClose={() => setMenu(null)}>
          <button className={`ld-btn ${project.click ? "ld-btn--primary" : ""}`}
            onClick={() => save({ ...project, click: !project.click })}>
            Count-in click: {project.click ? "On" : "Off"}
          </button>
          <button className="ld-btn" onClick={() => setMenu("input")}>
            Microphone: {inputs.find((d) => d.deviceId === project.inputId)?.label || "Default"}
          </button>
          <button className={`ld-btn ${project.bleedGuard ? "ld-btn--primary" : ""}`}
            onClick={() => save({ ...project, bleedGuard: !project.bleedGuard })}>
            Speaker bleed removal: {project.bleedGuard ? "On" : "Off"}
          </button>
          <small className="ld-note">
            {project.bleedGuard
              ? "Recording through the speaker without headphones. iOS cancels the playback, but voice processing costs some input quality."
              : "Full-quality input. Use headphones, or the tracks already playing will bleed into the take."}
          </small>
          <label className="ld-slider">
            Sync nudge: {project.offsetMs} ms
            <input type="range" min={-200} max={200} step={5} value={project.offsetMs}
              onChange={(e) => save({ ...project, offsetMs: +e.target.value })} />
            <small>Applied to new takes. Positive pulls the take earlier.</small>
          </label>
          <button className="ld-btn" onClick={() => { setMenu(null); exportWav(); }}><Download size={18} /> Export WAV</button>
        </Sheet>
      )}

      {menu === "input" && (
        <Sheet title="Recording Input" onClose={() => setMenu(null)}>
          <button className={`ld-btn ${project.inputId === "" ? "ld-btn--primary" : ""}`}
            onClick={() => save({ ...project, inputId: "" })}>
            System Default
          </button>
          {inputs.map((d) => (
            <button key={d.deviceId} className={`ld-btn ${project.inputId === d.deviceId ? "ld-btn--primary" : ""}`}
              onClick={() => save({ ...project, inputId: d.deviceId })}>
              {d.label || "Unnamed input"}
            </button>
          ))}
          <small className="ld-note">
            {inputs.length === 0 || !inputs.some((d) => d.label)
              ? "Record once and allow mic access — iOS hides input names until then."
              : "Plug in headphones with a mic and pick it here: playback goes to the headphones instead of the speaker, so nothing bleeds into the take."}
          </small>
        </Sheet>
      )}

      {menu === "bpm" && (
        <Sheet title="Tempo" onClose={() => setMenu(null)}>
          <label className="ld-slider">
            {project.bpm} BPM
            <input type="range" min={40} max={220} step={1} value={project.bpm}
              onChange={(e) => save({ ...project, bpm: +e.target.value })} />
          </label>
        </Sheet>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- page

export function LittleDawPage() {
  const nav = useNavigate();
  const [path, setPath] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    daw.requestPersist();
    document.title = "Little DAW";
    document.body.classList.add("ld-body");
    return () => { document.body.classList.remove("ld-body"); };
  }, []);

  return (
    <div className="ld">
      {open ? (
        <Song path={path} name={open} onExit={() => setOpen(null)} />
      ) : (
        <>
          <Browser path={path} setPath={setPath} onOpen={setOpen} />
          {path.length === 0 && (
            <button className="ld-exit" onClick={() => nav("/tools")}>Back to Tools</button>
          )}
        </>
      )}
    </div>
  );
}
