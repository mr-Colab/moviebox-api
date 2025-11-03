# MovieBox API - Node.js Integration Guide

Complete guide for integrating MovieBox API into your Node.js web application to fetch movies, download content, manage subtitles, suggestions, genres, and more.

## 📑 Table of Contents

1. [API Overview](#api-overview)
2. [Available Endpoints](#available-endpoints)
3. [Installation Options](#installation-options)
4. [Node.js Integration](#nodejs-integration)
5. [Core Features with Examples](#core-features-with-examples)
   - [Search Movies & TV Series](#1-search-movies--tv-series)
   - [Get Trending Content](#2-get-trending-content)
   - [Get Movie/Series Details](#3-get-movieseries-details)
   - [Get Genres & Categories](#4-get-genres--categories)
   - [Download Movies](#5-download-movies)
   - [Download TV Series](#6-download-tv-series)
   - [Get Subtitles](#7-get-subtitles)
   - [Get Suggestions](#8-get-suggestions)
   - [Get Popular Searches](#9-get-popular-searches)
   - [Get Recommendations](#10-get-recommendations)
6. [Complete Node.js Example Project](#complete-nodejs-example-project)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## API Overview

MovieBox API is a Python-based wrapper for moviebox.ph that allows you to:
- ✅ Search for movies and TV series
- ✅ Get trending content
- ✅ Download movies and episodes with multiple quality options
- ✅ Download subtitles in multiple languages
- ✅ Get movie/series details (cast, genres, ratings, etc.)
- ✅ Get recommendations based on a movie
- ✅ Stream content directly

### Architecture

The API operates in two layers:
1. **Python Backend** - Handles scraping and data extraction from moviebox.ph
2. **Your Node.js App** - Calls the Python API using child processes or HTTP endpoints

---

## Available Endpoints

### Core API Endpoints

| Endpoint | Description | Method |
|----------|-------------|--------|
| `/wefeed-h5-bff/web/home` | Homepage content listings | GET |
| `/wefeed-h5-bff/web/subject/search` | Search movies/series | POST |
| `/wefeed-h5-bff/web/subject/trending` | Trending content | GET |
| `/wefeed-h5-bff/web/subject/everyone-search` | Popular searches | GET |
| `/wefeed-h5-bff/web/subject/search-suggest` | Search suggestions | POST |
| `/wefeed-h5-bff/web/subject/detail-rec` | Recommendations | GET |
| `/wefeed-h5-bff/web/subject/search-rank` | Hot movies/series | GET |

### Subject Types

```javascript
const SubjectType = {
  ALL: 0,        // All content types
  MOVIES: 1,     // Movies only
  TV_SERIES: 2,  // TV Series only
  MUSIC: 6       // Music content
};
```

### Quality Options

```javascript
const QualityOptions = ['worst', 'best', '360p', '480p', '720p', '1080p'];
```

---

## Installation Options

### Option 1: Use Python CLI from Node.js (Recommended)

This approach uses the Python package directly through child processes.

```bash
# Install the Python package
pip install "moviebox-api[cli]"
```

### Option 2: Create a REST API Wrapper

Create a simple Flask/FastAPI server to expose Python functionality via REST API.

### Option 3: Use Python Child Processes Directly

Call Python scripts directly from Node.js using `child_process`.

---

## Node.js Integration

### Setup

Create a Node.js module to interact with the MovieBox API:

```javascript
// moviebox-client.js
const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

class MovieBoxClient {
  constructor() {
    this.baseCommand = 'python3 -m moviebox_api';
  }

  /**
   * Execute a Python command and return JSON output
   */
  async executePythonScript(script) {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', ['-c', script]);
      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed: ${stderr}`));
        } else {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (e) {
            resolve(stdout);
          }
        }
      });
    });
  }

  /**
   * Execute CLI command
   */
  async executeCLI(command, args = []) {
    const fullCommand = `${this.baseCommand} ${command} ${args.join(' ')}`;
    try {
      const { stdout, stderr } = await execPromise(fullCommand);
      return { stdout, stderr };
    } catch (error) {
      throw new Error(`CLI Error: ${error.message}`);
    }
  }
}

module.exports = MovieBoxClient;
```

---

## Core Features with Examples

### 1. Search Movies & TV Series

Search for movies and TV series with filters.

```javascript
// search.js
const MovieBoxClient = require('./moviebox-client');

async function searchMovies(query, subjectType = 1) {
  const client = new MovieBoxClient();
  
  const script = `
import asyncio
import json
from moviebox_api import Session, Search, SubjectType

async def main():
    session = Session()
    # SubjectType: 0=ALL, 1=MOVIES, 2=TV_SERIES, 6=MUSIC
    search = Search(session, "${query}", subject_type=${subjectType}, page=1, per_page=24)
    results = await search.get_content_model()
    
    output = {
        "total": results.pager.totalCount,
        "page": results.pager.page,
        "hasMore": results.pager.hasMore,
        "items": []
    }
    
    for item in results.items:
        output["items"].append({
            "id": item.subjectId,
            "title": item.title,
            "releaseDate": str(item.releaseDate),
            "subjectType": item.subjectType,
            "rating": item.imdbRatingValue if hasattr(item, 'imdbRatingValue') else 0,
            "genre": item.genre,
            "description": item.description,
            "coverUrl": str(item.cover.url) if item.cover else None,
            "duration": item.duration,
            "pageUrl": item.page_url
        })
    
    print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

// Example usage
async function exampleSearch() {
  try {
    // Search for movies
    const movieResults = await searchMovies('Avatar', 1);
    console.log('Movie Results:', movieResults);
    
    // Search for TV series
    const seriesResults = await searchMovies('Breaking Bad', 2);
    console.log('Series Results:', seriesResults);
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = { searchMovies };
```

### 2. Get Trending Content

Get currently trending movies and TV series.

```javascript
// trending.js
const MovieBoxClient = require('./moviebox-client');

async function getTrending(page = 0, perPage = 18) {
  const client = new MovieBoxClient();
  
  const script = `
import asyncio
import json
from moviebox_api import Session, Trending

async def main():
    session = Session()
    trending = Trending(session, page=${page}, per_page=${perPage})
    results = await trending.get_content_model()
    
    output = {
        "page": results.pager.page,
        "hasMore": results.pager.hasMore,
        "items": []
    }
    
    for item in results.items:
        output["items"].append({
            "id": item.subjectId,
            "title": item.title,
            "releaseDate": str(item.releaseDate),
            "subjectType": item.subjectType,
            "rating": item.imdbRatingValue if hasattr(item, 'imdbRatingValue') else 0,
            "genre": item.genre,
            "coverUrl": str(item.cover.url) if item.cover else None,
            "pageUrl": item.page_url
        })
    
    print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Get trending failed:', error);
    throw error;
  }
}

module.exports = { getTrending };
```

### 3. Get Movie/Series Details

Get detailed information about a specific movie or TV series.

```javascript
// details.js
const MovieBoxClient = require('./moviebox-client');

async function getMovieDetails(movieUrl) {
  const client = new MovieBoxClient();
  
  const script = `
import asyncio
import json
from moviebox_api import Session, MovieDetails

async def main():
    session = Session()
    details = MovieDetails("${movieUrl}", session)
    content = await details.get_content_model()
    
    output = {
        "title": content.title,
        "releaseDate": str(content.releaseDate) if hasattr(content, 'releaseDate') else None,
        "duration": content.duration if hasattr(content, 'duration') else None,
        "rating": content.imdbRatingValue if hasattr(content, 'imdbRatingValue') else 0,
        "ratingCount": content.imdbRatingCount if hasattr(content, 'imdbRatingCount') else 0,
        "genre": content.genre if hasattr(content, 'genre') else [],
        "description": content.description if hasattr(content, 'description') else "",
        "cast": content.stafflist if hasattr(content, 'stafflist') else [],
        "country": content.countryName if hasattr(content, 'countryName') else "",
        "trailer": content.trailer if hasattr(content, 'trailer') else None,
        "coverUrl": str(content.cover.url) if hasattr(content, 'cover') and content.cover else None
    }
    
    print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Get details failed:', error);
    throw error;
  }
}

async function getTVSeriesDetails(seriesUrl) {
  const client = new MovieBoxClient();
  
  const script = `
import asyncio
import json
from moviebox_api import Session, TVSeriesDetails

async def main():
    session = Session()
    details = TVSeriesDetails("${seriesUrl}", session)
    content = await details.get_content_model()
    
    # Get seasons info
    tag_extractor = await details.get_tag_details_extractor_model()
    seasons_info = []
    
    for season in tag_extractor.seasons:
        episodes_list = []
        for episode in season.episodes:
            episodes_list.append({
                "episodeNumber": episode.episodeNumber,
                "title": episode.title,
                "releaseDate": str(episode.releaseDate) if episode.releaseDate else None
            })
        
        seasons_info.append({
            "seasonNumber": season.seasonNumber,
            "episodes": episodes_list
        })
    
    output = {
        "title": content.title,
        "releaseDate": str(content.releaseDate) if hasattr(content, 'releaseDate') else None,
        "rating": content.imdbRatingValue if hasattr(content, 'imdbRatingValue') else 0,
        "genre": content.genre if hasattr(content, 'genre') else [],
        "description": content.description if hasattr(content, 'description') else "",
        "cast": content.stafflist if hasattr(content, 'stafflist') else [],
        "country": content.countryName if hasattr(content, 'countryName') else "",
        "seasons": seasons_info,
        "coverUrl": str(content.cover.url) if hasattr(content, 'cover') and content.cover else None
    }
    
    print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Get series details failed:', error);
    throw error;
  }
}

module.exports = { getMovieDetails, getTVSeriesDetails };
```

### 4. Get Genres & Categories

Get homepage content with categories and genres.

```javascript
// genres.js
const MovieBoxClient = require('./moviebox-client');

async function getHomepageContent() {
  const client = new MovieBoxClient();
  
  const script = `
import asyncio
import json
from moviebox_api import Session, Homepage

async def main():
    session = Session()
    homepage = Homepage(session)
    content = await homepage.get_content_model()
    
    output = {
        "categories": []
    }
    
    # Extract different content sections
    for section in content.sections:
        category = {
            "id": section.id if hasattr(section, 'id') else None,
            "title": section.title if hasattr(section, 'title') else "Unknown",
            "items": []
        }
        
        if hasattr(section, 'items'):
            for item in section.items[:10]:  # Limit to 10 items per section
                if hasattr(item, 'subject'):
                    subject = item.subject
                    category["items"].append({
                        "id": subject.subjectId,
                        "title": subject.title,
                        "subjectType": subject.subjectType,
                        "genre": subject.genre,
                        "releaseDate": str(subject.releaseDate) if subject.releaseDate else None,
                        "rating": subject.imdbRatingValue if hasattr(subject, 'imdbRatingValue') else 0,
                        "coverUrl": str(subject.cover.url) if subject.cover else None
                    })
        
        output["categories"].append(category)
    
    print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Get homepage content failed:', error);
    throw error;
  }
}

async function getHotMoviesAndSeries() {
  const client = new MovieBoxClient();
  
  const script = `
import asyncio
import json
from moviebox_api import Session, HotMoviesAndTVSeries

async def main():
    session = Session()
    hot_content = HotMoviesAndTVSeries(session)
    results = await hot_content.get_content_model()
    
    output = {
        "hotMovies": [],
        "hotSeries": []
    }
    
    if hasattr(results, 'hotMovies'):
        for movie in results.hotMovies[:20]:
            output["hotMovies"].append({
                "id": movie.subjectId,
                "title": movie.title,
                "genre": movie.genre if hasattr(movie, 'genre') else [],
                "rating": movie.imdbRatingValue if hasattr(movie, 'imdbRatingValue') else 0,
                "coverUrl": str(movie.cover.url) if movie.cover else None
            })
    
    if hasattr(results, 'hotTVSeries'):
        for series in results.hotTVSeries[:20]:
            output["hotSeries"].append({
                "id": series.subjectId,
                "title": series.title,
                "genre": series.genre if hasattr(series, 'genre') else [],
                "rating": series.imdbRatingValue if hasattr(series, 'imdbRatingValue') else 0,
                "coverUrl": str(series.cover.url) if series.cover else None
            })
    
    print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Get hot content failed:', error);
    throw error;
  }
}

module.exports = { getHomepageContent, getHotMoviesAndSeries };
```

### 5. Download Movies

Download movies with progress tracking.

```javascript
// download-movie.js
const MovieBoxClient = require('./moviebox-client');
const fs = require('fs');
const path = require('path');

async function downloadMovie(title, options = {}) {
  const client = new MovieBoxClient();
  
  const {
    quality = 'best',      // best, 1080p, 720p, 480p, 360p, worst
    year = null,
    outputDir = './downloads',
    withSubtitles = true,
    subtitleLanguage = 'English'
  } = options;
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const script = `
import asyncio
import json
from moviebox_api import MovieAuto

async def main():
    auto = MovieAuto(
        quality="${quality}",
        caption_language="${subtitleLanguage}",
        download_dir="${outputDir}",
        with_caption=${withSubtitles ? 'True' : 'False'}
    )
    
    try:
        movie_file, subtitle_file = await auto.run("${title}")
        
        output = {
            "success": True,
            "movie": {
                "path": str(movie_file.saved_to) if movie_file else None,
                "size": movie_file.total_size if movie_file else 0,
                "filename": movie_file.saved_to.name if movie_file else None
            },
            "subtitle": {
                "path": str(subtitle_file.saved_to) if subtitle_file else None,
                "size": subtitle_file.total_size if subtitle_file else 0,
                "filename": subtitle_file.saved_to.name if subtitle_file else None
            } if subtitle_file else None
        }
        
        print(json.dumps(output, indent=2))
    except Exception as e:
        output = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

// With progress tracking
async function downloadMovieWithProgress(title, options = {}, onProgress) {
  const client = new MovieBoxClient();
  
  const {
    quality = 'best',
    outputDir = './downloads',
    withSubtitles = true,
    subtitleLanguage = 'English'
  } = options;
  
  const script = `
import asyncio
import json
import sys
from moviebox_api import MovieAuto, DownloadTracker

async def progress_callback(tracker: DownloadTracker):
    percent = (tracker.downloaded_size / tracker.expected_size) * 100 if tracker.expected_size > 0 else 0
    progress_data = {
        "type": "progress",
        "filename": tracker.saved_to.name,
        "downloaded": tracker.downloaded_size,
        "total": tracker.expected_size,
        "percent": round(percent, 2),
        "speed": tracker.speed
    }
    print(json.dumps(progress_data), flush=True)

async def main():
    auto = MovieAuto(
        quality="${quality}",
        caption_language="${subtitleLanguage}",
        download_dir="${outputDir}",
        with_caption=${withSubtitles ? 'True' : 'False'}
    )
    
    try:
        movie_file, subtitle_file = await auto.run("${title}", progress_hook=progress_callback)
        
        output = {
            "type": "complete",
            "success": True,
            "movie": {
                "path": str(movie_file.saved_to),
                "size": movie_file.total_size
            },
            "subtitle": {
                "path": str(subtitle_file.saved_to),
                "size": subtitle_file.total_size
            } if subtitle_file else None
        }
        print(json.dumps(output), flush=True)
    except Exception as e:
        output = {
            "type": "error",
            "success": False,
            "error": str(e)
        }
        print(json.dumps(output), flush=True)

asyncio.run(main())
`;

  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const python = spawn('python3', ['-c', script]);
    
    let finalResult = null;
    
    python.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        try {
          const parsed = JSON.parse(line);
          
          if (parsed.type === 'progress' && onProgress) {
            onProgress(parsed);
          } else if (parsed.type === 'complete') {
            finalResult = parsed;
          } else if (parsed.type === 'error') {
            reject(new Error(parsed.error));
          }
        } catch (e) {
          // Ignore non-JSON output
        }
      });
    });
    
    python.stderr.on('data', (data) => {
      console.error('Python Error:', data.toString());
    });
    
    python.on('close', (code) => {
      if (code === 0 && finalResult) {
        resolve(finalResult);
      } else if (code !== 0) {
        reject(new Error(`Download failed with code ${code}`));
      }
    });
  });
}

module.exports = { downloadMovie, downloadMovieWithProgress };
```

### 6. Download TV Series

Download TV series episodes.

```javascript
// download-series.js
const MovieBoxClient = require('./moviebox-client');
const fs = require('fs');

async function downloadTVSeries(title, season, episode, options = {}) {
  const client = new MovieBoxClient();
  
  const {
    quality = 'best',
    limit = 1,              // Number of episodes to download
    outputDir = './downloads',
    withSubtitles = true,
    subtitleLanguage = 'English',
    autoMode = false        // Download all remaining episodes across seasons
  } = options;
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const script = `
import asyncio
import json
from moviebox_api.cli import Downloader

async def main():
    downloader = Downloader(
        quality="${quality}",
        caption_language="${subtitleLanguage}",
        download_dir="${outputDir}",
        with_caption=${withSubtitles ? 'True' : 'False'}
    )
    
    try:
        episodes_map = await downloader.download_tv_series(
            "${title}",
            season=${season},
            episode=${episode},
            limit=${limit},
            auto_mode=${autoMode ? 'True' : 'False'}
        )
        
        output = {
            "success": True,
            "episodes": []
        }
        
        for episode_key, (episode_file, subtitle_file) in episodes_map.items():
            output["episodes"].append({
                "episode": episode_key,
                "videoFile": {
                    "path": str(episode_file.saved_to) if episode_file else None,
                    "size": episode_file.total_size if episode_file else 0
                },
                "subtitleFile": {
                    "path": str(subtitle_file.saved_to) if subtitle_file else None,
                    "size": subtitle_file.total_size if subtitle_file else 0
                } if subtitle_file else None
            })
        
        print(json.dumps(output, indent=2))
    except Exception as e:
        output = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Download series failed:', error);
    throw error;
  }
}

module.exports = { downloadTVSeries };
```

### 7. Get Subtitles

Download subtitles only without the video file.

```javascript
// subtitles.js
const MovieBoxClient = require('./moviebox-client');

async function downloadSubtitlesOnly(title, isMovie = true, options = {}) {
  const client = new MovieBoxClient();
  
  const {
    language = 'English',
    outputDir = './downloads',
    season = 1,
    episode = 1
  } = options;
  
  const args = [
    isMovie ? 'download-movie' : 'download-series',
    `"${title}"`,
    '--caption-only',
    `--language "${language}"`,
    `--dir "${outputDir}"`
  ];
  
  if (!isMovie) {
    args.push(`--season ${season}`, `--episode ${episode}`);
  }
  
  try {
    const result = await client.executeCLI(args[0], args.slice(1));
    return {
      success: true,
      output: result.stdout
    };
  } catch (error) {
    console.error('Subtitle download failed:', error);
    throw error;
  }
}

async function getAvailableSubtitleLanguages(movieUrl) {
  const client = new MovieBoxClient();
  
  const script = `
import asyncio
import json
from moviebox_api import Session, MovieDetails
from moviebox_api.download import CaptionFileDownloader

async def main():
    session = Session()
    details = MovieDetails("${movieUrl}", session)
    json_extractor = await details.get_json_details_extractor()
    
    # Get available subtitle languages
    caption_downloader = CaptionFileDownloader(json_extractor.subtitles)
    languages = [sub.language for sub in caption_downloader.captions]
    
    output = {
        "languages": languages
    }
    
    print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Get languages failed:', error);
    throw error;
  }
}

module.exports = { downloadSubtitlesOnly, getAvailableSubtitleLanguages };
```

### 8. Get Suggestions

Get search suggestions as user types.

```javascript
// suggestions.js
const MovieBoxClient = require('./moviebox-client');

async function getSuggestions(keyword, perPage = 10) {
  const client = new MovieBoxClient();
  
  const script = `
import asyncio
import json
from moviebox_api import Session, SearchSuggestion

async def main():
    session = Session()
    suggester = SearchSuggestion(session, per_page=${perPage})
    results = await suggester.get_content_model("${keyword}")
    
    output = {
        "suggestions": []
    }
    
    for item in results.items:
        output["suggestions"].append({
            "id": item.subjectId,
            "title": item.title,
            "subjectType": item.subjectType,
            "releaseDate": str(item.releaseDate) if item.releaseDate else None,
            "coverUrl": str(item.cover.url) if item.cover else None
        })
    
    print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Get suggestions failed:', error);
    throw error;
  }
}

module.exports = { getSuggestions };
```

### 9. Get Popular Searches

Get what other users are searching for.

```javascript
// popular-searches.js
const MovieBoxClient = require('./moviebox-client');

async function getPopularSearches() {
  const client = new MovieBoxClient();
  
  const script = `
import asyncio
import json
from moviebox_api import Session, PopularSearch

async def main():
    session = Session()
    popular = PopularSearch(session)
    results = await popular.get_content_model()
    
    output = {
        "popularSearches": []
    }
    
    for item in results:
        output["popularSearches"].append({
            "id": item.subjectId,
            "title": item.title,
            "subjectType": item.subjectType,
            "searchCount": item.searchCount if hasattr(item, 'searchCount') else 0,
            "coverUrl": str(item.cover.url) if item.cover else None
        })
    
    print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Get popular searches failed:', error);
    throw error;
  }
}

module.exports = { getPopularSearches };
```

### 10. Get Recommendations

Get movie/series recommendations based on a specific item.

```javascript
// recommendations.js
const MovieBoxClient = require('./moviebox-client');

async function getRecommendations(itemId, page = 1, perPage = 24) {
  const client = new MovieBoxClient();
  
  const script = `
import asyncio
import json
from moviebox_api import Session, Search, Recommend

async def main():
    session = Session()
    
    # First search for the item to get SearchResultsItem
    search = Search(session, "", subject_type=0, page=1, per_page=1)
    # Create a mock item with the ID
    from moviebox_api.models import SearchResultsItem
    from datetime import date
    
    # We need to create a proper SearchResultsItem
    # For this example, we'll use a different approach
    
    # Alternative: search by ID and get recommendations
    output = {
        "recommendations": [],
        "error": "Direct ID-based recommendations require item object. Use search first."
    }
    
    print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Get recommendations failed:', error);
    throw error;
  }
}

// Better approach: Get recommendations from search result
async function getRecommendationsFromSearch(searchQuery, page = 1, perPage = 24) {
  const client = new MovieBoxClient();
  
  const script = `
import asyncio
import json
from moviebox_api import Session, Search, Recommend

async def main():
    session = Session()
    
    # First search for the item
    search = Search(session, "${searchQuery}", subject_type=0, page=1, per_page=1)
    search_results = await search.get_content_model()
    
    if not search_results.items:
        print(json.dumps({"recommendations": [], "error": "No items found"}))
        return
    
    # Get recommendations based on first result
    item = search_results.items[0]
    recommend = Recommend(session, item, page=${page}, per_page=${perPage})
    results = await recommend.get_content_model()
    
    output = {
        "basedOn": {
            "title": item.title,
            "id": item.subjectId
        },
        "recommendations": []
    }
    
    for rec_item in results.items:
        output["recommendations"].append({
            "id": rec_item.subjectId,
            "title": rec_item.title,
            "subjectType": rec_item.subjectType,
            "releaseDate": str(rec_item.releaseDate) if rec_item.releaseDate else None,
            "rating": rec_item.imdbRatingValue if hasattr(rec_item, 'imdbRatingValue') else 0,
            "genre": rec_item.genre,
            "coverUrl": str(rec_item.cover.url) if rec_item.cover else None,
            "pageUrl": rec_item.page_url
        })
    
    print(json.dumps(output, indent=2))

asyncio.run(main())
`;

  try {
    const results = await client.executePythonScript(script);
    return results;
  } catch (error) {
    console.error('Get recommendations failed:', error);
    throw error;
  }
}

module.exports = { getRecommendations, getRecommendationsFromSearch };
```

---

## Complete Node.js Example Project

Here's a complete Express.js server example integrating all features:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { searchMovies } = require('./search');
const { getTrending } = require('./trending');
const { getMovieDetails, getTVSeriesDetails } = require('./details');
const { getHomepageContent, getHotMoviesAndSeries } = require('./genres');
const { downloadMovie, downloadMovieWithProgress } = require('./download-movie');
const { downloadTVSeries } = require('./download-series');
const { downloadSubtitlesOnly, getAvailableSubtitleLanguages } = require('./subtitles');
const { getSuggestions } = require('./suggestions');
const { getPopularSearches } = require('./popular-searches');
const { getRecommendationsFromSearch } = require('./recommendations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes

// Search
app.get('/api/search', async (req, res) => {
  try {
    const { q, type = 1, page = 1, perPage = 24 } = req.query;
    const results = await searchMovies(q, parseInt(type));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trending
app.get('/api/trending', async (req, res) => {
  try {
    const { page = 0, perPage = 18 } = req.query;
    const results = await getTrending(parseInt(page), parseInt(perPage));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Movie Details
app.get('/api/movie/:url(*)', async (req, res) => {
  try {
    const movieUrl = req.params.url;
    const details = await getMovieDetails(movieUrl);
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TV Series Details
app.get('/api/series/:url(*)', async (req, res) => {
  try {
    const seriesUrl = req.params.url;
    const details = await getTVSeriesDetails(seriesUrl);
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Homepage Content & Categories
app.get('/api/homepage', async (req, res) => {
  try {
    const content = await getHomepageContent();
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hot Movies and Series
app.get('/api/hot', async (req, res) => {
  try {
    const content = await getHotMoviesAndSeries();
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download Movie
app.post('/api/download/movie', async (req, res) => {
  try {
    const { title, quality, year, withSubtitles, subtitleLanguage, outputDir } = req.body;
    const result = await downloadMovie(title, {
      quality,
      year,
      withSubtitles,
      subtitleLanguage,
      outputDir
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download TV Series
app.post('/api/download/series', async (req, res) => {
  try {
    const { title, season, episode, quality, limit, withSubtitles, subtitleLanguage, outputDir, autoMode } = req.body;
    const result = await downloadTVSeries(title, season, episode, {
      quality,
      limit,
      withSubtitles,
      subtitleLanguage,
      outputDir,
      autoMode
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Subtitles
app.get('/api/subtitles/languages/:url(*)', async (req, res) => {
  try {
    const movieUrl = req.params.url;
    const languages = await getAvailableSubtitleLanguages(movieUrl);
    res.json(languages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download Subtitles Only
app.post('/api/subtitles/download', async (req, res) => {
  try {
    const { title, isMovie, language, outputDir, season, episode } = req.body;
    const result = await downloadSubtitlesOnly(title, isMovie, {
      language,
      outputDir,
      season,
      episode
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search Suggestions
app.get('/api/suggestions', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    const suggestions = await getSuggestions(q, parseInt(limit));
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Popular Searches
app.get('/api/popular', async (req, res) => {
  try {
    const popular = await getPopularSearches();
    res.json(popular);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recommendations
app.get('/api/recommendations', async (req, res) => {
  try {
    const { q, page = 1, perPage = 24 } = req.query;
    const recommendations = await getRecommendationsFromSearch(q, parseInt(page), parseInt(perPage));
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`MovieBox API Server running on http://localhost:${PORT}`);
  console.log(`
Available Endpoints:
  - GET  /api/search?q=query&type=1
  - GET  /api/trending?page=0&perPage=18
  - GET  /api/movie/:url
  - GET  /api/series/:url
  - GET  /api/homepage
  - GET  /api/hot
  - POST /api/download/movie
  - POST /api/download/series
  - GET  /api/subtitles/languages/:url
  - POST /api/subtitles/download
  - GET  /api/suggestions?q=keyword
  - GET  /api/popular
  - GET  /api/recommendations?q=title
  `);
});
```

### Frontend Example (HTML + JavaScript)

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MovieBox Web Client</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #141414;
            color: #fff;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { margin-bottom: 30px; }
        .search-box {
            width: 100%;
            padding: 15px;
            font-size: 16px;
            border: 2px solid #333;
            border-radius: 5px;
            background: #222;
            color: #fff;
            margin-bottom: 20px;
        }
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .tab {
            padding: 10px 20px;
            background: #222;
            border: none;
            color: #fff;
            cursor: pointer;
            border-radius: 5px 5px 0 0;
        }
        .tab.active { background: #e50914; }
        .results {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
        }
        .movie-card {
            background: #222;
            border-radius: 5px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.3s;
        }
        .movie-card:hover { transform: scale(1.05); }
        .movie-card img {
            width: 100%;
            height: 300px;
            object-fit: cover;
        }
        .movie-card .info {
            padding: 10px;
        }
        .movie-card h3 {
            font-size: 14px;
            margin-bottom: 5px;
        }
        .movie-card .meta {
            font-size: 12px;
            color: #999;
        }
        .loading {
            text-align: center;
            padding: 40px;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎬 MovieBox Web Client</h1>
        
        <input 
            type="text" 
            class="search-box" 
            id="searchInput" 
            placeholder="Search for movies and TV series..."
        >
        
        <div class="tabs">
            <button class="tab active" data-tab="trending">Trending</button>
            <button class="tab" data-tab="movies">Movies</button>
            <button class="tab" data-tab="series">TV Series</button>
            <button class="tab" data-tab="popular">Popular</button>
        </div>
        
        <div class="results" id="results"></div>
        <div class="loading" id="loading" style="display: none;">Loading...</div>
    </div>

    <script>
        const API_BASE = 'http://localhost:3000/api';
        let currentTab = 'trending';
        
        // Elements
        const searchInput = document.getElementById('searchInput');
        const resultsDiv = document.getElementById('results');
        const loadingDiv = document.getElementById('loading');
        const tabs = document.querySelectorAll('.tab');
        
        // Event listeners
        searchInput.addEventListener('input', debounce(handleSearch, 500));
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentTab = tab.dataset.tab;
                loadContent();
            });
        });
        
        // Functions
        function debounce(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }
        
        async function handleSearch() {
            const query = searchInput.value.trim();
            if (query.length < 2) {
                loadContent();
                return;
            }
            
            showLoading();
            try {
                const type = currentTab === 'movies' ? 1 : currentTab === 'series' ? 2 : 0;
                const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&type=${type}`);
                const data = await response.json();
                displayResults(data.items || []);
            } catch (error) {
                console.error('Search failed:', error);
                hideLoading();
            }
        }
        
        async function loadContent() {
            showLoading();
            try {
                let data;
                switch(currentTab) {
                    case 'trending':
                        const trendingResp = await fetch(`${API_BASE}/trending`);
                        data = await trendingResp.json();
                        displayResults(data.items || []);
                        break;
                    case 'popular':
                        const popularResp = await fetch(`${API_BASE}/popular`);
                        data = await popularResp.json();
                        displayResults(data.popularSearches || []);
                        break;
                    case 'movies':
                    case 'series':
                        const type = currentTab === 'movies' ? 1 : 2;
                        const searchResp = await fetch(`${API_BASE}/search?q=&type=${type}`);
                        data = await searchResp.json();
                        displayResults(data.items || []);
                        break;
                }
            } catch (error) {
                console.error('Load failed:', error);
                hideLoading();
            }
        }
        
        function displayResults(items) {
            hideLoading();
            resultsDiv.innerHTML = '';
            
            if (items.length === 0) {
                resultsDiv.innerHTML = '<p style="text-align:center;padding:40px;">No results found</p>';
                return;
            }
            
            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'movie-card';
                card.innerHTML = `
                    <img src="${item.coverUrl || 'placeholder.jpg'}" alt="${item.title}">
                    <div class="info">
                        <h3>${item.title}</h3>
                        <div class="meta">
                            ${item.releaseDate ? new Date(item.releaseDate).getFullYear() : ''} 
                            ${item.rating ? `⭐ ${item.rating}` : ''}
                        </div>
                        <div class="meta">${item.genre ? item.genre.join(', ') : ''}</div>
                    </div>
                `;
                card.addEventListener('click', () => showDetails(item));
                resultsDiv.appendChild(card);
            });
        }
        
        function showDetails(item) {
            alert(`Title: ${item.title}\nRating: ${item.rating || 'N/A'}\nGenres: ${item.genre ? item.genre.join(', ') : 'N/A'}`);
            // In a real app, you would show a modal or navigate to details page
        }
        
        function showLoading() {
            loadingDiv.style.display = 'block';
            resultsDiv.style.display = 'none';
        }
        
        function hideLoading() {
            loadingDiv.style.display = 'none';
            resultsDiv.style.display = 'grid';
        }
        
        // Initial load
        loadContent();
    </script>
