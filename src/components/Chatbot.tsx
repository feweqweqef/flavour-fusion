'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your Flavour Fusion assistant 🍽️ Ask me anything about recipes or cooking!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    
    const history = messages.slice(1).map(m => ({
  role: m.role,
  content: m.content
}))

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, history })
    })

    let data

try {
  data = await response.json()
} catch {
  setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Invalid response from server' }])
  setLoading(false)
  return
}
    setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    setLoading(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat window */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-2xl shadow-xl border border-gray-100 w-80 sm:w-96 flex flex-col" style={{ height: '500px' }}>
          {/* Header */}
          <div className="bg-orange-500 rounded-t-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍽️</span>
              <div>
                <p className="text-white font-semibold text-sm">Flavour Assistant</p>
                <p className="text-orange-100 text-xs">Ask me anything about cooking!</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-orange-200 transition">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gray-500">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about recipes..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm transition disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-orange-500 hover:bg-orange-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition"
      >
        {isOpen ? '✕' : '🍽️'}
      </button>
    </div>
  )
}