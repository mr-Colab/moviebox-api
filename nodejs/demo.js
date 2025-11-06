#!/usr/bin/env node

/**
 * Demo Script - Shows how the WhatsApp bot would work
 * 
 * This script demonstrates the bot's responses without requiring API calls
 * Shows the expected message formats for WhatsApp
 */

const WhatsAppMovieHelper = require('./whatsapp-helper');

console.log('🎬 MovieBox WhatsApp Bot - Demo Mode\n');
console.log('=' .repeat(70));
console.log('This demo shows how messages would appear in WhatsApp');
console.log('Note: Actual data requires internet connectivity and API access');
console.log('=' .repeat(70) + '\n');

const helper = new WhatsAppMovieHelper({ maxResults: 5 });

// Demo 1: Help Message
console.log('📱 User sends: /help\n');
console.log('🤖 Bot responds:\n');
console.log(helper.getHelpMessage());
console.log('\n' + '-'.repeat(70) + '\n');

// Demo 2: Search Command Format
console.log('📱 User sends: /search avatar\n');
console.log('🤖 Bot responds with formatted search results:\n');
console.log(`🎭 *Search Results for "avatar"*
Found 25 results (showing 5)

*1.* Avatar (2009)
   ⭐ 7.9/10 | Movie
   🎭 Action, Adventure, Fantasy

*2.* Avatar: The Way of Water (2022)
   ⭐ 7.6/10 | Movie
   🎭 Action, Adventure, Sci-Fi

*3.* Avatar: The Last Airbender (2005)
   ⭐ 9.3/10 | Series
   🎭 Animation, Action, Adventure

*4.* The Last Airbender (2010)
   ⭐ 4.0/10 | Movie
   🎭 Action, Adventure, Fantasy

*5.* Avatar: The Legend of Korra (2012)
   ⭐ 8.4/10 | Series
   🎭 Animation, Action, Adventure`);
console.log('\n' + '-'.repeat(70) + '\n');

// Demo 3: Movie Search
console.log('📱 User sends: /movie inception\n');
console.log('🤖 Bot responds:\n');
console.log(`🎬 *Search Results for "inception"*
Found 12 results (showing 5)

*1.* Inception (2010)
   ⭐ 8.8/10 | Movie
   🎭 Action, Sci-Fi, Thriller

*2.* Inception: The Cobol Job (2010)
   ⭐ 6.5/10 | Movie
   🎭 Action, Sci-Fi, Short

*3.* Inception of Chaos (2020)
   ⭐ 5.2/10 | Movie
   🎭 Drama, Thriller`);
console.log('\n' + '-'.repeat(70) + '\n');

// Demo 4: Series Search
console.log('📱 User sends: /series breaking bad\n');
console.log('🤖 Bot responds:\n');
console.log(`📺 *Search Results for "breaking bad"*
Found 8 results (showing 5)

*1.* Breaking Bad (2008)
   ⭐ 9.5/10 | Series
   🎭 Crime, Drama, Thriller

*2.* Better Call Saul (2015)
   ⭐ 9.0/10 | Series
   🎭 Crime, Drama

*3.* El Camino: A Breaking Bad Movie (2019)
   ⭐ 7.3/10 | Movie
   🎭 Crime, Drama, Thriller`);
console.log('\n' + '-'.repeat(70) + '\n');

// Demo 5: Trending
console.log('📱 User sends: /trending\n');
console.log('🤖 Bot responds:\n');
console.log(`🔥 *Trending Movies & Series*

1. 🎬 *Oppenheimer* (2023)
   ⭐ 8.6/10
   Biography, Drama

2. 📺 *The Last of Us* (2023)
   ⭐ 8.9/10
   Action, Adventure

3. 🎬 *Barbie* (2023)
   ⭐ 7.2/10
   Adventure, Comedy

4. 📺 *Wednesday* (2022)
   ⭐ 8.1/10
   Comedy, Fantasy

5. 🎬 *Guardians of the Galaxy Vol. 3* (2023)
   ⭐ 7.9/10
   Action, Adventure`);
console.log('\n' + '-'.repeat(70) + '\n');

// Demo 6: Popular Searches
console.log('📱 User sends: /popular\n');
console.log('🤖 Bot responds:\n');
console.log(`🔍 *Popular Searches*

1. 🎬 Spider-Man: No Way Home
2. 📺 Stranger Things
3. 🎬 The Batman
4. 📺 Game of Thrones
5. 🎬 Top Gun: Maverick
6. 📺 House of the Dragon
7. 🎬 Everything Everywhere All at Once
8. 📺 The Mandalorian
9. 🎬 Black Panther: Wakanda Forever
10. 📺 The Witcher`);
console.log('\n' + '-'.repeat(70) + '\n');

// Demo 7: Error Handling
console.log('📱 User sends: /search\n');
console.log('🤖 Bot responds:\n');
console.log('❌ Please provide a search query. Example: /search avatar');
console.log('\n' + '-'.repeat(70) + '\n');

// Demo 8: Unknown Command
console.log('📱 User sends: /random\n');
console.log('🤖 Bot responds:\n');
console.log('❓ Unknown command. Type /help to see available commands.');
console.log('\n' + '-'.repeat(70) + '\n');

// Summary
console.log('✅ Demo Complete!\n');
console.log('Key Features Demonstrated:');
console.log('  • Help message with all commands');
console.log('  • Movie and series search with filters');
console.log('  • Trending content discovery');
console.log('  • Popular searches');
console.log('  • Formatted messages with emojis');
console.log('  • Error handling for invalid inputs\n');

console.log('To use in your WhatsApp bot:');
console.log('1. Copy the nodejs/ folder to your bot project');
console.log('2. Import: const WhatsAppMovieHelper = require("./moviebox/whatsapp-helper");');
console.log('3. Initialize: const helper = new WhatsAppMovieHelper();');
console.log('4. Call methods like: await helper.searchAndFormat(query, "all")');
console.log('5. Send the returned string to the user\n');

console.log('For complete integration examples, see:');
console.log('  • examples/whatsapp-bot-example.js');
console.log('  • WHATSAPP_INTEGRATION.md\n');

console.log('🚀 Ready to integrate! Happy bot building!\n');
