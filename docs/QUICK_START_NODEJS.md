# Quick Start - Node.js Integration

The fastest way to integrate MovieBox API into your Node.js application.

## ⚡ 5-Minute Setup

### 1. Install Dependencies

```bash
# Install Python package
pip install "moviebox-api[cli]"

# Install Node.js dependencies
npm install express
```

### 2. Create Basic Client

```javascript
// moviebox.js
const { spawn } = require('child_process');

async function callMovieBoxAPI(script) {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', ['-c', script]);
    let output = '';
    
    python.stdout.on('data', (data) => output += data.toString());
    python.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve(output);
        }
      } else {
        reject(new Error('Failed'));
      }
    });
  });
}

module.exports = { callMovieBoxAPI };
```

### 3. Search Movies (Simplest Example)

```javascript
// search.js
const { callMovieBoxAPI } = require('./moviebox');

async function searchMovies(query) {
  const script = `
import asyncio, json
from moviebox_api import Session, Search

async def main():
    session = Session()
    search = Search(session, "${query}", subject_type=1)
    results = await search.get_content_model()
    print(json.dumps([{
        "title": item.title,
        "year": item.releaseDate.year,
        "rating": item.imdbRatingValue if hasattr(item, 'imdbRatingValue') else 0,
        "url": item.page_url
    } for item in results.items[:10]]))

asyncio.run(main())
`;
  return await callMovieBoxAPI(script);
}

// Usage
searchMovies('Avatar').then(console.log);
```

### 4. Download Movie (CLI Approach)

```javascript
// download.js
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function downloadMovie(title, quality = 'best') {
  const command = `moviebox download-movie "${title}" --quality ${quality} --yes`;
  
  try {
    const { stdout, stderr } = await execAsync(command);
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Usage
downloadMovie('Avatar', '720p').then(result => {
  if (result.success) {
    console.log('Download complete!');
  }
});
```

## 🎯 Common Use Cases

### Use Case 1: Search & Display Results

```javascript
const express = require('express');
const { callMovieBoxAPI } = require('./moviebox');
const app = express();

app.get('/api/search/:query', async (req, res) => {
  const script = `
import asyncio, json
from moviebox_api import Session, Search

async def main():
    session = Session()
    search = Search(session, "${req.params.query}", subject_type=0)
    results = await search.get_content_model()
    print(json.dumps({
        "total": results.pager.totalCount,
        "items": [{
            "title": i.title,
            "year": str(i.releaseDate.year) if i.releaseDate else "",
            "type": "Movie" if i.subjectType == 1 else "Series",
            "rating": i.imdbRatingValue if hasattr(i, 'imdbRatingValue') else 0,
            "genres": i.genre,
            "poster": str(i.cover.url) if i.cover else ""
        } for i in results.items]
    }))

asyncio.run(main())
`;

  try {
    const results = await callMovieBoxAPI(script);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Use Case 2: Get Trending Movies

```javascript
async function getTrending() {
  const script = `
import asyncio, json
from moviebox_api import Session, Trending

async def main():
    session = Session()
    trending = Trending(session)
    results = await trending.get_content_model()
    print(json.dumps([{
        "title": item.title,
        "year": str(item.releaseDate.year) if item.releaseDate else "",
        "rating": item.imdbRatingValue if hasattr(item, 'imdbRatingValue') else 0,
        "poster": str(item.cover.url) if item.cover else "",
        "genres": item.genre
    } for item in results.items]))

asyncio.run(main())
`;
  
  return await callMovieBoxAPI(script);
}

// Usage
getTrending().then(movies => {
  console.log('Trending Movies:', movies);
});
```

### Use Case 3: Get Movie Details

```javascript
async function getMovieDetails(movieUrl) {
  const script = `
import asyncio, json
from moviebox_api import Session, MovieDetails

async def main():
    session = Session()
    details = MovieDetails("${movieUrl}", session)
    content = await details.get_content_model()
    
    print(json.dumps({
        "title": content.title,
        "year": str(content.releaseDate.year) if hasattr(content, 'releaseDate') and content.releaseDate else "",
        "duration": content.duration if hasattr(content, 'duration') else 0,
        "rating": content.imdbRatingValue if hasattr(content, 'imdbRatingValue') else 0,
        "genres": content.genre if hasattr(content, 'genre') else [],
        "description": content.description if hasattr(content, 'description') else "",
        "country": content.countryName if hasattr(content, 'countryName') else "",
        "poster": str(content.cover.url) if hasattr(content, 'cover') and content.cover else ""
    }))

asyncio.run(main())
`;
  
  return await callMovieBoxAPI(script);
}
```

### Use Case 4: Get Categories/Genres

```javascript
async function getCategories() {
  const script = `
import asyncio, json
from moviebox_api import Session, Homepage

async def main():
    session = Session()
    homepage = Homepage(session)
    content = await homepage.get_content_model()
    
    categories = []
    for section in content.sections[:5]:  # Get first 5 sections
        if hasattr(section, 'title'):
            cat = {"name": section.title, "items": []}
            if hasattr(section, 'items'):
                for item in section.items[:8]:  # 8 items per category
                    if hasattr(item, 'subject'):
                        s = item.subject
                        cat["items"].append({
                            "title": s.title,
                            "poster": str(s.cover.url) if s.cover else "",
                            "rating": s.imdbRatingValue if hasattr(s, 'imdbRatingValue') else 0
                        })
            categories.append(cat)
    
    print(json.dumps(categories))

asyncio.run(main())
`;
  
  return await callMovieBoxAPI(script);
}

