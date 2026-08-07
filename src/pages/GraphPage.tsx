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
  item: '#1e2a4a',
  ceremony: '#2f6b4f',
  belief: '#8a6a2f',
  component: '#3d4f73',
  taboo: '#a33b2f',
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
            background: kindColor[n.kind] ?? '#1e2a4a',
            color: '#fff',
            border: selectedId === n.id ? '2px solid #d4a84b' : '1px solid transparent',
            borderRadius: 12,
            padding: '8px 12px',
            fontSize: 13,
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
        markerEnd: { type: MarkerType.ArrowClosed, color: '#8a95a8' },
        style: { stroke: '#8a95a8' },
        labelStyle: { fill: '#5c677a', fontSize: 11 },
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
        <h1 className="font-display mt-2 text-3xl text-[var(--indigo)] md:text-4xl">แผนภาพความรู้</h1>
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
            <Background color="#d5dbe6" gap={18} />
            <MiniMap
              nodeColor={(n) => {
                const raw = graphNodes.find((g) => g.id === n.id)
                return raw ? kindColor[raw.kind] : '#1e2a4a'
              }}
              maskColor="rgba(30,42,74,0.08)"
            />
            <Controls />
          </ReactFlow>
        </div>

        <aside className="panel-isan p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">เลือกอยู่</p>
          <h2 className="mt-1 font-display text-2xl text-[var(--indigo)]">{selected?.label ?? '-'}</h2>
          <p className="mt-1 text-xs text-[var(--gold-deep)]">{selected?.kind}</p>
          <p className="mt-3 text-sm text-[var(--muted)]">{selected?.detail ?? 'ไม่มีคำอธิบายเพิ่มเติม'}</p>

          <h3 className="mt-5 text-sm font-semibold text-[var(--indigo)]">ความเชื่อมโยง</h3>
          <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
            {related.map((e) => {
              const otherId = e.source === selectedId ? e.target : e.source
              const other = graphNodes.find((n) => n.id === otherId)
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(otherId)}
                    className="text-left hover:text-[var(--indigo)]"
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
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#162744]" /> ของใช้
            </p>
            <p>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#2f6a48]" /> พิธี
            </p>
            <p>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#a67c1f]" /> ความเชื่อ
            </p>
            <p>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#3d4f73]" /> ส่วนประกอบ
            </p>
            <p>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#9a3d2e]" /> ข้อห้าม
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
