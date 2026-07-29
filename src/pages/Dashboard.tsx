import { useState } from 'react'
import { 
  FileText, MessageSquare, TrendingUp, Sparkles, LogOut, Menu, X, Target
} from 'lucide-react'
import type { ResumeReport } from './ResumeAnalyzer'
import type { User, ResumeHistoryItem, InterviewSession, ActivityItem } from '../types'

interface Props {
  user?: User | null
  resumeReport: ResumeReport | null
  resumeHistory: ResumeHistoryItem[]
  interviewHistory: InterviewSession[]
  activities: ActivityItem[]
  onNavigate: (page: 'resume' | 'interview' | 'progress') => void
  onLogout: () => void
}

function getInitials(user?: User | null, resumeName?: string): string {
  const nameToUse = user?.name || resumeName
  if (nameToUse) {
    const parts = nameToUse.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (user?.email) {
    const emailName = user.email.split('@')[0]
    return emailName.slice(0, 2).toUpperCase()
  }
  return 'U'
}

export default function Dashboard({
  user,
  resumeReport,
  resumeHistory,
  interviewHistory,
  activities,
  onNavigate,
  onLogout,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const initials = getInitials(user, resumeReport?.name)
  const displayName = user?.name || resumeReport?.name || user?.email || 'User'

  // Dynamic calculation for Resume Score
  const resumeScoreVal = resumeReport ? `${resumeReport.scores.overall}%` : '--'
  let resumeScoreChange = 'No data'
  if (resumeHistory.length > 1) {
    const diff = resumeHistory[resumeHistory.length - 1].report.scores.overall - resumeHistory[resumeHistory.length - 2].report.scores.overall
    resumeScoreChange = `${diff >= 0 ? '+' : ''}${diff}%`
  } else if (resumeReport) {
    resumeScoreChange = 'Latest'
  }

  // Dynamic calculation for ATS Score
  const atsScoreVal = resumeReport ? `${resumeReport.scores.ats}%` : '--'
  let atsScoreChange = 'No data'
  if (resumeHistory.length > 1) {
    const diff = resumeHistory[resumeHistory.length - 1].report.scores.ats - resumeHistory[resumeHistory.length - 2].report.scores.ats
    atsScoreChange = `${diff >= 0 ? '+' : ''}${diff}%`
  } else if (resumeReport) {
    atsScoreChange = 'ATS'
  }

  // Dynamic calculation for Interviews Done
  const interviewsDoneVal = `${interviewHistory.length}`
  const interviewsDoneChange = interviewHistory.length > 0 ? `${interviewHistory.length} total` : 'None'

  // Dynamic calculation for Overall Progress
  let overallProgressVal = '--'
  let overallProgressChange = 'No data'
  if (resumeReport && interviewHistory.length > 0) {
    const avgInterview = interviewHistory.reduce((s, i) => s + i.score, 0) / interviewHistory.length
    const avgOverall = Math.round((resumeReport.scores.overall + avgInterview) / 2)
    overallProgressVal = `${avgOverall}%`
    overallProgressChange = 'Combined'
  } else if (resumeReport) {
    overallProgressVal = `${resumeReport.scores.overall}%`
    overallProgressChange = 'Resume score'
  } else if (interviewHistory.length > 0) {
    const avgInterview = Math.round(interviewHistory.reduce((s, i) => s + i.score, 0) / interviewHistory.length)
    overallProgressVal = `${avgInterview}%`
    overallProgressChange = 'Interview avg'
  }

  const stats = [
    { label: 'Resume Score', value: resumeScoreVal, change: resumeScoreChange, icon: FileText, color: 'brand' },
    { label: 'ATS Score', value: atsScoreVal, change: atsScoreChange, icon: Target, color: 'emerald' },
    { label: 'Interviews Done', value: interviewsDoneVal, change: interviewsDoneChange, icon: MessageSquare, color: 'violet' },
    { label: 'Overall Progress', value: overallProgressVal, change: overallProgressChange, icon: TrendingUp, color: 'amber' },
  ]

  const tips = [
    { icon: FileText, text: 'Upload your resume to get an AI-powered ATS score and improvement suggestions.' },
    { icon: MessageSquare, text: 'Practice mock interviews tailored to your resume skills and experience.' },
    { icon: TrendingUp, text: 'Track your scores over time to measure career readiness.' },
    { icon: Target, text: 'Add a job description to your resume analysis for a targeted match score.' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">CareerCoach</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {[
              { label: 'Dashboard', icon: Sparkles, active: true, onClick: () => {} },
              { label: 'Resume Analyzer', icon: FileText, active: false, onClick: () => { onNavigate('resume'); setSidebarOpen(false) } },
              { label: 'Interview Prep', icon: MessageSquare, active: false, onClick: () => { onNavigate('interview'); setSidebarOpen(false) } },
              { label: 'Progress', icon: TrendingUp, active: false, onClick: () => { onNavigate('progress'); setSidebarOpen(false) } },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  item.active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 text-gray-600 hover:text-red-600 transition-colors w-full px-4 py-3 rounded-xl hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">{displayName}</span>
              <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-medium uppercase" title={displayName}>
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => onNavigate('resume')}
              className="p-6 bg-gradient-to-br from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-brand-500/25 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {resumeReport ? 'Re-Analyze Resume' : 'Upload Resume'}
              </h3>
              <p className="text-brand-100 text-sm">
                {resumeReport ? `Current score: ${resumeReport.scores.overall}%. Upload a new version to re-evaluate.` : 'Get AI-powered analysis and suggestions'}
              </p>
            </button>

            <button
              onClick={() => onNavigate('interview')}
              className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/25 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Start Interview</h3>
              <p className="text-emerald-100 text-sm">
                {resumeReport ? `Practice mock interview questions tailored for ${resumeReport.name}` : 'Practice with AI interviewer'}
              </p>
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stat.color === 'brand' ? 'bg-brand-50 text-brand-600' :
                    stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                    stat.color === 'violet' ? 'bg-violet-50 text-violet-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' :
                    stat.change.startsWith('-') ? 'bg-red-50 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity & Tips */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 ${
                        activity.type === 'resume' ? 'bg-brand-50 text-brand-600' :
                        activity.type === 'interview' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-violet-50 text-violet-600'
                      }`}>
                        {activity.type === 'resume' ? <FileText className="w-4 h-4" /> :
                         activity.type === 'interview' ? <MessageSquare className="w-4 h-4" /> :
                         <TrendingUp className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                        <div className="text-xs text-gray-500">{activity.detail}</div>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">No activity yet</p>
                  <p className="text-xs text-gray-500 mt-1">Upload a resume or start an interview to begin tracking your progress.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">How to Get the Most</h2>
              </div>
              <div className="space-y-3">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-white shadow-xs border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <tip.icon className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium pt-1">
                      {tip.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
