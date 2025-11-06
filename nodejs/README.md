# MovieBox API - Node.js Integration for WhatsApp Bots

Complete Node.js wrapper for the MovieBox API, specifically designed for WhatsApp bot integration. Search, discover, and share movie information seamlessly in your WhatsApp bot.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage Examples](#-usage-examples)
  - [Simple Movie Search](#1-simple-movie-search)
  - [WhatsApp Bot Integration](#2-whatsapp-bot-integration)
  - [Advanced Search](#3-advanced-search)
- [API Reference](#-api-reference)
- [WhatsApp Bot Commands](#-whatsapp-bot-commands)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

## ✨ Features

- 🔍 **Search Movies & TV Series** - Fast and accurate search functionality
- 🔥 **Get Trending Content** - Discover what's popular right now
- 💡 **Search Suggestions** - Auto-complete for better user experience
- 📊 **Detailed Information** - Get ratings, genres, cast, and more
- 💬 **WhatsApp Ready** - Pre-formatted messages for WhatsApp bots
- ⚡ **Easy Integration** - Simple API with promises and async/await
- 🎯 **Type Safe** - Works with movies, TV series, or both

## 📦 Prerequisites

Before using this Node.js wrapper, ensure you have:

1. **Node.js 14+** installed
2. **Python 3.10+** installed
3. **moviebox-api Python package** installed

### Install Python Package

```bash
pip install moviebox-api
# or
pip3 install moviebox-api
```

Verify installation:
```bash
python3 -c "import moviebox_api; print('✅ moviebox-api installed')"
```

## 🚀 Installation

1. Copy the Node.js files to your project:
```bash
# Copy all files from nodejs/ directory to your project
cp -r nodejs/ /path/to/your/project/moviebox/
```

2. No npm packages required! This wrapper uses only Node.js built-in modules.

## 🎯 Quick Start

### 1. Simple Movie Search

```javascript
const MovieBoxClient = require('./moviebox-client');

async function searchMovie() {
  const client = new MovieBoxClient();
  
  // Search for movies
  const results = await client.searchMovies('Avatar', 'movies', { perPage: 5 });
  
  if (results.success) {
    console.log(`Found ${results.total} movies`);
    results.items.forEach(movie => {
      console.log(`${movie.title} (${movie.year}) - ⭐ ${movie.rating}/10`);
    });
  }
}

searchMovie();
```

### 2. WhatsApp Bot Integration

```javascript
const WhatsAppMovieHelper = require('./whatsapp-helper');

const movieHelper = new WhatsAppMovieHelper({ maxResults: 5 });

// Handle WhatsApp messages
async function handleMessage(userMessage) {
  if (userMessage.startsWith('/search ')) {
    const query = userMessage.substring(8);
    return await movieHelper.searchAndFormat(query, 'all');
  }
  
  if (userMessage === '/trending') {
    return await movieHelper.getTrendingFormatted(10);
  }
  
  if (userMessage === '/help') {
    return movieHelper.getHelpMessage();
  }
  
  return '❓ Unknown command. Type /help for available commands.';
}

// Example usage
handleMessage('/search inception').then(console.log);
```

### 3. Complete WhatsApp Bot Example

```javascript
// Using whatsapp-web.js
const { Client } = require('whatsapp-web.js');
const WhatsAppMovieHelper = require('./whatsapp-helper');

const client = new Client();
const movieHelper = new WhatsAppMovieHelper();

client.on('message', async (msg) => {
  const text = msg.body;
  
  if (text.startsWith('/')) {
    let response;
    
    if (text.startsWith('/search ')) {
      const query = text.substring(8);
      response = await movieHelper.searchAndFormat(query);
    } else if (text === '/trending') {
      response = await movieHelper.getTrendingFormatted();
    } else if (text === '/popular') {
      response = await movieHelper.getPopularSearchesFormatted();
    } else if (text === '/help') {
      response = movieHelper.getHelpMessage();
    } else {
      response = '❓ Unknown command. Type /help for help.';
    }
    
    await msg.reply(response);
  }
});

client.initialize();
```

## 📚 Usage Examples

### Search Movies

```javascript
const client = new MovieBoxClient();

// Search all content
const all = await client.searchMovies('action', 'all', { perPage: 10 });

// Search movies only
const movies = await client.searchMovies('inception', 'movies', { perPage: 5 });

// Search TV series only
const series = await client.searchMovies('breaking bad', 'series', { perPage: 5 });
```

### Get Trending Content

```javascript
const client = new MovieBoxClient();

const trending = await client.getTrending({ page: 0, perPage: 20 });

if (trending.success) {
  trending.items.forEach(item => {
    console.log(`${item.title} (${item.year}) - ${item.subjectType}`);
  });
}
```

### Get Search Suggestions

```javascript
const client = new MovieBoxClient();

const suggestions = await client.getSuggestions('avat', 10);

if (suggestions.success) {
  suggestions.suggestions.forEach(item => {
    console.log(`${item.title} (${item.year})`);
  });
}
```

### Get Popular Searches

```javascript
const client = new MovieBoxClient();

const popular = await client.getPopularSearches();

if (popular.success) {
  popular.popularSearches.forEach(item => {
    console.log(`${item.title} - ${item.subjectType}`);
  });
}
```

### Get Movie Details

```javascript
const client = new MovieBoxClient();

// First search for the movie to get its URL
const search = await client.searchMovies('inception', 'movies', { perPage: 1 });
const movieUrl = search.items[0].pageUrl;

// Then get detailed information
const details = await client.getDetails(movieUrl, 'movie');

if (details.success) {
  console.log(`Title: ${details.title}`);
  console.log(`Year: ${details.year}`);
  console.log(`Rating: ${details.rating}/10`);
  console.log(`Description: ${details.description}`);
  console.log(`Cast: ${details.cast.join(', ')}`);
}
```

## 🔧 API Reference

### MovieBoxClient

Main client for interacting with the MovieBox API.

#### Constructor

```javascript
const client = new MovieBoxClient(options);
```

**Options:**
- `pythonPath` (string): Path to Python executable (default: 'python3')
- `timeout` (number): Request timeout in milliseconds (default: 30000)

#### Methods

##### searchMovies(query, type, options)

Search for movies or TV series.

**Parameters:**
- `query` (string): Search query
- `type` (string): 'all', 'movies', 'series', or 'music'
- `options` (object):
  - `page` (number): Page number (default: 1)
  - `perPage` (number): Results per page (default: 10)

**Returns:** Promise<Object>

```javascript
{
  success: true,
  total: 100,
  page: 1,
  hasMore: true,
  items: [
    {
      id: "123",
      title: "Movie Title",
      year: "2023",
      subjectType: "Movie",
      rating: 8.5,
      genre: ["Action", "Drama"],
      description: "...",
      coverUrl: "https://...",
      duration: 120,
      pageUrl: "https://..."
    }
  ]
}
```

##### getTrending(options)

Get trending movies and TV series.

**Parameters:**
- `options` (object):
  - `page` (number): Page number (default: 0)
  - `perPage` (number): Results per page (default: 18)

**Returns:** Promise<Object>

##### getSuggestions(keyword, limit)

Get search suggestions.

**Parameters:**
- `keyword` (string): Search keyword
- `limit` (number): Number of suggestions (default: 10)

**Returns:** Promise<Object>

##### getPopularSearches()

Get popular searches.

**Returns:** Promise<Object>

##### getDetails(url, type)

Get detailed information about a movie or series.

**Parameters:**
- `url` (string): Movie/series page URL
- `type` (string): 'movie' or 'series'

**Returns:** Promise<Object>

### WhatsAppMovieHelper

Helper class for WhatsApp bot integration with pre-formatted messages.

#### Constructor

```javascript
const helper = new WhatsAppMovieHelper(options);
```

**Options:**
- `pythonPath` (string): Path to Python executable
- `timeout` (number): Request timeout
- `maxResults` (number): Maximum results to show (default: 5)

#### Methods

##### searchAndFormat(query, type)

Search and return formatted WhatsApp message.

**Returns:** Promise<string>

##### getTrendingFormatted(limit)

Get trending content as formatted WhatsApp message.

**Returns:** Promise<string>

##### getPopularSearchesFormatted()

Get popular searches as formatted WhatsApp message.

**Returns:** Promise<string>

##### getSuggestionsFormatted(keyword)

Get search suggestions as formatted WhatsApp message.

**Returns:** Promise<string>

##### getHelpMessage()

Get help message for bot commands.

**Returns:** string

## 💬 WhatsApp Bot Commands

When using the WhatsAppMovieHelper, these commands work out of the box:

### Search Commands
- `/search <query>` - Search all content
- `/movie <query>` - Search movies only
- `/series <query>` - Search TV series only

### Discovery Commands
- `/trending` - Get trending movies and series
- `/popular` - Show popular searches

### Utility Commands
- `/help` - Show all available commands
- `/start` - Show welcome message

### Example User Interactions

```
User: /search avatar
Bot: 🎭 Search Results for "avatar"
     Found 25 results (showing 5)

     1. Avatar (2009)
        ⭐ 7.9/10 | Movie
        🎭 Action, Adventure, Fantasy

     2. Avatar: The Way of Water (2022)
        ⭐ 7.6/10 | Movie
        🎭 Action, Adventure, Sci-Fi

     ...
```

```
User: /trending
Bot: 🔥 Trending Movies & Series

     1. 🎬 The Matrix (1999)
        ⭐ 8.7/10
        Action, Sci-Fi

     2. 📺 Breaking Bad (2008)
        ⭐ 9.5/10
        Crime, Drama, Thriller

     ...
```

## 🧪 Testing

Run the example scripts to test functionality:

```bash
# Simple search example
node examples/simple-search.js

# Advanced search features
node examples/advanced-search.js

# WhatsApp bot example (dry run)
node examples/whatsapp-bot-example.js
```

### Create Your Own Test

```javascript
const MovieBoxClient = require('./moviebox-client');

async function test() {
  const client = new MovieBoxClient();
  
  console.log('Testing movie search...');
  const results = await client.searchMovies('test', 'movies', { perPage: 1 });
  
  if (results.success) {
    console.log('✅ Search working!');
    console.log('Found:', results.items[0].title);
  } else {
    console.log('❌ Error:', results.error);
  }
}

test();
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Python not found" Error

**Problem:** Node.js can't find Python executable

**Solution:**
```javascript
// Specify Python path explicitly
const client = new MovieBoxClient({ 
  pythonPath: '/usr/bin/python3' // or 'python3.10', etc.
});
```

Find your Python path:
```bash
which python3
# or
where python3  # Windows
```

#### 2. "moviebox-api module not found"

**Problem:** Python package not installed

**Solution:**
```bash
pip install moviebox-api
# or
pip3 install moviebox-api
# or
python3 -m pip install moviebox-api
```

#### 3. Timeout Errors

**Problem:** Requests taking too long

**Solution:**
```javascript
// Increase timeout
const client = new MovieBoxClient({ 
  timeout: 60000  // 60 seconds
});
```

#### 4. Connection Errors

**Problem:** Can't connect to API

**Solution:**
- Check internet connectivity
- Check if moviebox.ph is accessible
- Try using a VPN if the service is blocked in your region

#### 5. Special Characters in Search

**Problem:** Search fails with special characters

**Solution:**
The wrapper automatically escapes special characters, but if you encounter issues:

```javascript
// Manually sanitize if needed
const query = userInput.replace(/['"\\]/g, '');
const results = await client.searchMovies(query, 'movies');
```

### Debug Mode

Enable detailed logging:

```javascript
const { spawn } = require('child_process');

// Add this to moviebox-client.js for debugging
python.stderr.on('data', (data) => {
  console.error('Python stderr:', data.toString());
});

python.stdout.on('data', (data) => {
  console.log('Python stdout:', data.toString());
});
```

## 📝 Best Practices

### 1. Error Handling

Always handle errors gracefully:

```javascript
async function safeSearch(query) {
  try {
    const results = await client.searchMovies(query, 'all');
    if (!results.success) {
      return `Error: ${results.error}`;
    }
    return results;
  } catch (error) {
    console.error('Search failed:', error);
    return 'An error occurred. Please try again later.';
  }
}
```

### 2. Rate Limiting

Implement rate limiting for WhatsApp bots:

```javascript
const rateLimit = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const userLimit = rateLimit.get(userId);
  
  if (userLimit && now - userLimit < 5000) {
    return false; // Too frequent
  }
  
  rateLimit.set(userId, now);
  return true;
}

// In your message handler
if (!checkRateLimit(msg.from)) {
  await msg.reply('⏰ Please wait a few seconds before searching again.');
  return;
}
```

### 3. Caching

Cache popular searches to reduce API calls:

```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function cachedSearch(query, type) {
  const key = `${query}-${type}`;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const results = await client.searchMovies(query, type);
  cache.set(key, { data: results, timestamp: Date.now() });
  
  return results;
}
```

### 4. User Feedback

Provide feedback for long-running operations:

```javascript
// For WhatsApp bots
await msg.reply('🔍 Searching...');
const results = await client.searchMovies(query, 'all');
await msg.reply(formatResults(results));
```

## 📄 License

This Node.js wrapper follows the same license as the moviebox-api package (Unlicense).

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📞 Support

If you encounter issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [examples](./examples/)
3. Open an issue on GitHub

## 🔗 Related Resources

- [Python API Documentation](../README.md)
- [Full Node.js Integration Guide](../docs/NODEJS_INTEGRATION.md)
- [Quick Start Guide](../docs/QUICK_START_NODEJS.md)

---

**Made with ❤️ for WhatsApp bot developers**

Happy coding! 🚀
