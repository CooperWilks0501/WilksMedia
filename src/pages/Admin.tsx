import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

// ponytail: client-side gate only — the password ships in the bundle, so this
// keeps the panel out of sight, NOT secure. Move to a real server check if it
// ever guards anything sensitive.
const AUTH_KEY = "wm_admin";

export function AdminLogin() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.trim().toLowerCase() === "admin" && pass === "Root") {
      sessionStorage.setItem(AUTH_KEY, "1");
      navigate("/tools");
    } else {
      setError(true);
    }
  };

  return (
    <div className="admin-shell">
      <form className="admin-card" onSubmit={submit}>
        <h1>Admin Access</h1>
        <label>
          <span>Username</span>
          <input value={user} onChange={(e) => setUser(e.target.value)} autoFocus />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </label>
        {error && <p className="admin-error">Invalid credentials.</p>}
        <button type="submit">Enter</button>
      </form>
    </div>
  );
}

// Add your tools here — each becomes a button in the left tab.
// url: embed a live site in an iframe. view: "music" renders the music list.
const tools: { label: string; url?: string; view?: "music" }[] = [
  { label: "Music", view: "music" }
];

// Sub-sections shown under "Music" in the tab. Add a category here + tag sites with `cat`.
const musicCats: { key: string; label: string }[] = [
  { key: "play", label: "Play & Make" },
  { key: "discover", label: "Discover" },
  { key: "plugins", label: "Free Plugins & Samples" }
];

// Edit this list to add/remove music sites. `cat` matches a key in musicCats.
const musicSites: { name: string; url: string; note: string; cat: string }[] = [
  { name: "10k Drum Machines", url: "https://10kdrummachines.com/", note: "A wall of interesting drum machines", cat: "play" },
  { name: "Samplette", url: "https://samplette.io/", note: "Sample random songs by genre", cat: "play" },
  { name: "YPC Sampler", url: "https://ypc2000.fun/", note: "Finger-drum any YouTube video", cat: "play" },
  { name: "Chrome Music Lab", url: "https://musiclab.chromeexperiments.com/", note: "Playful music experiments", cat: "play" },
  { name: "BeepBox", url: "https://www.beepbox.co/", note: "No-login browser music sketchpad", cat: "play" },
  { name: "Virtual Piano", url: "https://virtualpiano.net", note: "Play piano with your keyboard", cat: "play" },
  { name: "Binary Piano", url: "https://binarypiano.com/", note: "Turns any text into a piano melody", cat: "play" },
  { name: "Split My Song", url: "https://www.splitmysong.com/", note: "AI splits vocals from instruments", cat: "play" },
  { name: "AllMusic", url: "https://www.allmusic.com/", note: "Reviews of new releases", cat: "discover" },
  { name: "Radio Garden", url: "https://radio.garden", note: "Spin a globe, tune into live radio worldwide", cat: "discover" },
  { name: "Radiooooo", url: "https://radiooooo.com", note: "Music by country and decade", cat: "discover" },
  { name: "Every Noise at Once", url: "https://everynoise.com", note: "Scatterplot of every music genre", cat: "discover" },
  { name: "Music-Map", url: "https://music-map.com", note: "Discover artists similar to one you like", cat: "discover" },
  { name: "Vital", url: "https://vital.audio/", note: "Free wavetable synth that rivals Serum", cat: "plugins" },
  { name: "Spitfire LABS", url: "https://labs.spitfireaudio.com/", note: "Free sampled instruments", cat: "plugins" },
  { name: "Decent Sampler", url: "https://www.decentsamples.com/product/decent-sampler-plugin/", note: "Free sample player + libraries", cat: "plugins" },
  { name: "Pianobook", url: "https://www.pianobook.co.uk/", note: "Hundreds of free community sample libraries", cat: "plugins" },
  { name: "Surge XT", url: "https://surge-synthesizer.github.io/", note: "Free open-source hybrid synth", cat: "plugins" },
  { name: "Valhalla Freebies", url: "https://valhalladsp.com/free-audio-plugins/", note: "Free Valhalla reverbs & delays", cat: "plugins" },
  { name: "Bedroom Producers Blog", url: "https://bedroomproducersblog.com/free-vst-plugins/", note: "Curated free plugin roundups", cat: "plugins" },
  { name: "Plugin Boutique", url: "https://www.pluginboutique.com/", note: "Plugins, bundles & free sample packs", cat: "plugins" }
];

