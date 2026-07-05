// Simulated backend. In a real app this file would be replaced by a fetch()
// call to a real streaming endpoint (e.g. Server-Sent Events or a ReadableStream).
//
// generateReply() below is rule-based rather than a real model, but it
// actually reads the user's message and reacts to it: greetings, questions,
// thanks, farewells, and requests for a joke or help each get a distinct
// reply, and the fallback case quotes the message back so the response is
// always visibly tied to what was typed, not picked from a fixed pool.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const GREETING_WORDS = ['hi', 'hello', 'hey', 'yo', 'sup', 'good morning', 'good evening']
const THANKS_WORDS = ['thank you', 'thanks', 'thx', 'appreciate it']
const BYE_WORDS = ['bye', 'goodbye', 'see you', 'later', 'farewell']

function truncate(text, maxLen = 60) {
  const trimmed = text.trim()
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen).trim() + '…' : trimmed
}

function includesAny(haystack, words) {
  return words.some((w) => haystack.includes(w))
}

/**
 * Produces a reply that is actually derived from the user's message content,
 * rather than picked at random from a fixed list.
 */
function generateReply(userMessage) {
  const raw = userMessage.trim()
  const lower = raw.toLowerCase()
  const wordCount = raw.split(/\s+/).filter(Boolean).length
  const isQuestion = raw.endsWith('?')

  if (includesAny(lower, GREETING_WORDS) && wordCount <= 4) {
    return "Hey there! What would you like to talk about?"
  }

  if (includesAny(lower, THANKS_WORDS)) {
    return "You're welcome! Let me know if there's anything else you'd like to go over."
  }

  if (includesAny(lower, BYE_WORDS) && wordCount <= 4) {
    return 'Take care! Come back any time you want to chat.'
  }

  if (lower.includes('joke')) {
    return 'Why do programmers prefer dark mode? Because light attracts bugs.'
  }

  if (lower.includes('your name') || lower === 'who are you') {
    return "I'm a mock assistant built for this demo, so I don't have a name of my own, just a job to do."
  }

  if (lower.includes('help')) {
    return `Happy to help with "${truncate(raw)}". Since I'm a simulated assistant, I can't look anything up, but I can show you how streamed responses and error handling work in this UI.`
  }

  if (isQuestion) {
    return `That's a good question: "${truncate(raw)}". I'm a mock backend, so I don't have a real answer, but this reply shows how your question flows through, streams back, and renders in the chat.`
  }

  if (wordCount === 1) {
    return `Just "${raw}"? I can work with that. Give me a bit more detail and I'll tailor my reply to it.`
  }

  if (wordCount > 25) {
    return `That's a detailed message (${wordCount} words). The key part I picked up on was: "${truncate(raw, 80)}". In a real integration this is where the actual model's answer would stream in.`
  }

  return `You said: "${truncate(raw)}". Here's a simulated reply that reflects it back, since this demo streams text without a real model behind it.`
}

/**
 * Simulates a streaming chat completion.
 * Yields small text chunks with a randomized delay between them, mimicking
 * token-by-token generation. Throws an error if the user message contains
 * the word "error", so the UI's error handling can be exercised on demand.
 *
 * @param {string} userMessage
 * @returns {AsyncGenerator<string>}
 */
export async function* streamAssistantReply(userMessage) {
  await wait(500) // initial "thinking" delay before the first token

  if (userMessage.toLowerCase().includes('error')) {
    throw new Error(
      'The assistant service is temporarily unavailable. Please try again.'
    )
  }

  const fullReply = generateReply(userMessage)
  const words = fullReply.split(' ')

  for (let i = 0; i < words.length; i++) {
    await wait(40 + Math.random() * 90)
    // Re-add the space we split on, except before the very first word.
    yield i === 0 ? words[i] : ' ' + words[i]
  }
}
