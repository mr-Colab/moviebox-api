# WhatsApp Bot Integration Guide

Step-by-step guide to integrate MovieBox API with your WhatsApp bot.

## 🎯 Supported WhatsApp Libraries

This integration works with:
- ✅ **whatsapp-web.js** - Browser-based WhatsApp client
- ✅ **Baileys** - Multi-device WhatsApp Web API
- ✅ **wppconnect** - WhatsApp Web API
- ✅ **venom-bot** - High-performance WhatsApp bot

## 📦 Setup

### Step 1: Install Prerequisites

```bash
# Install Python and moviebox-api
pip install moviebox-api

# Verify installation
python3 -c "import moviebox_api; print('✅ Ready')"
```

### Step 2: Copy MovieBox Node.js Files

Copy these files to your WhatsApp bot project:
```
your-bot-project/
├── moviebox/
│   ├── moviebox-client.js
│   ├── whatsapp-helper.js
│   └── README.md
```

### Step 3: Install WhatsApp Bot Library

Choose one:

```bash
# Option 1: whatsapp-web.js
npm install whatsapp-web.js qrcode-terminal

# Option 2: Baileys
npm install @whiskeysockets/baileys

# Option 3: wppconnect
npm install @wppconnect-team/wppconnect

# Option 4: venom-bot
npm install venom-bot
```

## 🚀 Integration Examples

### Integration 1: whatsapp-web.js

Complete working example:

```javascript
// bot.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const WhatsAppMovieHelper = require('./moviebox/whatsapp-helper');

// Initialize movie helper
const movieHelper = new WhatsAppMovieHelper({
  maxResults: 5,
  timeout: 30000
});

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// QR Code event
client.on('qr', (qr) => {
  console.log('🎬 MovieBox WhatsApp Bot');
  console.log('Scan this QR code with WhatsApp:\n');
  qrcode.generate(qr, { small: true });
});

// Ready event
client.on('ready', () => {
  console.log('✅ Bot is ready!');
  console.log('Send /help to any chat to see commands\n');
});

// Message event
client.on('message', async (msg) => {
  // Ignore group messages (optional)
  const chat = await msg.getChat();
  if (chat.isGroup) return;

  const text = msg.body.trim();
  
  // Only respond to commands
  if (!text.startsWith('/')) return;

  try {
    // Show typing indicator
    chat.sendStateTyping();

    let response;
    const command = text.toLowerCase();

    if (command === '/help' || command === '/start') {
      response = movieHelper.getHelpMessage();
    } 
    else if (command.startsWith('/search ')) {
      const query = text.substring(8).trim();
      if (!query) {
        response = '❌ Please provide a search query.\nExample: /search avatar';
      } else {
        response = await movieHelper.searchAndFormat(query, 'all');
      }
    } 
    else if (command.startsWith('/movie ')) {
      const query = text.substring(7).trim();
      if (!query) {
        response = '❌ Please provide a movie name.\nExample: /movie inception';
      } else {
        response = await movieHelper.searchAndFormat(query, 'movies');
      }
    } 
    else if (command.startsWith('/series ')) {
      const query = text.substring(8).trim();
      if (!query) {
        response = '❌ Please provide a series name.\nExample: /series breaking bad';
      } else {
        response = await movieHelper.searchAndFormat(query, 'series');
      }
    } 
    else if (command === '/trending') {
      response = await movieHelper.getTrendingFormatted(10);
    } 
    else if (command === '/popular') {
      response = await movieHelper.getPopularSearchesFormatted();
    } 
    else {
      response = '❓ Unknown command. Type /help to see available commands.';
    }

    // Clear typing indicator
    await chat.clearState();

    // Send response
    await msg.reply(response);

  } catch (error) {
    console.error('Error processing message:', error);
    await msg.reply('❌ An error occurred. Please try again later.');
  }
});

// Error event
client.on('auth_failure', () => {
  console.error('❌ Authentication failed');
});

// Initialize
client.initialize();
```

**Run the bot:**
```bash
node bot.js
```

### Integration 2: Baileys

