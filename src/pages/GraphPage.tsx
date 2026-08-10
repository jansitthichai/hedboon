import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { graphEdges, graphNodes } from '../lib/knowledge'

const kindColor: Record<string, string> = {
  item: '#9d00ff',
  ceremony: '#00c853',
  belief: '#ff9500',
  component: '#00d4ff',
  taboo: '#ff006e',
}

export function GraphPage() {
  const [selectedId, setSelectedId] = useState<string>('khan5')

  const nodes: Node[] = useMemo(
    () =>
      graphNodes.map((n, index) => {
        const ring = Math.floor(index / 6)
        const pos = index % 6
        const angle = (pos / 6) * Math.PI * 2
        const radius = 140 + ring * 120
        return {
          id: n.id,
          position: {
            x: 380 + Math.cos(angle) * radius,
            y: 280 + Math.sin(angle) * radius,
          },
          data: { label: n.label },
          style: {
            background: kindColor[n.kind] ?? '#6a00ff',
            color: '#fff',
            border: selectedId === n.id ? '3px solid #ffe600' : '2px solid #2d1b4e',
            borderRadius: 12,
            padding: '8px 12px',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '3px 3px 0 #2d1b4e',
            width: 'auto',
            minWidth: 90,
          },
        }
      }),
    [selectedId],
  )

  const edges: Edge[] = useMemo(
    () =>
      graphEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#9d00ff' },
        style: { stroke: '#ff2d95', strokeWidth: 2 },
        labelStyle: { fill: '#7b5299', fontSize: 11, fontWeight: 600 },
      })),
    [],
  )

  const selected = graphNodes.find((n) => n.id === selectedId)
  const related = graphEdges.filter((e) => e.source === selectedId || e.target === selectedId)

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedId(node.id)
  }, [])

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <p className="section-kicker">Knowledge Graph</p>
        <h1 className="font-display mt-2 text-3xl text-[var(--pink-hot)] md:text-4xl">🕸️ แผนภาพความรู้</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          แผนภาพเชื่อมโยงของใช้ พิธี ความเชื่อ และข้อห้าม — กดโหนดเพื่อดูรายละเอียด
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="panel-isan h-[480px] overflow-hidden md:h-[560px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#e0b3ff" gap={18} />
            <MiniMap
              nodeColor={(n) => {
                const raw = graphNodes.find((g) => g.id === n.id)
                return raw ? kindColor[raw.kind] : '#6a00ff'
              }}
              maskColor="rgba(157,0,255,0.08)"
            />
            <Controls />
          </ReactFlow>
        </div>

        <aside className="panel-isan p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">เลือกอยู่</p>
          <h2 className="mt-1 font-display text-2xl text-[var(--purple)]">{selected?.label ?? '-'}</h2>
          <p className="mt-1 text-xs font-bold text-[var(--orange)]">{selected?.kind}</p>
          <p className="mt-3 text-sm text-[var(--muted)]">{selected?.detail ?? 'ไม่มีคำอธิบายเพิ่มเติม'}</p>

          <h3 className="mt-5 text-sm font-bold text-[var(--pink-hot)]">ความเชื่อมโยง</h3>
          <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
            {related.map((e) => {
              const otherId = e.source === selectedId ? e.target : e.source
              const other = graphNodes.find((n) => n.id === otherId)
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(otherId)}
                    className="text-left font-medium hover:text-[var(--pink-hot)]"
                  >
                    {e.label ? `${e.label} → ` : ''}
                    {other?.label}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="mt-6 space-y-1 text-xs text-[var(--muted)]">
            <p>
              <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#9d00ff]" /> ของใช้
            </p>
            <p>
              <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#00c853]" /> พิธี
            </p>
            <p>
              <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#ff9500]" /> ความเชื่อ
            </p>
            <p>
              <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#00d4ff]" /> ส่วนประกอบ
            </p>
            <p>
              <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#ff006e]" /> ข้อห้าม
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
