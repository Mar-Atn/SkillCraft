import { Link } from 'react-router-dom'
import { Mic, Target, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          SkillCraft
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Master critical conversations with AI-powered voice training. 
          Practice setting expectations and leading teams effectively.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Mic className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Voice-Powered</h3>
          <p className="text-slate-600">
            Natural conversations with AI personas using cutting-edge voice synthesis
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Target className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Targeted Scenarios</h3>
          <p className="text-slate-600">
            Practice specific situations like performance reviews and deadline discussions
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <TrendingUp className="w-12 h-12 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
          <p className="text-slate-600">
            Measure improvement with detailed feedback and performance analytics
          </p>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/practice"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          <Users className="w-5 h-5" />
          Start Practicing
        </Link>
      </div>

      <section className="mt-24 bg-white rounded-xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              1
            </div>
            <h4 className="font-semibold mb-2">Choose Scenario</h4>
            <p className="text-sm text-slate-600">
              Select from our library of real-world situations
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              2
            </div>
            <h4 className="font-semibold mb-2">Start Conversation</h4>
            <p className="text-sm text-slate-600">
              Engage in natural dialogue with AI team members
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              3
            </div>
            <h4 className="font-semibold mb-2">Get Feedback</h4>
            <p className="text-sm text-slate-600">
              Receive instant insights on your communication
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              4
            </div>
            <h4 className="font-semibold mb-2">Track Progress</h4>
            <p className="text-sm text-slate-600">
              Monitor improvement over time with analytics
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}