import { ArrowRight, Sparkles, FileText, MessageSquare, TrendingUp } from 'lucide-react'

interface Props {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: Props) {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CareerCoach AI</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/25"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-brand-200/30 to-brand-400/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-200 rounded-full text-brand-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Career Development
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 text-balance">
              Your Personal{' '}
              <span className="gradient-text">AI Career Coach</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Get your resume analyzed by AI, practice interviews with intelligent feedback, 
              and track your career growth — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-semibold text-lg transition-all duration-200 hover:shadow-xl hover:shadow-brand-500/30 flex items-center gap-2"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-2xl font-semibold text-lg transition-all duration-200">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Two Powerful AI Agents</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              One to perfect your resume, another to ace your interviews.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group relative bg-gradient-to-br from-brand-50 to-white rounded-3xl p-8 border border-brand-100 card-hover">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-brand-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Resume Analyzer</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                AI-powered ATS analysis that extracts skills, experience, and education from your resume. 
                Get actionable suggestions to improve your match rate.
              </p>
              <ul className="space-y-3">
                {['Resume parsing & skill extraction', 'ATS score calculation', 'Job description matching', 'Improvement suggestions'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="group relative bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-8 border border-emerald-100 card-hover">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Interview Assistant</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Practice with an AI interviewer that adapts to your role and experience level. 
                Get real-time feedback on your answers.
              </p>
              <ul className="space-y-3">
                {['Role-specific questions', 'Technical & behavioral modes', 'Real-time answer evaluation', 'Confidence & clarity scoring'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to accelerate your career.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Your Resume',
                description: 'Upload your resume in PDF format. Optionally add a job description for targeted analysis.',
                icon: FileText,
              },
              {
                step: '02',
                title: 'Practice Interviews',
                description: 'Choose your role and interview type. Answer AI-generated questions and get instant feedback.',
                icon: MessageSquare,
              },
              {
                step: '03',
                title: 'Track Progress',
                description: 'Monitor your improvement over time with detailed analytics and performance charts.',
                icon: TrendingUp,
              },
            ].map((item) => (
              <div key={item.step} className="relative p-8 rounded-2xl border border-gray-100 hover:border-brand-100 transition-colors group">
                <div className="text-6xl font-extrabold text-brand-100 group-hover:text-brand-200 transition-colors mb-4">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-balance">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have improved their resumes and aced their interviews.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-semibold text-lg transition-all duration-200 hover:shadow-xl hover:shadow-brand-500/30 inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-white font-semibold">CareerCoach AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-sm">© 2026 CareerCoach AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
