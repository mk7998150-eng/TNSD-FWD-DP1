// Minimal HTML structure expected (example):
// <div class="chat-app">
//   <div class="chat-header"><div class="dot"></div><h1>Nova</h1><div class="sub">Your quick AI helper</div></div>
//   <div id="log" class="chat-log"></div>
//   <div class="chat-input">
//     <textarea id="input" placeholder="Ask me anything..."></textarea>
//     <button id="send" class="button">Send</button>
//   </div>
// </div>

const $ = (sel, root = document) => root.querySelector(sel);

const logEl = $('#log');
const inputEl = $('#input');
const sendBtn = $('#send');

// Basic "AI" intent rules (you can extend these)
const intents = [
  {
    name: 'greeting',
    test: (t) => /\b(hi|hello|hey|namaste|vanakkam)\b/i.test(t),
    reply: () => pick([
      'Hey! What are you curious about today?',
      'Hello there — ready when you are.',
      'Hi! Ask me anything.'
    ])
  },
  {
    name: 'time',
    test: (t) => /\b(time|clock|what.*time)\b/i.test(t),
    reply: () => new Date().toLocaleString()
  },
  {
    name: 'weather',
    test: (t) => /\b(weather|rain|sunny|temperature)\b/i.test(t),
    reply: () => 'I can’t fetch live weather here, but you can tell me your city and what you’re seeing.'
  },
  {
    name: 'farewell',
    test: (t) => /\b(bye|goodbye|see you|later)\b/i.test(t),
    reply: () => 'Take care. Come back when you want to explore more.'
  }
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Render helpers
function addMessage(role, text, { typing=false } = {}) {
  const row = document.createElement('div');
  row.className = 'message';

  const avatar = document.createElement('div');
  avatar.className = `avatar ${role}`;
  avatar.textContent = role === 'user' ? 'U' : 'N';

  const bubble = document.createElement('div');
  bubble.className = `bubble ${role}`;

  if (typing) {
    bubble.innerHTML = `
      <span class="typing">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </span>
    `;
  } else {
    bubble.textContent = text;
  }

  row.appendChild(avatar);
  row.appendChild(bubble);
  logEl.appendChild(row);
  logEl.scrollTop = logEl.scrollHeight;

  return { row, bubble };
}

function setTyping(node, on) {
  if (!node) return;
  node.innerHTML = on
    ? `<span class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>`
    : node.textContent;
}

// “AI” pipeline: simple rule match with a fallback generator
async function generateReply(prompt) {
  const text = prompt.trim();
  if (!text) return 'Say something and I’ll follow.';

  // Try intents
  const hit = intents.find((i) => i.test(text));
  if (hit) return hit.reply(text);

  // Tiny heuristic replies
  if (/\?$/.test(text)) {
    return 'Good question. What makes you ask that?';
  }
  if (text.length < 10) {
    return 'Tell me a bit more so I can be useful.';
  }
  // Reflective default
  return `I’m hearing: "${text}". What part matters most to you right now?`;
}

// Send flow
async function handleSend() {
  const value = inputEl.value;
  if (!value.trim()) return;

  inputEl.value = '';
  sendBtn.disabled = true;

  addMessage('user', value);

  const { bubble } = addMessage('bot', '', { typing: true });

  // Simulate thinking
  await delay(300 + Math.random() * 400);

  const reply = await generateReply(value);

  // Replace typing with reply
  bubble.textContent = reply;
  sendBtn.disabled = false;
  logEl.scrollTop = logEl.scrollHeight;
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// Wire events
sendBtn?.addEventListener('click', handleSend);
inputEl?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

// OPTIONAL: Hook up to your backend AI endpoint instead of generateReply()
// async function generateReply(prompt) {
//   const res = await fetch('/api/chat', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ prompt })
//   });
//   if (!res.ok) throw new Error('Request failed');
//   const data = await res.json();
//   return data.reply;
// }