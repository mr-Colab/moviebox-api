/**
 * Example: Basic WhatsApp Bot Integration with MovieBox API
 * 
 * This example shows how to integrate the MovieBox API with a WhatsApp bot
 * Works with popular libraries like whatsapp-web.js, baileys, etc.
 */

const WhatsAppMovieHelper = require('../whatsapp-helper');

// Initialize the helper
const movieHelper = new WhatsAppMovieHelper({
  maxResults: 5,
  timeout: 30000
});

/**
 * Message handler for WhatsApp bot
 * @param {string} message - Incoming message from user
 * @returns {Promise<string>} - Response to send back
 */
async function handleWhatsAppMessage(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  try {
    // Help command
    if (lowerMessage === '/help' || lowerMessage === '/start') {
      return movieHelper.getHelpMessage();
    }
    
    // Search all content
    if (lowerMessage.startsWith('/search ')) {
      const query = message.substring(8).trim();
      if (!query) {
        return '❌ Please provide a search query. Example: /search avatar';
      }
      return await movieHelper.searchAndFormat(query, 'all');
    }
    
    // Search movies only
    if (lowerMessage.startsWith('/movie ')) {
      const query = message.substring(7).trim();
      if (!query) {
        return '❌ Please provide a movie name. Example: /movie inception';
      }
      return await movieHelper.searchAndFormat(query, 'movies');
    }
    
    // Search TV series only
    if (lowerMessage.startsWith('/series ')) {
      const query = message.substring(8).trim();
      if (!query) {
        return '❌ Please provide a series name. Example: /series breaking bad';
      }
      return await movieHelper.searchAndFormat(query, 'series');
    }
    
    // Get trending
    if (lowerMessage === '/trending') {
      return await movieHelper.getTrendingFormatted(10);
    }
    
    // Get popular searches
    if (lowerMessage === '/popular') {
      return await movieHelper.getPopularSearchesFormatted();
    }
    
    // Default response for unknown commands
    return `❓ Unknown command. Type /help to see available commands.`;
    
  } catch (error) {
    console.error('Error handling message:', error);
    return `❌ An error occurred: ${error.message}`;
  }
}

// Export for use in your WhatsApp bot
module.exports = { handleWhatsAppMessage, movieHelper };

// Example usage with whatsapp-web.js (commented out)
/*
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR code above to login');
});

client.on('ready', () => {
  console.log('WhatsApp bot is ready!');
});

client.on('message', async (msg) => {
  // Only respond to text messages
  if (msg.type !== 'chat') return;
  
  // Get the message body
  const message = msg.body;
  
  // Check if message starts with a command
  if (message.startsWith('/')) {
    try {
      const response = await handleWhatsAppMessage(message);
      await msg.reply(response);
    } catch (error) {
      await msg.reply('❌ An error occurred while processing your request.');
      console.error('Error:', error);
    }
  }
});

client.initialize();
*/

// Example usage with Baileys (commented out)
/*
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function startBaileysBoi() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });
  
  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    
    if (!msg.message || msg.key.fromMe) return;
    
    const text = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text || '';
    
    if (text.startsWith('/')) {
      try {
        const response = await handleWhatsAppMessage(text);
        
        await sock.sendMessage(msg.key.remoteJid, {
          text: response
        });
      } catch (error) {
        console.error('Error:', error);
        await sock.sendMessage(msg.key.remoteJid, {
          text: '❌ An error occurred while processing your request.'
        });
      }
    }
  });
}

startBaileysBoi();
*/

// Simple standalone test
if (require.main === module) {
  console.log('🤖 Testing WhatsApp Movie Bot Handler\n');
  
  // Test different commands
  const testCommands = [
    '/help',
    '/search avatar',
    '/movie inception',
    '/series breaking bad',
    '/trending',
    '/popular'
  ];
  
  console.log('Note: This is a dry run. Actual API calls require internet connectivity.\n');
  console.log('To test with real data, ensure:');
  console.log('1. Python 3.10+ is installed');
  console.log('2. moviebox-api package is installed: pip install moviebox-api');
  console.log('3. You have internet connectivity\n');
  console.log('Example commands:\n');
  
  testCommands.forEach(cmd => {
    console.log(`  ${cmd}`);
  });
  
  console.log('\n💡 To integrate with your WhatsApp bot:');
  console.log('1. Import this module: const { handleWhatsAppMessage } = require("./whatsapp-bot-example");');
  console.log('2. Call handleWhatsAppMessage(userMessage) in your message handler');
  console.log('3. Send the returned string back to the user\n');
}