```javascript
// bot-baileys.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const WhatsAppMovieHelper = require('./moviebox/whatsapp-helper');

const movieHelper = new WhatsAppMovieHelper({ maxResults: 5 });

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;
      
      if (shouldReconnect) {
        console.log('Reconnecting...');
        startBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot connected successfully');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text || '';

    if (!text.startsWith('/')) return;

    try {
      let response;
      const command = text.toLowerCase();

      if (command === '/help' || command === '/start') {
        response = movieHelper.getHelpMessage();
      } else if (command.startsWith('/search ')) {
        const query = text.substring(8).trim();
        response = query 
          ? await movieHelper.searchAndFormat(query, 'all')
          : '❌ Please provide a search query.';
      } else if (command.startsWith('/movie ')) {
        const query = text.substring(7).trim();
        response = query
          ? await movieHelper.searchAndFormat(query, 'movies')
          : '❌ Please provide a movie name.';
      } else if (command.startsWith('/series ')) {
        const query = text.substring(8).trim();
        response = query
          ? await movieHelper.searchAndFormat(query, 'series')
          : '❌ Please provide a series name.';
      } else if (command === '/trending') {
        response = await movieHelper.getTrendingFormatted(10);
      } else if (command === '/popular') {
        response = await movieHelper.getPopularSearchesFormatted();
      } else {
        response = '❓ Unknown command. Type /help for help.';
      }

      await sock.sendMessage(msg.key.remoteJid, { text: response });

    } catch (error) {
      console.error('Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ An error occurred. Please try again.'
      });
    }
  });
}

startBot();
```

### Integration 3: wppconnect

```javascript
// bot-wppconnect.js
const wppconnect = require('@wppconnect-team/wppconnect');
const WhatsAppMovieHelper = require('./moviebox/whatsapp-helper');

const movieHelper = new WhatsAppMovieHelper({ maxResults: 5 });

wppconnect
  .create({
    session: 'moviebox-bot',
    catchQR: (base64Qr, asciiQR) => {
      console.log('Scan this QR code:');
      console.log(asciiQR);
    },
    statusFind: (statusSession, session) => {
      console.log('Status:', statusSession);
    }
  })
  .then((client) => {
    console.log('✅ Bot started successfully');

    client.onMessage(async (message) => {
      if (message.isGroupMsg) return;
      if (!message.body.startsWith('/')) return;

      const text = message.body.trim();
      const command = text.toLowerCase();

      try {
        let response;

        if (command === '/help' || command === '/start') {
          response = movieHelper.getHelpMessage();
        } else if (command.startsWith('/search ')) {
          const query = text.substring(8).trim();
          response = query
            ? await movieHelper.searchAndFormat(query, 'all')
            : '❌ Please provide a search query.';
        } else if (command.startsWith('/movie ')) {
          const query = text.substring(7).trim();
          response = query
            ? await movieHelper.searchAndFormat(query, 'movies')
            : '❌ Please provide a movie name.';
        } else if (command.startsWith('/series ')) {
          const query = text.substring(8).trim();
          response = query
            ? await movieHelper.searchAndFormat(query, 'series')
            : '❌ Please provide a series name.';
        } else if (command === '/trending') {
          response = await movieHelper.getTrendingFormatted(10);
        } else if (command === '/popular') {
          response = await movieHelper.getPopularSearchesFormatted();
        } else {
          response = '❓ Unknown command. Type /help for help.';
        }

        await client.sendText(message.from, response);

      } catch (error) {
        console.error('Error:', error);
        await client.sendText(message.from, '❌ An error occurred.');
      }
    });
  })
  .catch((error) => {
    console.error('Error starting bot:', error);
  });
```

### Integration 4: venom-bot