// Usage
getCategories().then(categories => {
  categories.forEach(cat => {
    console.log(`\n${cat.name}:`);
    cat.items.forEach(item => console.log(`  - ${item.title} (⭐ ${item.rating})`));
  });
});
```

### Use Case 5: Auto-Complete Search Suggestions

```javascript
async function getSuggestions(keyword) {
  const script = `
import asyncio, json
from moviebox_api import Session, SearchSuggestion

async def main():
    session = Session()
    suggester = SearchSuggestion(session, per_page=5)
    results = await suggester.get_content_model("${keyword}")
    print(json.dumps([{
        "title": item.title,
        "type": "Movie" if item.subjectType == 1 else "Series"
    } for item in results.items]))

asyncio.run(main())
`;
  
  return await callMovieBoxAPI(script);
}

// Usage - Real-time suggestions as user types
// getSuggestions('avat').then(console.log);
```

### Use Case 6: Download with Progress

```javascript
const { spawn } = require('child_process');

function downloadWithProgress(title, quality = 'best', onProgress) {
  const child = spawn('moviebox', [
    'download-movie',
    title,
    '--quality', quality,
    '--yes'
  ]);
  
  child.stdout.on('data', (data) => {
    const output = data.toString();
    // Parse progress from output
    const match = output.match(/(\d+)%/);
    if (match && onProgress) {
      onProgress(parseInt(match[1]));
    }
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      console.log('Download complete!');
    }
  });
}

// Usage
downloadWithProgress('Avatar', '720p', (percent) => {
  console.log(`Progress: ${percent}%`);
});
```

## 📱 Frontend Integration Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>MovieBox Search</title>
</head>
<body>
    <input type="text" id="search" placeholder="Search movies...">
    <div id="results"></div>

    <script>
        const searchInput = document.getElementById('search');
        const resultsDiv = document.getElementById('results');
        
        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value;
            if (query.length < 2) return;
            
            try {
                const response = await fetch(`/api/search/${query}`);
                const data = await response.json();
                
                resultsDiv.innerHTML = data.items.map(item => `
                    <div class="movie">
                        <img src="${item.poster}" alt="${item.title}">
                        <h3>${item.title} (${item.year})</h3>
                        <p>⭐ ${item.rating} | ${item.genres.join(', ')}</p>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Search failed:', error);
            }
        });
    </script>
</body>
</html>
```

## 🔥 Popular Searches Widget

```javascript
async function getPopularSearches() {
  const script = `
import asyncio, json
from moviebox_api import Session, PopularSearch

async def main():
    session = Session()
    popular = PopularSearch(session)
    results = await popular.get_content_model()
    print(json.dumps([{
        "title": item.title,
        "poster": str(item.cover.url) if item.cover else ""
    } for item in results[:10]]))

asyncio.run(main())
`;
  
  return await callMovieBoxAPI(script);
}

// Create an Express endpoint
app.get('/api/popular', async (req, res) => {
  const popular = await getPopularSearches();
  res.json(popular);
});
```

## 🎬 Complete Mini Server

```javascript
const express = require('express');
const { callMovieBoxAPI } = require('./moviebox');

const app = express();
app.use(express.json());

// Search endpoint
app.get('/search/:query', async (req, res) => {
  const script = `
import asyncio, json
from moviebox_api import Session, Search
async def main():
    session = Session()
    results = await Search(session, "${req.params.query}").get_content_model()
    print(json.dumps([{"title": i.title, "year": str(i.releaseDate.year) if i.releaseDate else ""} for i in results.items]))
asyncio.run(main())
`;
  res.json(await callMovieBoxAPI(script));
});

// Trending endpoint
app.get('/trending', async (req, res) => {
  const script = `
import asyncio, json
from moviebox_api import Session, Trending
async def main():
    session = Session()
    results = await Trending(session).get_content_model()
    print(json.dumps([{"title": i.title} for i in results.items]))
asyncio.run(main())
`;
  res.json(await callMovieBoxAPI(script));
});

app.listen(3000, () => console.log('🎬 MovieBox API running on port 3000'));
```

Test it:
```bash
node server.js

# In another terminal:
curl http://localhost:3000/search/Avatar
curl http://localhost:3000/trending
```

## 📦 NPM Package Structure

Create a reusable package:

```
my-moviebox-app/
├── package.json
├── server.js
├── lib/
│   ├── moviebox.js       # Core client
│   ├── search.js         # Search functions
│   ├── download.js       # Download functions
│   └── trending.js       # Trending functions
└── public/
    └── index.html        # Frontend
```

## 🚀 Deployment Tips

### Vercel/Netlify (Serverless)

```javascript
// api/search.js
const { callMovieBoxAPI } = require('../lib/moviebox');

module.exports = async (req, res) => {
  const { q } = req.query;
  const results = await searchMovies(q);
  res.json(results);
};
```

### Docker

```dockerfile
FROM node:18
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install "moviebox-api[cli]"
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]
```

## ⚠️ Important Notes

1. **Python Required**: Make sure Python 3.10+ is installed
2. **API Limits**: Implement rate limiting for production
3. **Error Handling**: Always wrap calls in try-catch
4. **Caching**: Cache results to reduce API calls
5. **Downloads**: Use background jobs for large downloads

## 🔗 Related Documentation

- [Full Node.js Integration Guide](./NODEJS_INTEGRATION.md)
- [Python API Documentation](../README.md)

---

**Ready to build? Start with the 5-minute setup above! 🚀**
