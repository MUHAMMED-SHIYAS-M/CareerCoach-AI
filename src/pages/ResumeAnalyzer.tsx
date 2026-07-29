import { useState, useRef } from 'react'
import {
  Upload, FileText, CheckCircle, AlertCircle, ArrowLeft,
  RefreshCw, Target, Award, BookOpen, TrendingUp, Loader2, AlertTriangle
} from 'lucide-react'
import { extractTextFromPDF } from '../lib/pdfExtract'
import { analyzeResume } from '../lib/groq'

export interface ResumeReport {
  name: string
  email: string
  phone: string
  skills: string[]
  experience: { title: string; company: string; duration: string; highlights: string[] }[]
  education: { degree: string; institution: string; year: string }[]
  certifications: string[]
  projects: { name: string; description: string; technologies: string[] }[]
  scores: {
    overall: number
    ats: number
    grammar: number
    keyword: number
  }
  suggestions: string[]
  jobMatch?: number | null
}

interface Props {
  onBack: () => void
  onReportReady?: (report: ResumeReport) => void
}

type AnalysisStep = 'idle' | 'extracting' | 'analyzing' | 'done' | 'error'

export default function ResumeAnalyzer({ onBack, onReportReady }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<AnalysisStep>('idle')
  const [stepLabel, setStepLabel] = useState('')
  const [report, setReport] = useState<ResumeReport | null>(null)
  const [error, setError] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [showJobInput, setShowJobInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analyzing = step === 'extracting' || step === 'analyzing'

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') setFile(dropped)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) setFile(selected)
  }

  const handleAnalyze = async () => {
    if (!file) return
    setError('')
    setStep('extracting')
    setStepLabel('Reading PDF…')

    try {
      const text = await extractTextFromPDF(file)

      if (!text || text.length < 50) {
        throw new Error('Could not extract text from this PDF. Please ensure the PDF contains selectable text (not a scanned image).')
      }

      setStep('analyzing')
      setStepLabel('Analyzing with Groq AI…')

      const result = await analyzeResume(text, jobDescription || undefined)

      setReport(result)
      onReportReady?.(result)
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
      setStep('error')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600'
    if (score >= 70) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 border-emerald-200'
    if (score >= 70) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 55) return 'Fair'
    return 'Needs Work'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <span className="font-semibold text-gray-900">Resume Analyzer</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!report ? (
          <>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 mb-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-brand-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
                <p className="text-gray-600">
                  Upload your PDF resume and Groq AI will analyse it — scoring ATS compatibility, grammar, keywords, and more.
                </p>
              </div>

              {/* Drop zone */}
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => !analyzing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                  analyzing
                    ? 'border-brand-300 bg-brand-50 cursor-default'
                    : 'border-gray-200 hover:border-brand-400 cursor-pointer'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {analyzing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                    <p className="text-brand-700 font-semibold text-lg">{stepLabel}</p>
                    <p className="text-brand-500 text-sm">This may take 10–20 seconds…</p>
                    {/* Progress dots */}
                    <div className="flex gap-1.5 mt-2">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-6 h-6 text-brand-600" />
                    <span className="text-gray-900 font-medium">{file.name}</span>
                    <span className="text-gray-400 text-sm">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-1">Drop your resume here or click to browse</p>
                    <p className="text-gray-400 text-sm">PDF format, max 10MB — text must be selectable (not scanned)</p>
                  </>
                )}
              </div>

              {/* Error */}
              {step === 'error' && error && (
                <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Job Description */}
              <div className="mt-6">
                <button
                  onClick={() => setShowJobInput(!showJobInput)}
                  className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  <Target className="w-4 h-4" />
                  {showJobInput ? 'Remove job description' : 'Add job description for match score'}
                </button>
                {showJobInput && (
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here to calculate your match score…"
                    className="mt-3 w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm"
                  />
                )}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!file || analyzing}
                className="mt-6 w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 text-white rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {stepLabel}
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Analyse with Groq AI
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Score Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Resume Score', value: report.scores.overall, icon: Award },
                { label: 'ATS Score', value: report.scores.ats, icon: Target },
                { label: 'Grammar', value: report.scores.grammar, icon: BookOpen },
                { label: 'Keyword Match', value: report.scores.keyword, icon: TrendingUp },
              ].map((score) => (
                <div key={score.label} className={`rounded-2xl p-5 border ${getScoreBg(score.value)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <score.icon className={`w-5 h-5 ${getScoreColor(score.value)}`} />
                    <span className={`text-2xl font-bold ${getScoreColor(score.value)}`}>
                      {score.value}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{score.label}</div>
                  <div className={`text-xs font-medium mt-0.5 ${getScoreColor(score.value)}`}>
                    {getScoreLabel(score.value)}
                  </div>
                  {/* Score bar */}
                  <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        score.value >= 85 ? 'bg-emerald-500' :
                        score.value >= 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Job Match */}
            {report.jobMatch != null && (
              <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl p-6 text-white mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Job Match Score</h3>
                    <p className="text-brand-100 text-sm">Based on keyword overlap with the provided job description</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{report.jobMatch}%</div>
                    <div className="text-brand-200 text-sm">{getScoreLabel(report.jobMatch)}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left column */}
              <div className="space-y-6">
                {/* Personal Info */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700"><span className="text-gray-400">Name:</span> {report.name || '—'}</p>
                    <p className="text-gray-700"><span className="text-gray-400">Email:</span> {report.email || '—'}</p>
                    <p className="text-gray-700"><span className="text-gray-400">Phone:</span> {report.phone || '—'}</p>
                  </div>
                </div>

                {/* Skills */}
                {report.skills?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Detected</h3>
                    <div className="flex flex-wrap gap-2">
                      {report.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {report.experience?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
                    {report.experience.map((exp, i) => (
                      <div key={i} className="mb-5 last:mb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                            <p className="text-sm text-gray-500">{exp.company}</p>
                          </div>
                          <span className="text-sm text-gray-400 whitespace-nowrap ml-2">{exp.duration}</span>
                        </div>
                        <ul className="space-y-1">
                          {exp.highlights?.map((h, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* AI Suggestions */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    AI Improvement Suggestions
                  </h3>
                  <div className="space-y-3">
                    {report.suggestions?.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                        <span className="text-xs font-bold text-amber-600 bg-amber-100 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-700">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                {report.education?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                    {report.education.map((edu, i) => (
                      <div key={i} className="flex items-start justify-between mb-3 last:mb-0">
                        <div>
                          <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                          <p className="text-sm text-gray-500">{edu.institution}</p>
                        </div>
                        <span className="text-sm text-gray-400">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {report.certifications?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {report.certifications.map((cert) => (
                        <span key={cert} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {report.projects?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects</h3>
                    {report.projects.map((proj, i) => (
                      <div key={i} className="mb-4 last:mb-0">
                        <h4 className="font-semibold text-gray-900 mb-1">{proj.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{proj.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.technologies?.map(t => (
                            <span key={t} className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-xs font-medium">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => { setReport(null); setStep('idle'); setFile(null); setError('') }}
                  className="w-full py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Analyse Another Resume
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
