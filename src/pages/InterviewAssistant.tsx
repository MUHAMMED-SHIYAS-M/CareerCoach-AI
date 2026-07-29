import { useState } from 'react'
import {
  MessageSquare, Mic, Send, ArrowLeft, Clock,
  CheckCircle, BarChart3, Brain, FileText, User, Loader2
} from 'lucide-react'
import type { ResumeReport } from './ResumeAnalyzer'
import { generateInterviewQuestions, evaluateAnswer as groqEvaluate } from '../lib/groq'
import type { AnswerEvaluation } from '../lib/groq'
import type { InterviewSession } from '../types'

interface Props {
  onBack: () => void
  resumeReport: ResumeReport | null
  onInterviewComplete?: (session: InterviewSession) => void
}

interface Question {
  id: number
  type: 'technical' | 'behavioral' | 'situational'
  question: string
  answer?: string
  evaluation?: AnswerEvaluation
}

const jobRoles = [
  'Software Engineer',
  'Data Scientist',
  'AI Engineer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'Product Manager',
]

const interviewTypes = ['Technical', 'HR', 'Behavioral', 'Mixed'] as const

export default function InterviewAssistant({ onBack, resumeReport, onInterviewComplete }: Props) {
  const [step, setStep] = useState<'setup' | 'loading' | 'interview' | 'evaluating' | 'results'>('setup')
  const [selectedRole, setSelectedRole] = useState('')
  const [interviewType, setInterviewType] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('')
  const [genError, setGenError] = useState('')

  const resumeContext = resumeReport
    ? `Candidate: ${resumeReport.name}. Skills: ${resumeReport.skills.slice(0, 8).join(', ')}. Latest role: ${resumeReport.experience[0]?.title ?? ''} at ${resumeReport.experience[0]?.company ?? ''}.`
    : undefined

  // ─── Start interview (generate questions via Groq) ─────────────────────────
  const handleStartInterview = async () => {
    if (!selectedRole || !interviewType) return
    setGenError('')
    setStep('loading')
    setLoadingLabel('Generating personalised questions with Groq AI…')

    try {
      let qs: Question[]

      if (resumeReport) {
        const groqQs = await generateInterviewQuestions(resumeReport, selectedRole, interviewType)
        qs = groqQs.map(q => ({ ...q, answer: '', evaluation: undefined }))
      } else {
        // Generic fallback questions
        qs = genericFallback(interviewType)
      }

      setQuestions(qs)
      setCurrentQuestion(0)
      setAnswer('')
      setStep('interview')
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate questions. Please try again.')
      setStep('setup')
    }
  }

  const finishInterview = (finalQuestions: Question[]) => {
    const answeredQs = finalQuestions.filter(q => q.evaluation)
    const avgScore = answeredQs.length
      ? Math.round(answeredQs.reduce((s, q) => s + (q.evaluation!.overall), 0) / answeredQs.length)
      : 0

    onInterviewComplete?.({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: Date.now(),
      role: selectedRole,
      type: interviewType,
      score: avgScore,
      questionsCount: finalQuestions.length,
      evaluationsCount: answeredQs.length,
    })
    setStep('results')
  }

  // ─── Submit answer → Groq evaluation ──────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return
    setStep('evaluating')
    setLoadingLabel('Evaluating your answer with Groq AI…')

    try {
      const evaluation = await groqEvaluate(
        questions[currentQuestion].question,
        answer,
        resumeContext
      )

      const updated = [...questions]
      updated[currentQuestion] = { ...updated[currentQuestion], answer, evaluation }
      setQuestions(updated)
      setAnswer('')

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setStep('interview')
      } else {
        finishInterview(updated)
      }
    } catch {
      // On evaluation error, still move forward without score
      const updated = [...questions]
      updated[currentQuestion] = { ...updated[currentQuestion], answer }
      setQuestions(updated)
      setAnswer('')

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setStep('interview')
      } else {
        finishInterview(updated)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  const handleSkip = () => {
    const updated = [...questions]
    updated[currentQuestion] = { ...updated[currentQuestion], answer: '' }
    setQuestions(updated)
    setAnswer('')
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      finishInterview(updated)
    }
  }

  // ─── Colour helpers ────────────────────────────────────────────────────────
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return <Brain className="w-4 h-4" />
      case 'behavioral': return <MessageSquare className="w-4 h-4" />
      case 'situational': return <BarChart3 className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-violet-50 text-violet-700'
      case 'behavioral': return 'bg-blue-50 text-blue-700'
      case 'situational': return 'bg-amber-50 text-amber-700'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  const answeredQs = questions.filter(q => q.evaluation)
  const avgScore = answeredQs.length
    ? Math.round(answeredQs.reduce((s, q) => s + (q.evaluation!.overall), 0) / answeredQs.length)
    : 0

  const isLoading = step === 'loading' || step === 'evaluating'

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-gray-900">Interview Assistant</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── SETUP ─────────────────────────────────────────────────────── */}
        {step === 'setup' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Practice Interview</h2>
              <p className="text-gray-600">Select your role and interview type to begin</p>
            </div>

            {/* Resume banner */}
            {resumeReport ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
                <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-800">Resume Loaded ✓</p>
                  <p className="text-xs text-emerald-700 truncate">
                    Groq AI will generate personalised questions for <strong>{resumeReport.name}</strong> based on: {resumeReport.skills.slice(0, 4).join(', ')}…
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
                <User className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-800">No Resume Uploaded</p>
                  <p className="text-xs text-amber-700">
                    Go to Resume Analyzer first to get AI-generated questions based on your actual resume.
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {genError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {genError}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Job Role</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {jobRoles.map(role => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 rounded-xl text-sm font-medium border transition-all ${
                        selectedRole === role
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Interview Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {interviewTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setInterviewType(type)}
                      className={`p-3 rounded-xl text-sm font-medium border transition-all ${
                        interviewType === type
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartInterview}
                disabled={!selectedRole || !interviewType}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <Brain className="w-5 h-5" />
                {resumeReport ? 'Generate Personalised Interview' : 'Start Interview'}
              </button>
            </div>
          </div>
        )}

        {/* ── LOADING (question gen / evaluation) ───────────────────────── */}
        {isLoading && (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center animate-fade-in">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-1">{loadingLabel}</p>
            <p className="text-sm text-gray-500">Groq llama-3.3-70b-versatile is thinking…</p>
            <div className="flex gap-1.5 justify-center mt-4">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── INTERVIEW ─────────────────────────────────────────────────── */}
        {step === 'interview' && questions.length > 0 && (
          <div className="animate-fade-in">
            {/* Progress */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(questions[currentQuestion].type)}`}>
                  {getTypeIcon(questions[currentQuestion].type)}
                  {questions[currentQuestion].type.charAt(0).toUpperCase() + questions[currentQuestion].type.slice(1)}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  2 min recommended
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
                {questions[currentQuestion].question}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer here… (Press Enter to submit, Shift+Enter for new line)"
                  className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        isRecording
                          ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      {isRecording ? 'Recording…' : 'Voice Input'}
                    </button>
                    <button onClick={handleSkip} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                      Skip
                    </button>
                  </div>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!answer.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Submit & Evaluate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS ───────────────────────────────────────────────────── */}
        {step === 'results' && (
          <div className="animate-fade-in">
            {/* Overall score */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 text-white mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Interview Complete</h2>
                  <p className="text-emerald-100">{selectedRole} — {interviewType} Interview</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold">{avgScore}%</div>
                  <div className="text-emerald-200 text-sm">Overall Score</div>
                </div>
              </div>
              {answeredQs.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[
                    { label: 'Correctness', value: Math.round(answeredQs.reduce((s, q) => s + q.evaluation!.correctness, 0) / answeredQs.length) },
                    { label: 'Communication', value: Math.round(answeredQs.reduce((s, q) => s + q.evaluation!.communication, 0) / answeredQs.length) },
                    { label: 'Confidence', value: Math.round(answeredQs.reduce((s, q) => s + q.evaluation!.confidence, 0) / answeredQs.length) },
                  ].map(m => (
                    <div key={m.label} className="text-center bg-white/10 rounded-xl p-3">
                      <div className="text-2xl font-bold">{m.value}%</div>
                      <div className="text-emerald-200 text-sm">{m.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Per-question review */}
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={q.id} className="bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(q.type)}`}>
                        {getTypeIcon(q.type)}
                        {q.type}
                      </span>
                      <span className="text-sm text-gray-400">Q{i + 1}</span>
                    </div>
                    {q.evaluation && (
                      <span className={`text-lg font-bold ${getScoreColor(q.evaluation.overall)}`}>
                        {q.evaluation.overall}%
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 font-medium mb-3 leading-relaxed">{q.question}</p>

                  {q.answer ? (
                    <div className="bg-gray-50 rounded-xl p-4 mb-3">
                      <p className="text-sm text-gray-600 italic">{q.answer}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      <p className="text-sm text-gray-400 italic">Question skipped</p>
                    </div>
                  )}

                  {q.evaluation && (
                    <>
                      <div className="flex flex-wrap gap-3 mb-3">
                        {[
                          { label: 'Correctness', value: q.evaluation.correctness },
                          { label: 'Communication', value: q.evaluation.communication },
                          { label: 'Confidence', value: q.evaluation.confidence },
                        ].map(m => (
                          <div key={m.label} className={`px-3 py-1 rounded-lg border text-sm ${getScoreBg(m.value)}`}>
                            <span className="text-gray-500">{m.label}: </span>
                            <span className={`font-semibold ${getScoreColor(m.value)}`}>{m.value}%</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{q.evaluation.feedback}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => { setStep('setup'); setQuestions([]); setCurrentQuestion(0) }}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/25"
              >
                Practice Again
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-2xl font-semibold transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Generic fallback (no resume) ─────────────────────────────────────────────
function genericFallback(interviewType: string): Question[] {
  const all: Record<string, Question[]> = {
    Technical: [
      { id: 1, type: 'technical', question: 'Explain the difference between REST and GraphQL. When would you choose one over the other?' },
      { id: 2, type: 'technical', question: 'How do you approach debugging a performance issue in a production web application?' },
      { id: 3, type: 'technical', question: 'Describe how you would design a URL shortening service at scale.' },
    ],
    Behavioral: [
      { id: 4, type: 'behavioral', question: 'Tell me about a time you had to deal with a significant technical challenge. How did you overcome it?' },
      { id: 5, type: 'behavioral', question: 'Describe a project you are most proud of and your specific contribution.' },
      { id: 6, type: 'behavioral', question: 'How do you handle tight deadlines with competing priorities?' },
    ],
    HR: [
      { id: 7, type: 'behavioral', question: 'Why are you looking for a new role, and what are you hoping to find?' },
      { id: 8, type: 'behavioral', question: 'Where do you see yourself in 3–5 years?' },
      { id: 9, type: 'situational', question: 'What is your biggest professional strength, and how have you applied it recently?' },
    ],
  }
  if (interviewType === 'Mixed') {
    return [
      ...(all.Technical?.slice(0, 2) ?? []),
      ...(all.Behavioral?.slice(0, 2) ?? []),
      ...(all.HR?.slice(0, 1) ?? []),
    ]
  }
  return (all[interviewType] ?? all.Technical).map(q => ({ ...q, answer: '', evaluation: undefined }))
}
