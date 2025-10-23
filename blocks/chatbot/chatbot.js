export default function decorate(block) {
  const chatContainer = document.createElement('div');
  chatContainer.className = 'chat-container';

  const chatHeader = document.createElement('div');
  chatHeader.className = 'chat-header';
  chatHeader.innerHTML = `
    <div class="chat-title">
      <span class="chat-icon">🤖</span>
      <h3>Adobe Product Assistant</h3>
    </div>
    <button class="chat-toggle" aria-label="Toggle chat">
      <span class="toggle-icon">−</span>
    </button>
  `;

  const chatMessages = document.createElement('div');
  chatMessages.className = 'chat-messages';
  chatMessages.innerHTML = `
    <div class="message bot-message">
      <div class="message-content">
        <span class="typing-indicator">Hello! I'm your Adobe Product Assistant. Ask me anything about Adobe products and services!</span>
      </div>
    </div>
  `;

  const chatInput = document.createElement('div');
  chatInput.className = 'chat-input-container';
  chatInput.innerHTML = `
    <div class="agent-selector">
      <label for="agent-style">Agent Style:</label>
      <select id="agent-style" class="agent-style-dropdown">
        <option value="casual" selected>Casual & Friendly</option>
        <option value="formal">Formal & Professional</option>
        <option value="funny">Funny & Witty</option>
        <option value="hilarious">Hilarious & Comedic</option>
      </select>
    </div>
    <div class="chat-input-wrapper">
      <textarea 
        class="chat-input" 
        placeholder="Ask about Adobe products..." 
        rows="1"
        maxlength="500"
      ></textarea>
      <button class="chat-send-btn" aria-label="Send message">
        ↩️
      </button>
    </div>
    <div class="chat-status">
      <span class="status-text">Connected</span>
    </div>
  `;

  chatContainer.appendChild(chatHeader);
  chatContainer.appendChild(chatMessages);
  chatContainer.appendChild(chatInput);

  const chatToggle = chatContainer.querySelector('.chat-toggle');
  const toggleIcon = chatContainer.querySelector('.toggle-icon');
  const messagesContainer = chatContainer.querySelector('.chat-messages');
  const inputContainer = chatContainer.querySelector('.chat-input-container');
  const textarea = chatContainer.querySelector('.chat-input');
  const sendBtn = chatContainer.querySelector('.chat-send-btn');
  const statusText = chatContainer.querySelector('.status-text');
  const agentStyleSelect = chatContainer.querySelector('.agent-style-dropdown');

  let isMinimized = false;
  let isTyping = false;

  // Auto-resize textarea
  textarea.addEventListener('input', function autoResize() {
    this.style.height = 'auto';
    this.style.height = `${Math.min(this.scrollHeight, 120)}px`;
  });

  // Toggle chat minimize/maximize
  chatToggle.addEventListener('click', () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      messagesContainer.style.display = 'none';
      inputContainer.style.display = 'none';
      toggleIcon.textContent = '+';
      chatContainer.classList.add('minimized');
    } else {
      messagesContainer.style.display = 'block';
      inputContainer.style.display = 'block';
      toggleIcon.textContent = '−';
      chatContainer.classList.remove('minimized');
    }
  });

  // Add message to chat
  function addMessage(content, isBot = false, isTypingMsg = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'}`;

    if (isTypingMsg) {
      messageDiv.innerHTML = `
        <div class="message-content">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="message-content">
          <span class="message-text">${content}</span>
        </div>
      `;
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageDiv;
  }

  // Type effect for bot messages
  function typeMessage(element, text, speed = 30) {
    const textSpan = element.querySelector('.message-text') || element.querySelector('.typing-indicator');
    if (!textSpan) return;

    textSpan.textContent = '';
    let i = 0;

    function typeChar() {
      if (i < text.length) {
        textSpan.textContent += text.charAt(i);
        i += 1;
        setTimeout(typeChar, speed + Math.random() * 20);
      } else {
        isTyping = false;
        statusText.textContent = 'Connected';
      }
    }

    typeChar();
  }

  // Get agent style prompts
  function getStylePrompt(style) {
    const stylePrompts = {
      casual: `You are a friendly Adobe Product Assistant! 🎨 Help users with Adobe Creative Cloud, Document Cloud, and Experience Cloud products.

CRITICAL REQUIREMENTS:
- ALWAYS keep responses SHORT and CONCISE (2-3 sentences maximum)
- Be warm, enthusiastic, and conversational
- Use emojis occasionally to be friendly
- Give quick, actionable answers only
- If unsure, say "Not sure about that - check Adobe Support!"`,

      formal: `You are a professional Adobe Product Specialist providing expert assistance with Adobe Creative Cloud, Document Cloud, and Experience Cloud products.

CRITICAL REQUIREMENTS:
- ALWAYS keep responses SHORT and CONCISE (2-3 sentences maximum)
- Maintain professional, courteous demeanor
- Use proper technical terminology
- Deliver precise, brief information only
- If uncertain, say "Please contact Adobe Technical Support for detailed assistance."`,

      funny: `You are a witty Adobe Product Assistant with a great sense of humor! 😄 Help users with Adobe Creative Cloud, Document Cloud, and Experience Cloud products.

CRITICAL REQUIREMENTS:
- ALWAYS keep responses SHORT and CONCISE (2-3 sentences maximum)
- Be clever, witty, and entertaining
- Add one quick joke or pun per response
- Keep humor light and responses brief
- If unsure, say "That's a stumper! Try Adobe Support for the real answer!"`,

      hilarious: `You are the FUNNIEST Adobe Product Assistant ever! 🤣 Help users with Adobe Creative Cloud, Document Cloud, and Experience Cloud products while being absolutely hilarious.

CRITICAL REQUIREMENTS:
- ALWAYS keep responses SHORT and CONCISE (2-3 sentences maximum)
- Be outrageously funny with quick jokes
- Use one silly analogy or comedic reference per response
- Make every answer brief but hilarious
- If unsure, say "My comedy brain is broken! Adobe Support to the rescue!"`,
    };

    return stylePrompts[style] || stylePrompts.casual;
  }

  // Call Gemini API
  async function callGeminiAPI(prompt) {
    // Note: Replace 'YOUR_GEMINI_API_KEY' with actual API key
    const API_KEY = 'AIzaSyDY0izI58HQm71cIzGxuWbz3YYyZC_ZboI'; // This should be moved to environment variables

    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const selectedStyle = agentStyleSelect.value;
    const stylePrompt = getStylePrompt(selectedStyle);

    try {
      statusText.textContent = 'Thinking...';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${stylePrompt}

SCOPE:
- ONLY answer Adobe-related questions (products, features, pricing, tutorials, troubleshooting)
- For non-Adobe topics, redirect according to your style while mentioning Adobe products

User Question: ${prompt}

Response:`,
            }],
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // eslint-disable-next-line no-console
        console.error(`API request failed: ${response.status} - ${errorText}`);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log('Gemini API Response:', data);
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
        || "I'm sorry, I couldn't process your request right now. Please try again.";

      return botResponse;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Gemini API Error Details:', error);
      // eslint-disable-next-line no-console
      console.error('Error message:', error.message);
      return "I'm experiencing technical difficulties. Please try again later or contact support for help with Adobe products.";
    }
  }

  // Send message
  async function sendMessage() {
    const message = textarea.value.trim();
    if (!message || isTyping) return;

    addMessage(message, false);
    textarea.value = '';
    textarea.style.height = 'auto';

    isTyping = true;
    const typingMessage = addMessage('', true, true);

    try {
      const botResponse = await callGeminiAPI(message);
      typingMessage.remove();
      const botMessage = addMessage('', true);
      typeMessage(botMessage, botResponse);
    } catch (error) {
      typingMessage.remove();
      addMessage('Sorry, I encountered an error. Please try again.', true);
      isTyping = false;
      statusText.textContent = 'Connected';
    }
  }

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Initial typing effect for welcome message
  setTimeout(() => {
    const welcomeMessage = chatContainer.querySelector('.typing-indicator');
    if (welcomeMessage) {
      typeMessage(
        welcomeMessage.closest('.message'),
        'Hello! I\'m your Adobe Product Assistant. Ask me anything about Adobe products and services!',
      );
    }
  }, 500);

  block.replaceChildren(chatContainer);
}
