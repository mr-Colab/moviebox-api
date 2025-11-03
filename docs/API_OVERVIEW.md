# MovieBox API - Documentation Summary

This document provides an overview of all available documentation for the MovieBox API and guides you to the right resource based on your needs.

## 📚 Documentation Overview

### For Python Developers

If you're using Python directly:

1. **[Main README](../README.md)** - Complete Python API documentation
   - Installation instructions
   - CLI usage
   - Python API examples
   - Interactive menu
   - Streaming support

2. **[Python Examples](./examples/)** - Working code examples
   - Download movies
   - Download TV series
   - Extractor benchmarks

### For Node.js/JavaScript Developers

If you're building a web application or Node.js service:

1. **[Quick Start Guide](./QUICK_START_NODEJS.md)** ⚡ **START HERE**
   - 5-minute setup
   - Simple, copy-paste examples
   - Common use cases
   - Minimal configuration

2. **[Full Node.js Integration Guide](./NODEJS_INTEGRATION.md)** 📖 **COMPREHENSIVE**
   - Complete API reference
   - Detailed examples for all features
   - Express.js server example
   - Frontend integration
   - Error handling and best practices
   - Production deployment tips

## 🎯 Quick Navigation

### What do you want to do?

#### "I want to search for movies"
- **Python**: See [Python API Example](../README.md#-python-api) in main README
- **Node.js**: See [Search Example](./QUICK_START_NODEJS.md#use-case-1-search--display-results) in Quick Start

#### "I want to download movies"
- **Python CLI**: `moviebox download-movie "Avatar"`
- **Python API**: See [Download Example](../README.md#simple-download) in main README
- **Node.js**: See [Download Example](./QUICK_START_NODEJS.md#use-case-6-download-with-progress) in Quick Start

#### "I want to get trending content"
- **Python**: See [Trending Example](./NODEJS_INTEGRATION.md#2-get-trending-content)
- **Node.js**: See [Trending Example](./QUICK_START_NODEJS.md#use-case-2-get-trending-movies) in Quick Start

#### "I want to get movie details"
- **Python**: See [Python API Usage](../README.md#-python-api) in main README
- **Node.js**: See [Details Example](./QUICK_START_NODEJS.md#use-case-3-get-movie-details) in Quick Start

#### "I want to get genres/categories"
- **Python**: Use `Homepage` class - see [API Documentation](../README.md#-python-api)
- **Node.js**: See [Categories Example](./QUICK_START_NODEJS.md#use-case-4-get-categoriesgenres) in Quick Start

#### "I want to build a complete web app"
- See [Complete Node.js Example Project](./NODEJS_INTEGRATION.md#complete-nodejs-example-project)
- Includes Express.js server and frontend HTML

#### "I want search suggestions (autocomplete)"
- **Node.js**: See [Suggestions Example](./QUICK_START_NODEJS.md#use-case-5-auto-complete-search-suggestions)
- **Full Guide**: See [Get Suggestions](./NODEJS_INTEGRATION.md#8-get-suggestions)

#### "I want to download subtitles only"
- **Python CLI**: `moviebox download-movie "Avatar" --caption-only`
- **Node.js**: See [Subtitles Example](./NODEJS_INTEGRATION.md#7-get-subtitles)

#### "I want recommendations based on a movie"
- See [Recommendations Example](./NODEJS_INTEGRATION.md#10-get-recommendations)

## 📖 Documentation Structure

```
docs/
├── README.md                    # This summary document
├── QUICK_START_NODEJS.md       # 5-minute Node.js setup
├── NODEJS_INTEGRATION.md       # Complete Node.js guide
└── examples/                   # Python code examples
    ├── download-movie-cli.py
    ├── download-series-cli.py
    └── extractors-benchmark.py
```

## 🚀 Getting Started Path

### For Beginners (Node.js)

1. Read the [Quick Start Guide](./QUICK_START_NODEJS.md) - 5 minutes
2. Try the examples from Quick Start
3. Build your first search feature
4. Explore the [Full Integration Guide](./NODEJS_INTEGRATION.md) when you need more features

### For Python Developers

1. Read the [Main README](../README.md)
2. Install: `pip install "moviebox-api[cli]"`
3. Try the CLI: `moviebox interactive`
4. Explore Python API examples in the README

## 🔍 API Features Summary

### Search & Discovery
- ✅ Search movies and TV series
- ✅ Get trending content
- ✅ Get popular searches
- ✅ Search suggestions (autocomplete)
- ✅ Get recommendations

### Content Information
- ✅ Get movie/series details
- ✅ Get cast information
- ✅ Get genres and categories
- ✅ Get ratings and reviews
- ✅ Get available seasons/episodes

### Downloads
- ✅ Download movies (multiple quality options)
- ✅ Download TV series episodes
- ✅ Download subtitles (multiple languages)
- ✅ Stream content directly
- ✅ Resume interrupted downloads

### Integration
- ✅ Python API
- ✅ Command-line interface
- ✅ Node.js integration via child processes
- ✅ REST API wrapper support

## 🛠️ Technical Stack

### Python Package
- **Language**: Python 3.10+
- **Framework**: httpx, pydantic, bs4
- **CLI**: click, rich
- **Download**: throttlebuster

### Node.js Integration
- **Approach**: Child process execution of Python scripts
- **Framework**: Express.js (examples)
- **Alternative**: REST API wrapper (FastAPI/Flask)

## 📝 Code Examples Comparison

### Search Movies

**Python:**
```python
from moviebox_api import Session, Search
import asyncio

async def main():
    session = Session()
    search = Search(session, "Avatar", subject_type=1)
    results = await search.get_content_model()
    print(results.items[0].title)

asyncio.run(main())
```

**Node.js:**
```javascript
const { callMovieBoxAPI } = require('./moviebox');

async function searchMovies(query) {
  const script = `
import asyncio, json
from moviebox_api import Session, Search
async def main():
    session = Session()
    results = await Search(session, "${query}", subject_type=1).get_content_model()
    print(json.dumps([{"title": i.title} for i in results.items]))
asyncio.run(main())
`;
  return await callMovieBoxAPI(script);
}

searchMovies('Avatar').then(console.log);
```

**CLI:**
```bash
moviebox download-movie "Avatar" --yes
```

## 🎬 Available API Endpoints

| Feature | Python Class | Node.js Example | CLI Command |
|---------|--------------|-----------------|-------------|
| Search | `Search` | [Link](./QUICK_START_NODEJS.md#use-case-1-search--display-results) | N/A |
| Trending | `Trending` | [Link](./QUICK_START_NODEJS.md#use-case-2-get-trending-movies) | `moviebox homepage-content` |
| Movie Details | `MovieDetails` | [Link](./QUICK_START_NODEJS.md#use-case-3-get-movie-details) | `moviebox item-details URL` |
| Download Movie | `MovieAuto` | [Link](./NODEJS_INTEGRATION.md#5-download-movies) | `moviebox download-movie "Title"` |
| Download Series | `Downloader` | [Link](./NODEJS_INTEGRATION.md#6-download-tv-series) | `moviebox download-series "Title" -s 1 -e 1` |
| Suggestions | `SearchSuggestion` | [Link](./QUICK_START_NODEJS.md#use-case-5-auto-complete-search-suggestions) | N/A |
| Popular | `PopularSearch` | [Link](./NODEJS_INTEGRATION.md#9-get-popular-searches) | `moviebox popular-search` |
| Categories | `Homepage` | [Link](./QUICK_START_NODEJS.md#use-case-4-get-categoriesgenres) | `moviebox homepage-content` |

## 💡 Best Practices

1. **Caching**: Cache API responses to reduce load
2. **Rate Limiting**: Implement rate limiting in production
3. **Error Handling**: Always wrap API calls in try-catch
4. **Downloads**: Use background jobs for large downloads
5. **Environment**: Use environment variables for configuration

## 🔗 External Resources

- [GitHub Repository](https://github.com/Simatwa/moviebox-api)
- [PyPI Package](https://pypi.org/project/moviebox-api)
- [Issue Tracker](https://github.com/Simatwa/moviebox-api/issues)

## ⚠️ Important Notes

1. **Python Required**: Node.js integration requires Python 3.10+ installed
2. **Legal Notice**: This is an unofficial API. Use responsibly and respect copyright laws
3. **Mirror Hosts**: Multiple mirror hosts available if one is down
4. **Rate Limits**: No official rate limits, but implement your own for responsible usage

## 📞 Need Help?

1. Check the [Quick Start Guide](./QUICK_START_NODEJS.md) for simple examples
2. Review the [Full Integration Guide](./NODEJS_INTEGRATION.md) for detailed documentation
3. Look at [Python Examples](./examples/) for working code
4. Open an [Issue](https://github.com/Simatwa/moviebox-api/issues) if you find a bug

---

**Ready to start?** 🚀

- **Python Users**: Read the [Main README](../README.md)
- **Node.js Users**: Start with the [Quick Start Guide](./QUICK_START_NODEJS.md)

**Building something cool?** Share it with the community!
