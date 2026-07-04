import { useEffect, useRef, useState } from 'react'
import { streamAssistantReply } from './mockApi'

let idCounter = 0
const nextId = () => `msg-${++idCounter}`

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: nextId(),
      role: 'assistant',
      content: "Hi! I'm a mock assistant. Send me a message to see the streamed response in action.",
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)

  const scrollAnchorRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isStreaming])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return

    setError(null)
    setInput('')

    const userMessage = { id: nextId(), role: 'user', content: trimmed }
    const assistantId = nextId()
    const assistantPlaceholder = { id: assistantId, role: 'assistant', content: '' }

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder])
    setIsStreaming(true)

    try {
      for await (const chunk of streamAssistantReply(trimmed)) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        )
      }
    } catch (err) {
      // Remove the empty/partial assistant bubble and surface an error banner instead.
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="page">
      <div className="chat-card">
        <header className="chat-header">
          <div className="chat-header-info">
            <div className="avatar avatar-assistant" aria-hidden="true">A</div>
            <div>
              <h1>Assistant</h1>
              <span className="status">
                <span className="status-dot" />
                Online
              </span>
            </div>
          </div>
        </header>

        <div className="chat-messages">
          {messages.map((m) => (
            <div key={m.id} className={`bubble-row bubble-row-${m.role}`}>
              <div className={`bubble bubble-${m.role}`}>
                {m.content.length > 0 ? (
                  m.content
                ) : (
                  <TypingIndicator />
                )}
              </div>
            </div>
          ))}
          <div ref={scrollAnchorRef} />
        </div>

        {error && (
          <div className="error-banner" role="alert">
            <strong>Something went wrong.</strong> {error}
          </div>
        )}

        <div className="chat-input-area">
          <p className="hint">Type &ldquo;error&rdquo; to test the error state.</p>
          <div className="input-row">
            <input
              ref={inputRef}
              type="text"
              value={input}
              placeholder="Message the assistant…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              aria-label="Message input"
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || input.trim().length === 0}
            >
              {isStreaming ? <Spinner /> : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <span className="typing-indicator" aria-label="Assistant is typing">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </span>
  )
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />
}
