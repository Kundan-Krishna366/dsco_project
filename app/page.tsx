"use client";

import { useMemo, useState } from "react";
import { Cpu, Terminal, Activity, Zap, GitBranch, Radio, Binary, Hash, Boxes } from "lucide-react";

type Bit = 0 | 1;

function parseInput(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  let n: number;
  if (/^0b[01]+$/i.test(s)) n = parseInt(s.slice(2), 2);
  else if (/^0x[0-9a-f]+$/i.test(s)) n = parseInt(s.slice(2), 16);
  else if (/^\d+$/.test(s)) n = parseInt(s, 10);
  else return null;
  if (!Number.isFinite(n) || n < 0 || n > 65535) return null;
  return n;
}

const toBin = (n: number, w = 8): Bit[] =>
  n.toString(2).padStart(w, "0").split("").map((c) => (c === "1" ? 1 : 0)) as Bit[];

const binToGray = (bits: Bit[]): Bit[] =>
  bits.map((b, i) => ((i === 0 ? 0 : bits[i - 1]) ^ b) as Bit);

const toBCD = (n: number): Bit[][] =>
  n.toString().split("").map((d) => toBin(parseInt(d, 10), 4));

function BitRow({ bits, accent = "indigo", label }: { bits: Bit[]; accent?: "indigo" | "emerald"; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 w-10">{label}</span>}
      <div className="flex gap-1.5">
        {bits.map((b, i) => {
          const on = b === 1;
          const cls = on
            ? accent === "emerald"
              ? "border-emerald-400/50 text-emerald-300 bg-emerald-400/10 shadow-[0_0_12px_-2px_rgba(16,185,129,0.6)]"
              : "border-indigo-400/50 text-indigo-300 bg-indigo-400/10 shadow-[0_0_12px_-2px_rgba(99,102,241,0.6)]"
            : "border-white/5 text-white/40 bg-white/[0.02]";
          return (
            <div key={i} className={`h-7 w-7 grid place-items-center rounded-md font-mono text-xs border transition-all ${cls}`}>
              {b}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConvCard({
  icon: Icon, title, subtitle, hint, children,
}: { icon: React.ElementType; title: string; subtitle: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-5 hover:border-white/15 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg grid place-items-center bg-indigo-500/10 border border-indigo-400/20 text-indigo-300">
            <Icon className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-sm font-medium tracking-tight">{title}</div>
            <div className="text-[11px] text-white/50 font-mono uppercase tracking-wider">{subtitle}</div>
          </div>
        </div>
        <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{hint}</div>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ConversionCards({ bin, gray, bcd }: { bin: Bit[]; gray: Bit[]; bcd: Bit[][] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      <ConvCard icon={Binary} title="Binary" subtitle="base-2" hint="MSB → LSB">
        <BitRow bits={bin} />
      </ConvCard>
      <ConvCard icon={Hash} title="Gray Code" subtitle="reflected" hint="XOR chain">
        <BitRow bits={gray} accent="emerald" />
      </ConvCard>
      <ConvCard icon={Boxes} title="BCD" subtitle="8-4-2-1" hint="per digit">
        {bcd.length === 0 ? <div className="text-xs text-white/50 font-mono">—</div>
          : bcd.map((d, i) => <BitRow key={i} bits={d} label={`d${bcd.length - 1 - i}`} />)}
      </ConvCard>
    </div>
  );
}

function CircuitView({ bits }: { bits: Bit[] }) {
  const gray = binToGray(bits);
  const n = bits.length;
  const rowH = 70, W = 720, H = n * rowH + 40;
  const xIn = 40, xGate = 360, xOut = 620, gateW = 80, gateH = 38;

  const sigColor = (b: Bit) => (b === 1 ? "#10b981" : "#3b3b48");
  const sigStroke = (b: Bit) => (b === 1 ? 2 : 1.25);
  const sigFilter = (b: Bit) => (b === 1 ? "url(#glow)" : "none");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="gateFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(99,102,241,0.18)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.04)" />
        </linearGradient>
      </defs>

      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7a7a90" opacity="0.5">
        <text x={xIn} y={20}>BINARY INPUT (B)</text>
        <text x={xGate + 5} y={20}>XOR LOGIC</text>
        <text x={xOut} y={20}>GRAY OUTPUT (G)</text>
      </g>

      {bits.map((b, i) => {
        const y = 60 + i * rowH;
        const g = gray[i];
        const inputLabel = `B${n - 1 - i}`;
        const outputLabel = `G${n - 1 - i}`;

        if (i === 0) {
          return (
            <g key={i}>
              <text x={xIn} y={y + 4} fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="600" fill="#f8fafc">{inputLabel}</text>
              <text x={xIn + 30} y={y + 4} fontFamily="JetBrains Mono, monospace" fontSize="10" fill={sigColor(b)}>{`(${b})`}</text>

              <line x1={xIn + 65} y1={y} x2={xOut - 10} y2={y + 0.01} stroke={sigColor(b)} strokeWidth={sigStroke(b)} filter={sigFilter(b)} />

              <circle cx={xOut - 10} cy={y} r={3} fill={sigColor(b)} filter={sigFilter(b)} />
              <text x={xOut} y={y + 4} fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="600" fill="#f8fafc">{outputLabel}</text>
              <text x={xOut + 25} y={y + 4} fontFamily="JetBrains Mono, monospace" fontSize="10" fill={sigColor(g)}>{`=${g}`}</text>
            </g>
          );
        }

        const prevBit = bits[i - 1];
        const prevY = 60 + (i - 1) * rowH;
        const gateCenterY = y;
        const inA_y = gateCenterY - 8;
        const inB_y = gateCenterY + 8;
        const dropX = xIn + 100;

        return (
          <g key={i}>
            <text x={xIn} y={y + 4} fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="600" fill="#f8fafc">{inputLabel}</text>
            <text x={xIn + 30} y={y + 4} fontFamily="JetBrains Mono, monospace" fontSize="10" fill={sigColor(b)}>{`(${b})`}</text>

            <path
              d={`M ${xIn + 65} ${y} L ${xGate - 20} ${y} L ${xGate - 20} ${inB_y} L ${xGate} ${inB_y}`}
              fill="none" stroke={sigColor(b)} strokeWidth={sigStroke(b)} filter={sigFilter(b)}
            />

            <circle cx={dropX} cy={prevY} r={3} fill={sigColor(prevBit)} filter={sigFilter(prevBit)} />
            <path
              d={`M ${dropX} ${prevY} L ${dropX} ${inA_y} L ${xGate} ${inA_y}`}
              fill="none" stroke={sigColor(prevBit)} strokeWidth={sigStroke(prevBit)} filter={sigFilter(prevBit)}
            />

            <g transform={`translate(${xGate}, ${gateCenterY - gateH / 2})`}>
              <path d={`M 0 4 Q 14 ${gateH / 2} 0 ${gateH - 4} Q 28 ${gateH - 4} ${gateW - 14} ${gateH / 2} Q 28 4 0 4 Z`}
                fill="url(#gateFill)" stroke="rgba(99,102,241,0.55)" strokeWidth="1.2" />
              <path d={`M -8 4 Q 6 ${gateH / 2} -8 ${gateH - 4}`} fill="none" stroke="rgba(99,102,241,0.55)" strokeWidth="1.2" />
              <text x={gateW / 2 - 4} y={gateH / 2 + 4} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#a5b4fc" textAnchor="middle">⊕</text>
            </g>

            <line x1={xGate + gateW - 14} y1={gateCenterY} x2={xOut - 10} y2={gateCenterY + 0.01} stroke={sigColor(g)} strokeWidth={sigStroke(g)} filter={sigFilter(g)} />
            <circle cx={xOut - 10} cy={gateCenterY} r={3} fill={sigColor(g)} filter={sigFilter(g)} />
            <text x={xOut} y={gateCenterY + 4} fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="600" fill="#f8fafc">{outputLabel}</text>
            <text x={xOut + 25} y={gateCenterY + 4} fontFamily="JetBrains Mono, monospace" fontSize="10" fill={sigColor(g)}>{`=${g}`}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Page() {
  const [raw, setRaw] = useState("13");
  const [width, setWidth] = useState(8);

  const value = useMemo(() => parseInput(raw), [raw]);
  const bin = useMemo(() => (value === null ? Array(width).fill(0) : toBin(value, width)), [value, width]) as Bit[];
  const gray = useMemo(() => binToGray(bin), [bin]);
  const bcd = value === null ? [] : toBCD(value);
  const high = bin.filter((b) => b === 1).length;

  return (
    <>
      <style>{`
        body { background:#0a0a0c; color:#fafafa; font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          background-image:
            radial-gradient(ellipse 80% 60% at 20% 0%, rgba(99,102,241,0.12), transparent 60%),
            radial-gradient(ellipse 60% 50% at 100% 100%, rgba(16,185,129,0.08), transparent 60%);
          background-attachment: fixed;
        }
        .glass { background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); backdrop-filter: blur(14px); }
        .glass-strong { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015)); border:1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px); }
        .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 32px 32px; }
        .text-signal { color:#10b981; text-shadow: 0 0 12px rgba(16,185,129,0.6); }
        .text-indigo-glow { color:#818cf8; text-shadow: 0 0 12px rgba(99,102,241,0.5); }
        @keyframes pulse-glow { 0%,100%{opacity:.7} 50%{opacity:1} }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen text-white">
        <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-[#0a0a0c]/70">
          <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg grid place-items-center bg-gradient-to-br from-indigo-500/30 to-emerald-500/20 border border-white/10">
                <Cpu className="h-4 w-4 text-indigo-300" strokeWidth={1.5} />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">Code Converter</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">v1</div>
              </div>
            </div>
            <div className="flex items-center gap-5 text-[11px] font-mono text-white/50">
              <span className="hidden md:inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-glow" />
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto px-6 py-8">
          <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-indigo-300/80 mb-2 flex items-center gap-2">
                <Radio className="h-3 w-3" />
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl">
                Convert numeric data &amp; inspect <span className="text-indigo-glow">combinational logic</span> in real time.
              </h1>
            </div>
            <div className="flex gap-3">
              <Stat label="HIGH BITS" value={`${high}/${width}`} accent="emerald" />
              <Stat label="DECIMAL" value={value === null ? "—" : String(value)} />
              <Stat label="HEX" value={value === null ? "—" : "0x" + value.toString(16).toUpperCase()} />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <section className="space-y-6">
              <div className="glass-strong rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-white/50">
                    <Terminal className="h-3.5 w-3.5" /> input.stream
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    {[4, 8, 16].map((w) => (
                      <button key={w} onClick={() => setWidth(w)}
                        className={`px-2.5 py-1 rounded-md border transition-colors ${width === w ? "border-indigo-400/60 bg-indigo-400/10 text-indigo-200"
                            : "border-white/10 text-white/50 hover:text-white hover:border-white/20"}`}>
                        {w}-bit
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-indigo-300/80 text-sm">$</span>
                  <input value={raw} onChange={(e) => setRaw(e.target.value)} spellCheck={false}
                    placeholder="enter decimal · 0b1011 · 0xFF"
                    className="w-full font-mono text-lg md:text-xl bg-[#0d0d10]/80 border border-white/10 rounded-xl pl-9 pr-32 py-4 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-white/30" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-1 rounded-md border ${value === null ? "border-red-400/40 text-red-300 bg-red-400/10" : "border-emerald-400/40 text-emerald-300 bg-emerald-400/10"}`}>
                      {value === null ? "INVALID" : "PARSED"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {["7", "13", "42", "0b10110", "0xFF"].map((s) => (
                    <button key={s} onClick={() => setRaw(s)}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-md border border-white/10 text-white/50 hover:text-indigo-200 hover:border-indigo-400/40 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <ConversionCards bin={bin} gray={gray} bcd={bcd} />
            </section>

            <section className="glass-strong rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
              <div className="relative flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-white/50">
                    <Activity className="h-3.5 w-3.5 text-emerald-300" /> live.circuit · binary→gray
                  </div>
                  <div className="text-base font-medium mt-1 tracking-tight">Combinational Logic Path</div>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <Legend color="#10b981" label="HIGH · 1" />
                  <Legend color="#3b3b48" label="LOW · 0" />
                  <span className="px-2 py-1 rounded-md border border-indigo-400/40 bg-indigo-400/10 text-indigo-200 flex items-center gap-1">
                    <GitBranch className="h-3 w-3" /> XOR · {Math.max(0, width - 1)}
                  </span>
                </div>
              </div>

              <div className="relative rounded-xl border border-white/5 bg-[#08080a]/60 p-4 h-[520px] overflow-auto">
                <CircuitView bits={bin} />
              </div>

              <div className="relative mt-4 grid grid-cols-3 gap-3">
                <Mini label="GATES" value={String(Math.max(0, width - 1))} icon={Zap} />
                <Mini label="PROP. DELAY" value={`${(Math.max(0, width - 1) * 0.8).toFixed(1)} ns`} icon={Activity} />
                <Mini label="FAN-OUT" value="2" icon={GitBranch} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "emerald" }) {
  return (
    <div className="glass rounded-lg px-4 py-2.5 min-w-[110px]">
      <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/50">{label}</div>
      <div className={`font-mono text-sm mt-0.5 ${accent === "emerald" ? "text-signal" : "text-white"}`}>{value}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-white/50">
      <span className="inline-block h-[2px] w-5 rounded" style={{ background: color, boxShadow: color === "#10b981" ? `0 0 8px ${color}` : undefined }} />
      {label}
    </span>
  );
}

function Mini({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="glass rounded-lg p-3 flex items-center gap-3">
      <div className="h-8 w-8 rounded-md grid place-items-center bg-emerald-500/10 border border-emerald-400/20 text-emerald-300">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/50">{label}</div>
        <div className="font-mono text-sm">{value}</div>
      </div>
    </div>
  );
}