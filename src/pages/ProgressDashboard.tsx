import {
  ArrowLeft, TrendingUp, FileText, MessageSquare, 
  Award, Target, Clock, BookOpen, Sparkles
} from 'lucide-react'
import type { ResumeReport } from './ResumeAnalyzer'
import type { ResumeHistoryItem, InterviewSession } from '../types'

interface Props {
  onBack: () => void
  resumeReport: ResumeReport | null
  resumeHistory: ResumeHistoryItem[]
  interviewHistory: InterviewSession[]
}

export default function ProgressDashboard({
  onBack,
  resumeReport,
  resumeHistory,
  interviewHistory,
}: Props) {
  const chartHeight = 160
  const maxScore = 100

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600'
    if (score >= 70) return 'text-amber-600'
    return 'text-red-600'
  }

  const getBarColor = (score: number) => {
    if (score >= 85) return 'bg-gradient-to-t from-emerald-500 to-emerald-400'
    if (score >= 70) return 'bg-gradient-to-t from-amber-500 to-amber-400'
    return 'bg-gradient-to-t from-red-500 to-red-400'
  }

  // Calculate improvement metric
  let improvementText = '--'
  if (resumeHistory.length > 1) {
    const first = resumeHistory[0].report.scores.overall
    const latest = resumeHistory[resumeHistory.length - 1].report.scores.overall
    const diff = latest - first
    improvementText = `${diff >= 0 ? '+' : ''}${diff}%`
  } else if (interviewHistory.length > 1) {
    const first = interviewHistory[0].score
    const latest = interviewHistory[interviewHistory.length - 1].score
    const diff = latest - first
    improvementText = `${diff >= 0 ? '+' : ''}${diff}%`
  } else if (resumeReport || interviewHistory.length > 0) {
    improvementText = 'Active'
  }

  // Strong areas derived from real data
  const strongAreas = resumeReport
    ? [
        ...resumeReport.skills.slice(0, 3).map(s => `Proficient in ${s}`),
        ...(resumeReport.experience.length > 0 ? [`Experience as ${resumeReport.experience[0].title}`] : []),
      ]
    : ['Upload a resume to discover your verified key strengths']

  // Weak/improvement areas derived from real data
  const weakAreas = resumeReport
    ? resumeReport.suggestions.slice(0, 4)
    : ['Upload a resume to receive AI-driven improvement suggestions']

  // Dynamic recommendations based on real progress state
  const recommendations = []
  if (!resumeReport) {
    recommendations.push({
      title: 'Upload Resume',
      description: 'Upload your resume in PDF format to receive instant AI scoring and ATS optimization advice.',
      icon: FileText,
    })
  } else if (resumeReport.scores.ats < 80) {
    recommendations.push({
      title: 'Optimize ATS Keywords',
      description: `Your ATS score is ${resumeReport.scores.ats}%. Address formatting and keyword suggestions to boost match rate.`,
      icon: Target,
    })
  } else {
    recommendations.push({
      title: 'Target Specific Jobs',
      description: 'Paste a targeted job description into the analyzer for role-tailored optimization.',
      icon: Target,
    })
  }

  if (interviewHistory.length === 0) {
    recommendations.push({
      title: 'Start First Mock Interview',
      description: 'Practice interactive AI interview questions tailored to your resume background.',
      icon: MessageSquare,
    })
  } else {
    recommendations.push({
      title: 'Continue Interview Prep',
      description: `You have completed ${interviewHistory.length} interview session(s). Keep practicing to build confidence.`,
      icon: MessageSquare,
    })
  }

  recommendations.push({
    title: 'Track Performance Trend',
    description: 'Re-analyze your resume or complete interviews to monitor your score growth over time.',
    icon: TrendingUp,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            <span className="font-semibold text-gray-900">Progress Dashboard</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Resumes Analyzed', value: resumeHistory.length, icon: FileText, color: 'bg-brand-50 text-brand-600' },
            { label: 'Interviews Done', value: interviewHistory.length, icon: MessageSquare, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Session Activity', value: resumeReport || interviewHistory.length > 0 ? 'Active' : 'New', icon: Clock, color: 'bg-amber-50 text-amber-600' },
            { label: 'Overall Growth', value: improvementText, icon: TrendingUp, color: 'bg-violet-50 text-violet-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 card-hover">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Score Trend Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Resume Score Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Resume Score Trend</h2>
              {resumeHistory.length > 0 && (
                <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-medium">
                  {resumeHistory.length} Upload(s)
                </span>
              )}
            </div>
            {resumeHistory.length > 0 ? (
              <div className="relative" style={{ height: chartHeight }}>
                <div className="absolute inset-0 flex items-end justify-between gap-3">
                  {resumeHistory.map((item, i) => {
                    const height = (item.report.scores.overall / maxScore) * chartHeight
                    return (
                      <div key={item.id || i} className="flex-1 flex flex-col items-center gap-1">
                        <span className={`text-xs font-medium ${getScoreColor(item.report.scores.overall)}`}>
                          {item.report.scores.overall}%
                        </span>
                        <div className="w-full relative" style={{ height: chartHeight - 20 }}>
                          <div
                            className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${getBarColor(item.report.scores.overall)}`}
                            style={{ height: `${Math.max(10, height - 20)}px` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 truncate max-w-[60px]">{item.date}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">No resume history yet</p>
                <p className="text-xs text-gray-500 mt-1">Upload a resume to start tracking score improvements.</p>
              </div>
            )}
          </div>

          {/* Interview Score Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Interview Progress</h2>
              {interviewHistory.length > 0 && (
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  {interviewHistory.length} Session(s)
                </span>
              )}
            </div>
            {interviewHistory.length > 0 ? (
              <div className="relative" style={{ height: chartHeight }}>
                <div className="absolute inset-0 flex items-end justify-between gap-3">
                  {interviewHistory.map((item, i) => {
                    const height = (item.score / maxScore) * chartHeight
                    return (
                      <div key={item.id || i} className="flex-1 flex flex-col items-center gap-1">
                        <span className={`text-xs font-medium ${getScoreColor(item.score)}`}>
                          {item.score}%
                        </span>
                        <div className="w-full relative" style={{ height: chartHeight - 20 }}>
                          <div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-brand-500 to-brand-400 rounded-t-lg transition-all duration-500"
                            style={{ height: `${Math.max(10, height - 20)}px` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 truncate max-w-[60px]">S{i + 1}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">No interview history yet</p>
                <p className="text-xs text-gray-500 mt-1">Complete a practice interview to view performance analytics.</p>
              </div>
            )}
          </div>
        </div>

        {/* Strengths & Weaknesses (Skills growth removed per user request) */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              Verified Strengths
            </h2>
            <div className="space-y-3">
              {strongAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{area}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              Areas to Improve
            </h2>
            <div className="space-y-3">
              {weakAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-8 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-brand-200" />
            <h2 className="text-xl font-bold">Personalized AI Action Plan</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.title} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <rec.icon className="w-6 h-6 mb-2 text-brand-200" />
                <h3 className="font-semibold mb-1">{rec.title}</h3>
                <p className="text-sm text-brand-100 leading-relaxed">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