function MusicTools({ cat }: { cat: string | null }) {
  const shown = cat ? musicSites.filter((s) => s.cat === cat) : musicSites;
  const heading = cat ? musicCats.find((c) => c.key === cat)?.label ?? "Music" : "Music";

  return (
    <div className="music-tool" data-lenis-prevent>
      <header className="music-tool__head">
        <span className="music-tool__notes" aria-hidden="true">♪ ♫ ♩ ♬</span>
        <h1>{heading}</h1>
        <p>A shelf of music sites and toys.</p>
      </header>
      <div className="music-grid">
        {shown.map((s) => (
          <a key={s.url} className="music-card" href={s.url} target="_blank" rel="noreferrer">
            <span className="music-card__note" aria-hidden="true">♪</span>
            <strong>{s.name}</strong>
            <small>{s.note}</small>
          </a>
        ))}
      </div>
    </div>
  );
}

export function ToolsPage() {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState(0);
  const [musicOpen, setMusicOpen] = useState(true);
  const [musicCat, setMusicCat] = useState<string | null>(null);

  if (sessionStorage.getItem(AUTH_KEY) !== "1") {
    return <Navigate to="/admin" replace />;
  }

  const current = tools[active];

  return (
    <div className="admin-shell tools-shell">
      <aside className={`tools-tab ${open ? "" : "tools-tab--closed"}`}>
        <div className="tools-tab__inner">
          <h2>Tools</h2>
          <nav className="tools-tab__list">
            {tools.length === 0 ? (
              <p className="tools-tab__empty">No tools yet.</p>
            ) : (
              tools.map((t, i) => (
                <div key={t.label}>
                  <button
                    className={`tools-tab__item ${i === active ? "tools-tab__item--active" : ""}`}
                    onClick={() => {
                      setActive(i);
                      if (t.view === "music") setMusicOpen((v) => !v);
                    }}
                  >
                    <span>{t.label}</span>
                    {t.view === "music" && (
                      <ChevronDown
                        size={16}
                        className={`tools-tab__caret ${musicOpen ? "tools-tab__caret--open" : ""}`}
                      />
                    )}
                  </button>

                  {t.view === "music" && (
                    <div className={`tools-sub ${musicOpen ? "tools-sub--open" : ""}`}>
                      <div className="tools-sub__inner">
                        <button
                          className={`tools-sub__item ${musicCat === null ? "tools-sub__item--active" : ""}`}
                          onClick={() => { setActive(i); setMusicCat(null); }}
                        >
                          All
                        </button>
                        {musicCats.map((c) => (
                          <button
                            key={c.key}
                            className={`tools-sub__item ${musicCat === c.key ? "tools-sub__item--active" : ""}`}
                            onClick={() => { setActive(i); setMusicCat(c.key); }}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </nav>
        </div>
      </aside>
      <button
        className={`tools-tab__toggle ${open ? "" : "tools-tab__toggle--closed"}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Hide tools" : "Show tools"}
      >
        {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      <main className="tools-stage">
        {current?.url ? (
          <iframe
            className="tools-frame"
            src={current.url}
            title={current.label}
            allow="autoplay; encrypted-media; midi"
          />
        ) : current?.view === "music" ? (
          <MusicTools cat={musicCat} />
        ) : (
          <div className="tools-placeholder">
            <h1>{current?.label ?? "Tools"}</h1>
            <p>Nothing wired up here yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
