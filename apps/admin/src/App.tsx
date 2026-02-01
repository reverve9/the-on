import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ContentsPage from './pages/ContentsPage'
import CrawlPage from './pages/CrawlPage'
import AdsPage from './pages/AdsPage'
import AdsNewPage from './pages/AdsNewPage'
import RegionsPage from './pages/RegionsPage'
import UsersPage from './pages/UsersPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="contents" element={<ContentsPage />} />
        <Route path="crawl" element={<CrawlPage />} />
        <Route path="ads" element={<AdsPage />} />
        <Route path="ads/new" element={<AdsNewPage />} />
        <Route path="regions" element={<RegionsPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
    </Routes>
  )
}

export default App
