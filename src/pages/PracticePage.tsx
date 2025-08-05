import VoiceConversation from '../components/voice/VoiceConversation'

export default function PracticePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Practice Setting Expectations</h1>
        <p className="text-slate-600">Alex - Senior Developer (missing deadlines)</p>
      </div>
      <VoiceConversation />
    </div>
  )
}