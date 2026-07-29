import type { ResumeReport } from './pages/ResumeAnalyzer'

export interface User {
  name?: string
  email: string
}

export interface ResumeHistoryItem {
  id: string
  date: string
  timestamp: number
  report: ResumeReport
}

export interface InterviewSession {
  id: string
  date: string
  timestamp: number
  role: string
  type: string
  score: number
  questionsCount: number
  evaluationsCount: number
}

export interface ActivityItem {
  id: string
  action: string
  detail: string
  time: string
  type: 'resume' | 'interview' | 'progress'
}
