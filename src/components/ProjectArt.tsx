import type { ProjectArt as ArtKind } from '../data/profile'

/* ---------- Chess: a position mid-game, last move Ng1–f3 highlighted ---------- */

// [row, col, glyph, side]  row 0 = rank 8
const PIECES: [number, number, string, 'w' | 'b'][] = [
  [0, 0, '♜', 'b'], [0, 3, '♛', 'b'], [0, 4, '♚', 'b'], [0, 5, '♝', 'b'], [0, 7, '♜', 'b'],
  [1, 0, '♟', 'b'], [1, 1, '♟', 'b'], [1, 2, '♟', 'b'], [1, 5, '♟', 'b'], [1, 6, '♟', 'b'], [1, 7, '♟', 'b'],
  [2, 2, '♞', 'b'], [2, 5, '♞', 'b'], [3, 4, '♟', 'b'],
  [4, 4, '♟', 'w'], [4, 2, '♝', 'w'], [5, 5, '♞', 'w'],
  [6, 0, '♟', 'w'], [6, 1, '♟', 'w'], [6, 2, '♟', 'w'], [6, 3, '♟', 'w'], [6, 5, '♟', 'w'], [6, 6, '♟', 'w'], [6, 7, '♟', 'w'],
  [7, 0, '♜', 'w'], [7, 1, '♞', 'w'], [7, 2, '♝', 'w'], [7, 3, '♛', 'w'], [7, 4, '♚', 'w'], [7, 7, '♜', 'w'],
]
const FROM = '7-6'
const TO = '5-5'

function ChessArt() {
  const at = new Map(PIECES.map(([r, c, g, s]) => [`${r}-${c}`, { g, s }]))
  return (
    <div className="flex h-full items-center justify-center p-6 sm:p-8">
      <div className="relative w-full max-w-[340px]">
        <div
          className="grid aspect-square grid-cols-8 overflow-hidden rounded-xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
          style={{ fontFamily: '"DejaVu Sans", "Segoe UI Symbol", "Noto Sans Symbols 2", sans-serif' }}
        >
          {Array.from({ length: 64 }, (_, i) => {
            const r = Math.floor(i / 8)
            const c = i % 8
            const key = `${r}-${c}`
            const light = (r + c) % 2 === 0
            const hl = key === FROM || key === TO
            const piece = at.get(key)
            return (
              <div
                key={key}
                className="flex items-center justify-center leading-none"
                style={{
                  background: hl ? (light ? '#e7c896' : '#c9a46c') : light ? '#d9d3ca' : '#8d877f',
                  fontSize: 'clamp(16px, 4.6cqw, 34px)',
                }}
              >
                {piece && (
                  <span
                    style={{
                      color: piece.s === 'w' ? '#ffffff' : '#141416',
                      // White pieces get a dark outline so they read on light squares.
                      textShadow:
                        piece.s === 'w'
                          ? '1px 0 #141416, -1px 0 #141416, 0 1px #141416, 0 -1px #141416, 0 2px 3px rgba(0,0,0,0.4)'
                          : '0 1px 2px rgba(0,0,0,0.25)',
                    }}
                  >
                    {piece.g}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <div className="absolute -right-2 -bottom-3 rounded-full bg-[#141416] px-3 py-1 font-mono text-[11px] text-white/70 ring-1 ring-white/15 sm:-right-4">
          depth 4 · α–β · Ng1–f3
        </div>
      </div>
    </div>
  )
}

/* ---------- Reps: a pose skeleton doing push-ups, with a counter ---------- */

const JOINTS = {
  head: [38, 52], shoulder: [56, 62], elbow: [60, 78], wrist: [58, 94],
  hip: [112, 70], knee: [142, 79], ankle: [172, 88],
} as const
const BONES: [keyof typeof JOINTS, keyof typeof JOINTS][] = [
  ['head', 'shoulder'], ['shoulder', 'elbow'], ['elbow', 'wrist'],
  ['shoulder', 'hip'], ['hip', 'knee'], ['knee', 'ankle'],
]

function RepsArt() {
  return (
    <div className="flex h-full items-center justify-center gap-6 p-6 sm:gap-10 sm:p-8">
      <svg viewBox="26 40 156 60" className="w-[62%] max-w-[320px] overflow-visible" aria-hidden="true">
        <line x1="26" y1="96" x2="182" y2="96" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <g className="pushup" style={{ transformOrigin: '172px 88px' }}>
          {BONES.map(([a, b]) => (
            <line
              key={a + b}
              x1={JOINTS[a][0]} y1={JOINTS[a][1]} x2={JOINTS[b][0]} y2={JOINTS[b][1]}
              stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round"
            />
          ))}
          {Object.entries(JOINTS).map(([k, [x, y]]) => (
            <circle key={k} cx={x} cy={y} r={k === 'head' ? 7 : 3.4} fill={k === 'head' ? '#1a1a1d' : '#7dd3a8'}
              stroke={k === 'head' ? 'rgba(255,255,255,0.8)' : 'none'} strokeWidth="2.5" />
          ))}
        </g>
      </svg>
      <div className="text-center">
        <p className="text-[clamp(44px,9cqw,72px)] leading-none tracking-tight text-white tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>
          12
        </p>
        <p className="mt-1 text-[11px] tracking-[0.2em] text-[#7dd3a8] uppercase">reps</p>
      </div>
    </div>
  )
}

export default function ProjectArt({ kind }: { kind: ArtKind }) {
  return (
    <div className="@container relative h-full w-full bg-[radial-gradient(ellipse_at_50%_40%,#2e2e33_0%,#1a1a1d_70%)]">
      {kind === 'chess' && <ChessArt />}
      {kind === 'reps' && <RepsArt />}
    </div>
  )
}
