// Simulated backend. In a real app this file would be replaced by a fetch()
// call to a real streaming endpoint (e.g. Server-Sent Events or a ReadableStream).

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// A small pool of canned replies so responses feel varied without needing a
// real model behind them.
const REPLIES = [
  "That's a great question. Let me break it down for you step by step so it's easy to follow.",
  "Here's what I found: the short answer is yes, and there are a couple of details worth knowing.",
  "Thanks for sharing that. Based on what you described, I'd suggest starting with the simplest approach first.",
  "Sure, I can help with that. Here's a quick summary, and I'm happy to go deeper on any part of it.",
]

function pickReply(userMessage) {
  const index = Math.abs(hashCode(userMessage)) % REPLIES.length
  return REPLIES[index]
}

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
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

  const fullReply = pickReply(userMessage)
  const words = fullReply.split(' ')

  for (let i = 0; i < words.length; i++) {
    await wait(40 + Math.random() * 90)
    // Re-add the space we split on, except before the very first word.
    yield i === 0 ? words[i] : ' ' + words[i]
  }
}
