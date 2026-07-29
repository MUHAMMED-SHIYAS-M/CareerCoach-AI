import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import ResumeAnalyzer, { ResumeReport } from './pages/ResumeAnalyzer'
import InterviewAssistant from './pages/InterviewAssistant'
import ProgressDashboard from './pages/ProgressDashboard'
import ErrorBoundary from './components/ErrorBoundary'
import type { User, ResumeHistoryItem, InterviewSession, ActivityItem } from './types'

type Page = 'landing' | 'auth' | 'dashboard' | 'resume' | 'interview' | 'progress'

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  // Real dynamic application state
  const [resumeReport, setResumeReport] = useState<ResumeReport | null>(null)
  const [resumeHistory, setResumeHistory] = useState<ResumeHistoryItem[]>([])
  const [interviewHistory, setInterviewHistory] = useState<InterviewSession[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])

  const handleAuthSuccess = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    setPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setPage('landing')
  }

  const handleReportReady = (report: ResumeReport) => {
    setResumeReport(report)

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const newItem: ResumeHistoryItem = {
      id: Date.now().toString(),
      date: dateStr,
      timestamp: Date.now(),
      report,
    }
    setResumeHistory(prev => [...prev, newItem])

    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      action: 'Resume analyzed',
      detail: `${report.name} — Score: ${report.scores.overall}% (ATS: ${report.scores.ats}%)`,
      time: 'Just now',
      type: 'resume',
    }
    setActivities(prev => [newActivity, ...prev])
  }

  const handleInterviewComplete = (session: InterviewSession) => {
    setInterviewHistory(prev => [...prev, session])

    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      action: 'Interview completed',
      detail: `${session.type} (${session.role}) — Score: ${session.score}%`,
      time: 'Just now',
      type: 'interview',
    }
    setActivities(prev => [newActivity, ...prev])
  }

  const renderPage = () => {
    switch (page) {
      case 'landing':
        return <LandingPage onGetStarted={() => setPage(isAuthenticated ? 'dashboard' : 'auth')} />
      case 'auth':
        return <AuthPage onSuccess={handleAuthSuccess} onBack={() => setPage('landing')} />
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            resumeReport={resumeReport}
            resumeHistory={resumeHistory}
            interviewHistory={interviewHistory}
            activities={activities}
            onNavigate={setPage}
            onLogout={handleLogout}
          />
        )
      case 'resume':
        return <ResumeAnalyzer onBack={() => setPage('dashboard')} onReportReady={handleReportReady} />
      case 'interview':
        return (
          <InterviewAssistant
            onBack={() => setPage('dashboard')}
            resumeReport={resumeReport}
            onInterviewComplete={handleInterviewComplete}
          />
        )
      case 'progress':
        return (
          <ProgressDashboard
            onBack={() => setPage('dashboard')}
            resumeReport={resumeReport}
            resumeHistory={resumeHistory}
            interviewHistory={interviewHistory}
          />
        )
      default:
        return <LandingPage onGetStarted={() => setPage('auth')} />
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[hsl(var(--background))]">
        {renderPage()}
      </div>
    </ErrorBoundary>
  )
}
