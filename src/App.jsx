import { useMemo, useState } from "react";
import { Check, Clipboard, Download, PhoneOff, Play } from "lucide-react";
import ThemeToggle from "./components/ThemeToggle.jsx";
import CountrySearchSelect from "./components/CountrySearchSelect.jsx";
import { useTheme } from "./utils/useTheme.js";
import { cleanBatch } from "./utils/phoneCleaner.js";

const SAMPLE = `+8801711223344
+1-555-123-4567
01711223344
+91 98765 43210
0044 7911 123456
258878189243`;

const MODES = [
  { id: "auto", label: "Auto-detect", ring: "ring-teal-400", bg: "bg-teal-500", text: "text-teal-600 dark:text-teal-300" },
  { id: "search", label: "Search country", ring: "ring-indigo-400", bg: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-300" },
  { id: "custom", label: "Custom code", ring: "ring-amber-400", bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-300" },
  { id: "none", label: "None (clean only)", ring: "ring-slate-400", bg: "bg-slate-500", text: "text-slate-600 dark:text-slate-300" },
];

const STATUS_DOT = {
  removed: "bg-teal-500",
  unchanged: "bg-slate-400",
  empty: "bg-amber-500",
};

export default function App() {
  const { theme, toggleTheme } = useTheme();

  const [rawInput, setRawInput] = useState("");
  const [mode, setMode] = useState("auto");
  const [selectedCountry, setSelectedCountry] = useState({ code: "880", iso2: "BD", name: "Bangladesh" });
  const [customCode, setCustomCode] = useState("");
  const [stripTrunkZero, setStripTrunkZero] = useState(false);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);

  const activeMode = MODES.find((m) => m.id === mode);

  const outputText = useMemo(
    () => (results ? results.map((r) => r.output).join("\n") : ""),
    [results]
  );

  const summary = useMemo(() => {
    if (!results) return null;
    const removed = results.filter((r) => r.status === "removed").length;
    return { total: results.length, removed };
  }, [results]);

  function handleProcess() {
    const cleaned = cleanBatch(rawInput, {
      mode,
      selectedCode: selectedCountry?.code ?? "",
      customCode: customCode.replace(/\D/g, ""),
      stripTrunkZero,
    });
    setResults(cleaned);
    setCopied(false);
  }

  async function handleCopy() {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — silently ignore.
    }
  }

  function handleDownload() {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned-numbers.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-edge-light dark:border-edge-dark bg-surface-light/60 dark:bg-surface-dark/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-teal-400 to-amber-400 text-white shadow-sm">
              <PhoneOff size={17} />
            </span>
            <div>
              <h1 className="text-[15px] font-semibold leading-tight">Phone Cleaner</h1>
              <p className="text-xs text-muted-light dark:text-muted-dark leading-tight">
                Strip country codes and formatting from a list of numbers
              </p>
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Mode tabs */}
        <div className="mb-2">
          <span className="text-xs font-medium text-muted-light dark:text-muted-dark">
            Country code handling
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-all ${
                mode === m.id
                  ? `${m.bg} text-white border-transparent shadow-sm`
                  : "bg-surface-light dark:bg-surface-dark border-edge-light dark:border-edge-dark text-ink-light dark:text-ink-dark hover:border-current"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Mode-specific controls + shared options */}
        <div className="flex flex-wrap items-end gap-4 mb-6 min-h-[3.25rem]">
          {mode === "search" && (
            <CountrySearchSelect value={selectedCountry} onChange={setSelectedCountry} />
          )}

          {mode === "custom" && (
            <div>
              <label className="block text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5">
                Code to remove (digits only)
              </label>
              <input
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="e.g. 258"
                inputMode="numeric"
                className="w-40 rounded-lg border border-amber-300/70 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-500/10 px-3 py-2 text-sm font-mono tracking-wide focus:border-amber-400"
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm pb-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={stripTrunkZero}
              onChange={(e) => setStripTrunkZero(e.target.checked)}
              className="h-4 w-4 rounded border-edge-light dark:border-edge-dark accent-indigo-500"
            />
            Also drop leading local 0
          </label>

          <button
            type="button"
            onClick={() => setRawInput(SAMPLE)}
            className="text-sm text-indigo-500 hover:underline pb-2.5"
          >
            Load sample
          </button>
        </div>

        {/* Input / Output grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="raw-input" className="text-xs font-medium text-muted-light dark:text-muted-dark">
                Paste numbers, one per line
              </label>
              <span className="text-xs text-muted-light dark:text-muted-dark">
                {rawInput.split(/\r?\n/).filter((l) => l.trim()).length} lines
              </span>
            </div>
            <textarea
              id="raw-input"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={"+8801711223344\n+1-555-123-4567\n01711223344"}
              spellCheck={false}
              className="w-full h-72 sm:h-80 resize-y rounded-xl border border-edge-light dark:border-edge-dark bg-surface-light dark:bg-surface-dark p-4 font-mono text-sm leading-relaxed placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-light dark:text-muted-dark">
                Cleaned output
              </span>
              {summary && (
                <span className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 font-medium">
                    {summary.total} processed
                  </span>
                  <span className="rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-300 px-2 py-0.5 font-medium">
                    {summary.removed} code(s) removed
                  </span>
                </span>
              )}
            </div>
            <div className="output-panel w-full h-72 sm:h-80 overflow-y-auto rounded-xl border border-edge-light dark:border-edge-dark bg-surface-light dark:bg-surface-dark p-4">
              {results && results.length > 0 ? (
                <ol className="font-mono text-sm leading-relaxed space-y-0.5">
                  {results.map((r, i) => (
                    <li key={i} className="flex items-center gap-2.5" title={r.note}>
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[r.status]}`}
                        aria-hidden="true"
                      />
                      <span className="text-muted-light dark:text-muted-dark select-none w-6 text-right shrink-0">
                        {i + 1}
                      </span>
                      <span>{r.output || "—"}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-light dark:text-muted-dark">
                  Cleaned numbers will show up here after you hit{" "}
                  <span className="font-medium">Process Numbers</span>.
                </p>
              )}
            </div>
            {results && results.length > 0 && (
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-light dark:text-muted-dark">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> code removed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> unchanged
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> empty / no digits
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="button"
            onClick={handleProcess}
            disabled={!rawInput.trim()}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${activeMode.bg} hover:brightness-110`}
          >
            <Play size={15} />
            Process Numbers
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!outputText}
            className="inline-flex items-center gap-2 rounded-lg border border-edge-light dark:border-edge-dark px-4 py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-400 transition-colors"
          >
            {copied ? <Check size={15} className="text-teal-500" /> : <Clipboard size={15} />}
            {copied ? "Copied" : "Copy to Clipboard"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!outputText}
            className="inline-flex items-center gap-2 rounded-lg border border-edge-light dark:border-edge-dark px-4 py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-400 transition-colors"
          >
            <Download size={15} />
            Download as TXT
          </button>
        </div>
      </main>

      <footer className="border-t border-edge-light dark:border-edge-dark py-4">
        <p className="text-center text-xs text-muted-light dark:text-muted-dark">
          Everything runs in your browser — pasted numbers are never sent anywhere.
        </p>
      </footer>
    </div>
  );
}