</body>
</html>
```

### Package.json

```json
{
  "name": "moviebox-nodejs-integration",
  "version": "1.0.0",
  "description": "Node.js integration for MovieBox API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## Error Handling

Implement robust error handling:

```javascript
// error-handler.js
class MovieBoxError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'MovieBoxError';
    this.code = code;
    this.details = details;
  }
}

function handleError(error, context = '') {
  console.error(`Error in ${context}:`, error);
  
  if (error.message.includes('not found')) {
    throw new MovieBoxError(
      'Content not found',
      'NOT_FOUND',
      { originalError: error.message }
    );
  }
  
  if (error.message.includes('timeout')) {
    throw new MovieBoxError(
      'Request timeout',
      'TIMEOUT',
      { originalError: error.message }
    );
  }
  
  if (error.message.includes('Python')) {
    throw new MovieBoxError(
      'Python execution error. Make sure moviebox-api is installed.',
      'PYTHON_ERROR',
      { originalError: error.message }
    );
  }
  
  throw new MovieBoxError(
    'Unknown error occurred',
    'UNKNOWN',
    { originalError: error.message }
  );
}

module.exports = { MovieBoxError, handleError };
```

---

## Best Practices

### 1. Caching

Implement caching to reduce API calls:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

async function getCachedOrFetch(key, fetchFunction) {
  const cached = cache.get(key);
  if (cached) return cached;
  
  const data = await fetchFunction();
  cache.set(key, data);
  return data;
}

// Usage
app.get('/api/trending', async (req, res) => {
  try {
    const results = await getCachedOrFetch('trending', () => getTrending());
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Rate Limiting

Protect your server from abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Queue Downloads

Use a queue for handling multiple downloads:

```javascript
const Queue = require('bull');
const downloadQueue = new Queue('downloads');

downloadQueue.process(async (job) => {
  const { title, options } = job.data;
  return await downloadMovie(title, options);
});

app.post('/api/download/movie', async (req, res) => {
  const { title, ...options } = req.body;
  const job = await downloadQueue.add({ title, options });
  res.json({ jobId: job.id, status: 'queued' });
});
```

### 4. Environment Variables

Use environment variables for configuration:

```javascript
// .env
MOVIEBOX_HOST=h5.aoneroom.com
DOWNLOAD_DIR=/path/to/downloads
SUBTITLE_LANGUAGE=English
DEFAULT_QUALITY=best

// config.js
require('dotenv').config();

module.exports = {
  movieboxHost: process.env.MOVIEBOX_HOST,
  downloadDir: process.env.DOWNLOAD_DIR || './downloads',
  subtitleLanguage: process.env.SUBTITLE_LANGUAGE || 'English',
  defaultQuality: process.env.DEFAULT_QUALITY || 'best'
};
```

### 5. Logging

Implement proper logging:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('Search request', { query: 'Avatar', type: 'movie' });
logger.error('Download failed', { title: 'Avatar', error: error.message });
```

---

## Quick Start Commands

```bash
# Install dependencies
npm install express cors

# Install Python package
pip install "moviebox-api[cli]"

# Run the server
node server.js

# Test API
curl http://localhost:3000/api/trending
```

---

## Troubleshooting

### Common Issues

1. **Python not found**
   ```bash
   # Install Python 3.10+
   sudo apt-get install python3 python3-pip
   ```

2. **moviebox-api not found**
   ```bash
   pip install "moviebox-api[cli]"
   # or
   pip3 install "moviebox-api[cli]"
   ```

3. **Permission denied**
   ```bash
   sudo chmod +x /path/to/python
   ```

4. **Download fails**
   - Check internet connection
   - Verify MOVIEBOX_HOST environment variable
   - Check disk space

---

## Additional Resources

- [Python API Documentation](../README.md)
- [Example Scripts](../docs/examples/)
- [GitHub Repository](https://github.com/Simatwa/moviebox-api)

---

## License

This integration guide is provided under the same license as the moviebox-api package (Unlicense).

---

**Made with ❤️ for developers building movie streaming applications**
