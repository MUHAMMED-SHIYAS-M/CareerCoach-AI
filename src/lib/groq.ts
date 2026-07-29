import type { ResumeReport } from '../pages/ResumeAnalyzer'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

function getKey(): string {
  const key = import.meta.env.VITE_GROQ_API_KEY
  if (!key) throw new Error('VITE_GROQ_API_KEY is not set in .env')
  return key
}

async function callGroq(
  messages: { role: string; content: string }[],
  temperature = 0.2,
  maxTokens = 2048
): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices[0].message.content as string
}

// ─── Resume Analysis ──────────────────────────────────────────────────────────

export async function analyzeResume(
  resumeText: string,
  jobDescription?: string
): Promise<ResumeReport> {
  const jobSection = jobDescription?.trim()
    ? `\nJob Description provided for matching:\n"""\n${jobDescription.trim()}\n"""\nCalculate jobMatch (0-100) as percentage overlap of resume keywords with job requirements.`
    : '\nNo job description provided. Set jobMatch to null.'

  const systemPrompt = `You are an expert ATS resume analyzer and career coach with 15+ years of experience.
Analyze resumes with strict, honest scoring — do NOT inflate scores.
Return ONLY valid JSON, no markdown, no explanation.`

  const userPrompt = `Analyze this resume and return a JSON report.

RESUME TEXT:
"""
${resumeText.slice(0, 6000)}
"""
${jobSection}

Return this exact JSON structure (fill all fields from the resume content):
{
  "name": "Candidate full name",
  "email": "email or empty string",
  "phone": "phone or empty string",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company",
      "duration": "2022 - Present",
      "highlights": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ],
  "education": [
    { "degree": "Degree name", "institution": "University", "year": "2020" }
  ],
  "certifications": ["cert1"],
  "projects": [
    { "name": "Project", "description": "What it does", "technologies": ["tech1"] }
  ],
  "scores": {
    "overall": 72,
    "ats": 68,
    "grammar": 85,
    "keyword": 70
  },
  "suggestions": [
    "Specific suggestion 1 based on what is actually missing",
    "Specific suggestion 2",
    "Specific suggestion 3",
    "Specific suggestion 4",
    "Specific suggestion 5"
  ],
  "jobMatch": null
}

Scoring guidelines (be strict and honest):
- overall: Overall quality — impact of achievements, clarity, structure, completeness
- ats: ATS-friendliness — simple formatting, keyword density, standard section headers, no tables
- grammar: Spelling, punctuation, tense consistency, professional tone
- keyword: Density of industry-relevant technical keywords for the candidate's field
- All scores 0-100. Average resume scores 60-75. Only exceptional resumes score above 90.
- suggestions: Give SPECIFIC, ACTIONABLE advice based on what is actually in the resume (or missing from it).`

  const raw = await callGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ])

  const parsed = JSON.parse(raw) as ResumeReport
  return parsed
}

// ─── Interview Question Generation ───────────────────────────────────────────

export interface GroqQuestion {
  id: number
  type: 'technical' | 'behavioral' | 'situational'
  question: string
}

export async function generateInterviewQuestions(
  resume: ResumeReport,
  role: string,
  interviewType: string
): Promise<GroqQuestion[]> {
  const count = interviewType === 'Mixed' ? 6 : 5

  const resumeSummary = `
Name: ${resume.name}
Skills: ${resume.skills.join(', ')}
Experience: ${resume.experience.map(e => `${e.title} at ${e.company} (${e.duration}): ${e.highlights[0] || ''}`).join(' | ')}
Projects: ${resume.projects.map(p => `${p.name} (${p.technologies.join(', ')})`).join(', ')}
Certifications: ${resume.certifications.join(', ') || 'None'}
Education: ${resume.education.map(e => `${e.degree} from ${e.institution}`).join(', ')}
`

  const typeGuide: Record<string, string> = {
    Technical: `All ${count} questions must be TECHNICAL — deep dive into their specific skills, projects, architecture decisions, debugging approaches.`,
    Behavioral: `All ${count} questions must be BEHAVIORAL — use STAR-method prompts referencing their actual work history and achievements.`,
    HR: `All ${count} questions must be HR-focused — motivation, culture fit, salary expectations, career goals, strengths/weaknesses.`,
    Mixed: `Mix: 2 technical questions about their skills/projects, 2 behavioral questions referencing their work history, 1 situational/problem-solving question, 1 HR/culture-fit question.`,
  }

  const systemPrompt = `You are a senior technical interviewer at a top tech company who has carefully read the candidate's resume.
Generate interview questions that are SPECIFIC to this candidate — reference their actual skills, companies, and projects.
Return ONLY valid JSON, no markdown.`

  const userPrompt = `Generate exactly ${count} interview questions for this candidate applying for ${role}.

CANDIDATE RESUME SUMMARY:
${resumeSummary}

INTERVIEW TYPE: ${interviewType}
${typeGuide[interviewType] || typeGuide.Mixed}

Rules:
- Reference the candidate's actual resume content (specific skills, company names, project names, achievements)
- Do NOT ask generic questions that could apply to anyone
- Each question should feel like the interviewer has read their resume carefully
- Make questions progressively challenging

Return this JSON:
{
  "questions": [
    { "id": 1, "type": "technical", "question": "Your detailed question here..." },
    { "id": 2, "type": "behavioral", "question": "Your detailed question here..." }
  ]
}`

  const raw = await callGroq(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    0.5,
    1500
  )

  const parsed = JSON.parse(raw) as { questions: GroqQuestion[] }
  return parsed.questions.slice(0, count)
}

// ─── Answer Evaluation ───────────────────────────────────────────────────────

export interface AnswerEvaluation {
  correctness: number
  communication: number
  confidence: number
  overall: number
  feedback: string
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  resumeContext?: string
): Promise<AnswerEvaluation> {
  const systemPrompt = `You are a strict but fair interview coach evaluating candidate answers.
Score honestly — a good but brief answer should score 65-75, not 90+.
Return ONLY valid JSON, no markdown.`

  const userPrompt = `Evaluate this interview answer.

QUESTION: ${question}

CANDIDATE'S ANSWER: "${answer}"
${resumeContext ? `\nCANDIDATE RESUME CONTEXT: ${resumeContext}` : ''}

Score criteria (0-100, be strict):
- correctness: Technical accuracy, relevance, completeness of the answer
- communication: Clarity, structure (STAR format if applicable), conciseness without rambling
- confidence: Assertiveness, use of concrete examples, avoidance of hedging ("maybe", "I think", "not sure")
- overall: Round((correctness * 0.4) + (communication * 0.35) + (confidence * 0.25))

Return this JSON:
{
  "correctness": 72,
  "communication": 68,
  "confidence": 75,
  "overall": 71,
  "feedback": "2-3 sentence specific feedback: what was done well, what was missing, and one concrete tip to improve the answer."
}

Scoring reference:
- 90-100: Exceptional, nearly perfect answer
- 80-89: Strong answer with minor gaps
- 70-79: Good answer but lacks depth or specific examples  
- 60-69: Average — too vague or missing key points
- Below 60: Weak — off-topic, very short, or technically incorrect`

  const raw = await callGroq(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    0.2,
    512
  )

  return JSON.parse(raw) as AnswerEvaluation
}
