import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { PlanPage } from './pages/PlanPage'
import { GraphPage } from './pages/GraphPage'
import { TimelinePage } from './pages/TimelinePage'
import { AskPage } from './pages/AskPage'
import { TraditionsPage } from './pages/TraditionsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="plan" element={<PlanPage />} />
          <Route path="graph" element={<GraphPage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="traditions" element={<TraditionsPage />} />
          <Route path="traditions/:ceremonyId" element={<TraditionsPage />} />
          <Route path="ask" element={<AskPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
