import { Link } from 'react-router-dom'
import { Award, Clock, MessageSquare, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { label: 'Sessions Completed', value: '0', icon: MessageSquare },
    { label: 'Practice Time', value: '0 min', icon: Clock },
    { label: 'Average Score', value: '-', icon: TrendingUp },
    { label: 'Achievements', value: '0', icon: Award },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Progress Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-lg p-6">
            <stat.icon className="w-8 h-8 text-blue-600 mb-3" />
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-slate-600 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
          <div className="text-center py-8 text-slate-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No sessions yet</p>
            <Link 
              to="/practice" 
              className="text-blue-600 hover:text-blue-700 font-semibold mt-2 inline-block"
            >
              Start your first practice session
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Skills Progress</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Clarity</span>
                <span className="text-sm text-slate-600">-</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '0%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Empathy</span>
                <span className="text-sm text-slate-600">-</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '0%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Assertiveness</span>
                <span className="text-sm text-slate-600">-</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '0%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold mb-2">Ready to improve your leadership skills?</h3>
        <p className="text-slate-600 mb-4">
          Practice makes perfect. Start a new conversation scenario to build your confidence.
        </p>
        <Link
          to="/practice"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          Start Practice Session
        </Link>
      </div>
    </div>
  )
}