```javascript
// bot-venom.js
const venom = require('venom-bot');
const WhatsAppMovieHelper = require('./moviebox/whatsapp-helper');

const movieHelper = new WhatsAppMovieHelper({ maxResults: 5 });

venom
  .create({
    session: 'moviebox-bot',
    multidevice: true
  })
  .then((client) => {
    console.log('✅ Bot started successfully');

    client.onMessage(async (message) => {
      if (message.isGroupMsg) return;
      if (!message.body.startsWith('/')) return;

      const text = message.body.trim();
      const command = text.toLowerCase();

      try {
        let response;

        if (command === '/help' || command === '/start') {
          response = movieHelper.getHelpMessage();
        } else if (command.startsWith('/search ')) {
          const query = text.substring(8).trim();
          response = query
            ? await movieHelper.searchAndFormat(query, 'all')
            : '❌ Please provide a search query.';
        } else if (command.startsWith('/movie ')) {
          const query = text.substring(7).trim();
          response = query
            ? await movieHelper.searchAndFormat(query, 'movies')
            : '❌ Please provide a movie name.';
        } else if (command.startsWith('/series ')) {
          const query = text.substring(8).trim();
          response = query
            ? await movieHelper.searchAndFormat(query, 'series')
            : '❌ Please provide a series name.';
        } else if (command === '/trending') {
          response = await movieHelper.getTrendingFormatted(10);
        } else if (command === '/popular') {
          response = await movieHelper.getPopularSearchesFormatted();
        } else {
          response = '❓ Unknown command. Type /help for help.';
        }

        await client.sendText(message.from, response);

      } catch (error) {
        console.error('Error:', error);
        await client.sendText(message.from, '❌ An error occurred.');
      }
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
```

## 🎨 Customization

### Add More Commands

```javascript
// Add a command for search suggestions
else if (command.startsWith('/suggest ')) {
  const keyword = text.substring(9).trim();
  response = keyword
    ? await movieHelper.getSuggestionsFormatted(keyword)
    : '❌ Please provide a keyword.';
}
```

### Rate Limiting

```javascript
const userCooldowns = new Map();
const COOLDOWN_MS = 5000; // 5 seconds

function checkCooldown(userId) {
  const now = Date.now();
  const lastCommand = userCooldowns.get(userId);
  
  if (lastCommand && (now - lastCommand) < COOLDOWN_MS) {
    return false;
  }
  
  userCooldowns.set(userId, now);
  return true;
}

// In message handler:
if (!checkCooldown(msg.from)) {
  await msg.reply('⏰ Please wait a few seconds before using another command.');
  return;
}
```

### Add Logging

```javascript
const fs = require('fs');

function logCommand(userId, command) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${userId}: ${command}\n`;
  fs.appendFileSync('bot-usage.log', logEntry);
}

// In message handler:
logCommand(msg.from, text);
```

### Group Support

```javascript
// Allow bot in specific groups only
const ALLOWED_GROUPS = [
  '123456789@g.us',
  '987654321@g.us'
];

client.on('message', async (msg) => {
  const chat = await msg.getChat();
  
  if (chat.isGroup) {
    if (!ALLOWED_GROUPS.includes(chat.id._serialized)) {
      return; // Ignore messages from unauthorized groups
    }
  }
  
  // ... rest of message handling
});
```

## 🐛 Debugging

Enable detailed logging:

```javascript
const DEBUG = true;

function debug(...args) {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}

// Use in your code:
debug('Received command:', text);
debug('Search query:', query);
debug('API response:', results);
```

## 📊 Performance Tips

1. **Cache popular searches:**
```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function cachedSearch(query, type) {
  const key = `${query}-${type}`;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await movieHelper.searchAndFormat(query, type);
  cache.set(key, { data, time: Date.now() });
  return data;
}
```

2. **Limit concurrent requests:**
```javascript
const pQueue = require('p-queue');
const queue = new pQueue({ concurrency: 3 });

// Use queue for API calls:
const response = await queue.add(() => 
  movieHelper.searchAndFormat(query, 'all')
);
```

## 🚀 Deployment

### Deploy to VPS

```bash
# Install dependencies
npm install
npm install -g pm2

# Start with PM2
pm2 start bot.js --name moviebox-bot

# Monitor
pm2 logs moviebox-bot

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Docker Deployment

```dockerfile
FROM node:18
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install moviebox-api
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "bot.js"]
```

Build and run:
```bash
docker build -t moviebox-bot .
docker run -d --name moviebox-bot moviebox-bot
```

## 📝 License

This integration guide is part of the moviebox-api project (Unlicense).

---

**Happy bot building! 🤖🎬**
