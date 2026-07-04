# Chat Stream UI

A polished, minimal chat interface built with **React + Vite**. It simulates
sending a message to an API and streaming the assistant's response back
chunk-by-chunk, complete with loading and error states.

This project uses a **mock API** (`src/mockApi.js`) instead of a real
backend, so it runs entirely in the browser with no server or API key
required.

## Features

- Clean chat UI with distinct user / assistant bubbles
- Simulated token-by-token streaming via an async generator
- Loading (typing indicator + spinner) and error states
- Input + Send button disabled while streaming
- Send with the Enter key
- Empty/whitespace-only messages are blocked
- Auto-scroll to the latest message
- Responsive layout for desktop and mobile

## Project structure

```
chat-stream-ui/
├── package.json
├── index.html
├── README.md
├── vite.config.js
└── src/
    ├── main.jsx      # React entry point
    ├── App.jsx       # Chat UI + streaming logic
    ├── mockApi.js    # Simulated streaming API
    └── styles.css    # Styling
```

## 1. Install dependencies

Requires Node.js 18+.

```bash
npm install
```

## 2. Run locally

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). Open it in
your browser.

Other available scripts:

```bash
npm run build     # production build into dist/
npm run preview   # preview the production build locally
```

## 3. Testing the loading state

Type any normal message (e.g. `Hello there`) and press **Enter** or click
**Send**. You'll see:

1. A brief pause (~500ms) while the input and button are disabled.
2. A typing indicator (three bouncing dots) in the assistant bubble.
3. The response text streaming in progressively, word by word.

## 4. Testing the error state

Type a message that contains the word **"error"** (case-insensitive), for
example:

```
Can you trigger an error for me?
```

The mock API is designed to intentionally fail on any message containing
that word. You'll see a red alert-style banner appear above the input with
an error message, and the partially-created assistant bubble is removed. A
small hint below the input (`Type "error" to test the error state.`)
reminds you of this at all times.

## 5. Pushing to a public GitHub repository

From inside the `chat-stream-ui` folder:

```bash
git init
git add .
git commit -m "Initial commit: chat stream UI"
```

Then create a new **public** repository on GitHub (via the GitHub website
or the `gh` CLI):

```bash
gh repo create chat-stream-ui --public --source=. --remote=origin --push
```

Or, if you created the repo manually on github.com:

```bash
git remote add origin https://github.com/<your-username>/chat-stream-ui.git
git branch -M main
git push -u origin main
```

## Notes on the mock API

`src/mockApi.js` exports an async generator, `streamAssistantReply`, which:

- Waits ~500ms to simulate initial latency.
- Throws an `Error` if the user's message contains "error", so you can
  exercise the UI's error handling on demand.
- Otherwise picks one of a few canned replies (deterministically based on
  the input, so the same message always yields the same reply) and yields
  it word-by-word with a small randomized delay between chunks.

To connect this UI to a real backend, replace the body of
`streamAssistantReply` with a `fetch()` call to your streaming endpoint
(e.g. Server-Sent Events or a `ReadableStream` response), yielding each
chunk of text as it arrives instead of the simulated delays.
