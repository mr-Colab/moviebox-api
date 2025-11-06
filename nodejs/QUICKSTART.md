# 🚀 Quick Start Guide - WhatsApp Movie Bot

Get your WhatsApp movie bot running in under 5 minutes!

## ⚡ Super Quick Start (3 Steps)

### Step 1: Prerequisites (1 minute)

```bash
# Check Python version (need 3.10+)
python3 --version

# Install moviebox-api
pip install moviebox-api

# Verify installation
python3 -c "import moviebox_api; print('✅ Ready!')"
```

### Step 2: Copy Files (30 seconds)

Copy the entire `nodejs` folder to your WhatsApp bot project:
```bash
cp -r nodejs/ /path/to/your-whatsapp-bot/moviebox/
```

### Step 3: Integrate (2 minutes)

**Option A: Using whatsapp-web.js**

```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
const WhatsAppMovieHelper = require('./moviebox/whatsapp-helper');

const client = new Client({ authStrategy: new LocalAuth() });
const movieHelper = new WhatsAppMovieHelper();

client.on('message', async (msg) => {
  const text = msg.body.trim();
  if (!text.startsWith('/')) return;

  let response;
  if (text === '/help') {
    response = movieHelper.getHelpMessage();
  } else if (text.startsWith('/search ')) {
    response = await movieHelper.searchAndFormat(text.substring(8), 'all');
  } else if (text === '/trending') {
    response = await movieHelper.getTrendingFormatted();
  } else {
    response = '❓ Unknown command. Type /help for help.';
  }

  await msg.reply(response);
});

client.initialize();
```

**Option B: Using Baileys**

```javascript
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const WhatsAppMovieHelper = require('./moviebox/whatsapp-helper');

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ auth: state, printQRInTerminal: true });
  const movieHelper = new WhatsAppMovieHelper();

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    if (!text.startsWith('/')) return;

    let response;
    if (text === '/help') {
      response = movieHelper.getHelpMessage();
    } else if (text.startsWith('/search ')) {
      response = await movieHelper.searchAndFormat(text.substring(8), 'all');
    } else if (text === '/trending') {
      response = await movieHelper.getTrendingFormatted();
    } else {
      response = '❓ Unknown command. Type /help for help.';
    }

    await sock.sendMessage(msg.key.remoteJid, { text: response });
  });
}

start();
```

## 🎮 Test Your Bot

1. **Start your bot:**
```bash
node your-bot.js
```

2. **Scan QR code with WhatsApp**

3. **Send these commands to your bot:**
```
/help
/search avatar
/movie inception
/series breaking bad
/trending
/popular
```

## 📱 Available Commands

| Command | What It Does | Example |
|---------|--------------|---------|
| `/help` | Shows all commands | `/help` |
| `/search <query>` | Search movies & series | `/search avatar` |
| `/movie <name>` | Search movies only | `/movie inception` |
| `/series <name>` | Search TV series | `/series breaking bad` |
| `/trending` | Show trending content | `/trending` |
| `/popular` | Show popular searches | `/popular` |

## 🎯 What You Get

When users send commands, they get beautiful formatted responses:

```
🎬 Search Results for "avatar"
Found 25 results (showing 5)

1. Avatar (2009)
   ⭐ 7.9/10 | Movie
   🎭 Action, Adventure, Fantasy

2. Avatar: The Way of Water (2022)
   ⭐ 7.6/10 | Movie
   🎭 Action, Adventure, Sci-Fi

...
```

## 🔧 Customize

### Change Number of Results

```javascript
const movieHelper = new WhatsAppMovieHelper({
  maxResults: 10  // Show 10 results instead of 5
});
```

### Change Timeout

```javascript
const movieHelper = new WhatsAppMovieHelper({
  timeout: 60000  // 60 seconds instead of 30
});
```

### Add More Commands

```javascript
// Add a custom command
if (text.startsWith('/recommend ')) {
  const query = text.substring(12);
  // Your custom logic here
}
```

## ✅ Verify Setup

Before running your bot, verify everything is set up correctly:

```bash
cd moviebox
node verify-setup.js
```

You should see:
```
✅ Passed: 17
❌ Failed: 0
🎉 All checks passed!
```

## 🎬 See It In Action

Run the demo to see example responses:

```bash
cd moviebox
node demo.js
```

## 📚 Need More Help?

- **Full Documentation**: [README.md](./README.md)
- **WhatsApp Integration**: [WHATSAPP_INTEGRATION.md](./WHATSAPP_INTEGRATION.md)
- **Examples**: Check the `examples/` folder
- **Troubleshooting**: See README.md troubleshooting section

## 🐛 Common Issues

### "Python not found"
```javascript
// Specify Python path
const movieHelper = new WhatsAppMovieHelper({
  pythonPath: '/usr/bin/python3'  // or 'python3.10'
});
```

### "moviebox-api not found"
```bash
# Reinstall the package
pip install --upgrade moviebox-api
```

### "Timeout errors"
```javascript
// Increase timeout
const movieHelper = new WhatsAppMovieHelper({
  timeout: 60000  // 60 seconds
});
```

## 🚀 That's It!

You now have a fully functional WhatsApp movie bot! 

- Users can search for movies
- Get trending content
- Discover new series
- All through WhatsApp messages

## 🎉 Next Steps

1. **Deploy Your Bot** - Run it on a VPS or cloud server
2. **Add More Features** - Check `examples/advanced-search.js`
3. **Customize Messages** - Edit `whatsapp-helper.js`
4. **Monitor Usage** - Add logging and analytics
5. **Share With Friends** - Let them discover movies too!

---

**Questions?** Check the full documentation or open a GitHub issue.

**Happy bot building! 🤖🎬**
