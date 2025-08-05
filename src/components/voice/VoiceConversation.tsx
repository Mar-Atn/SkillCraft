import React, { useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';

interface Message {
  speaker: string;
  text: string;
  id: number;
}

const VoiceConversation: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready to start conversation');
  const [statusType, setStatusType] = useState('');

  const updateStatus = (newStatus: string, type: string = '') => {
    setStatus(newStatus);
    setStatusType(type);
  };

  const addMessage = (speaker: string, text: string) => {
    setMessages(prev => [...prev, { speaker, text, id: Date.now() }]);
  };

  const handleMessage = useCallback((message: any) => {
    console.log('Received message:', message);
    
    switch (message.type) {
      case 'conversation_initiation_metadata':
        console.log('Conversation started:', message);
        addMessage('System', 'Conversation started - you can begin speaking');
        updateStatus('Connected - Start speaking!', 'listening');
        break;
        
      case 'user_transcript':
        if (message.user_transcript?.trim()) {
          addMessage('You', message.user_transcript);
        }
        break;
        
      case 'agent_response':
        if (message.agent_response?.trim()) {
          addMessage('Alex', message.agent_response);
        }
        break;
        
      case 'audio_event':
        updateStatus('AI is speaking...', 'speaking');
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      updateStatus('Connected - requesting microphone...', 'connected');
    },
    onMessage: handleMessage,
    onAudio: (audioBuffer: any) => {
      console.log('Received audio buffer:', audioBuffer);
      updateStatus('AI is speaking...', 'speaking');
      // The SDK will handle audio playback automatically
      setTimeout(() => {
        updateStatus('Listening...', 'listening');
      }, 1000);
    },
    onError: (error: any) => {
      console.error('Conversation error:', error);
      updateStatus(`Error: ${error.message}`, 'error');
      setIsActive(false);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      updateStatus('Disconnected', '');
      setIsActive(false);
    }
  });

  const start = async () => {
    try {
      updateStatus('Connecting to ElevenLabs...', 'connecting');
      setIsActive(true);
      
      // Using working agent ID from NM project temporarily
      // TODO: Replace with SkillCraft-specific agent ID after creating agent
      await conversation.startSession({
        agentId: 'agent_7601k1g0796kfj2bzkcds0bkmw2m', // Working agent ID
        connectionType: 'websocket'
      });
      
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      updateStatus(`Failed to start: ${error.message}`, 'error');
      setIsActive(false);
    }
  };

  const stop = async () => {
    try {
      await conversation.endSession();
      updateStatus('Conversation stopped', '');
      setIsActive(false);
    } catch (error: any) {
      console.error('Failed to stop conversation:', error);
      updateStatus(`Failed to stop: ${error.message}`, 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Voice Conversation</h2>
        <div className={`p-3 rounded-lg font-medium ${
          statusType === 'connected' ? 'bg-green-50 text-green-700 border border-green-200' :
          statusType === 'listening' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
          statusType === 'speaking' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
          statusType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-gray-50 text-gray-700 border border-gray-200'
        }`}>
          {status}
        </div>
      </div>

      <div className="flex justify-center mb-6">
        {!isActive ? (
          <button 
            onClick={start}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Start Conversation
          </button>
        ) : (
          <button 
            onClick={stop}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            End Conversation
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.map(({ speaker, text, id }) => (
          <div key={id} className={`p-3 rounded-lg ${
            speaker === 'You' 
              ? 'bg-blue-50 ml-8 border-l-4 border-blue-400' 
              : speaker === 'System'
              ? 'bg-green-50 border-l-4 border-green-400'
              : 'bg-gray-50 mr-8 border-l-4 border-gray-400'
          }`}>
            <div className="font-medium text-sm text-gray-600 mb-1">{speaker}</div>
            <div>{text}</div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start a conversation to begin practicing!
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceConversation;