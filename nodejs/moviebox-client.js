/**
 * MovieBox API Client for Node.js
 * Provides a clean interface to interact with the Python moviebox-api package
 * Ideal for WhatsApp bot integration
 */

const { spawn } = require('child_process');

class MovieBoxClient {
  constructor(options = {}) {
    this.pythonPath = options.pythonPath || 'python3';
    this.timeout = options.timeout || 30000; // 30 seconds default
  }

  /**
   * Execute a Python script and return JSON output
   * @param {string} script - Python script to execute
   * @returns {Promise<any>} - Parsed JSON response
   */
  async executePythonScript(script) {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, ['-c', script]);
      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        python.kill();
        reject(new Error(`Script execution timeout after ${this.timeout}ms`));
      }, this.timeout);

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        clearTimeout(timer);
        
        if (code !== 0) {
          const errorMsg = stderr || stdout || 'Unknown error';
          reject(new Error(`Python script failed with exit code ${code}: ${errorMsg}`));
        } else {
          try {
            // Try to parse as JSON
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (e) {
            // If not JSON, return as plain text
            resolve(stdout);
          }
        }
      });

      python.on('error', (error) => {
        clearTimeout(timer);
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }

  /**
   * Search for movies or TV series
   * @param {string} query - Search query
   * @param {string} type - 'movies', 'series', or 'all'
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Search results with total count and items
   */
  async searchMovies(query, type = 'all', options = {}) {
    const { page = 1, perPage = 10 } = options;
    
    // Map type to SubjectType enum
    const subjectTypeMap = {
      'all': 'SubjectType.ALL',
      'movies': 'SubjectType.MOVIES',
      'series': 'SubjectType.TV_SERIES',
      'music': 'SubjectType.MUSIC'
    };
    
    const subjectType = subjectTypeMap[type.toLowerCase()] || subjectTypeMap['all'];
    
    const script = `
import asyncio
import json
from moviebox_api import Session, Search, SubjectType

async def main():
    try:
        session = Session()
        search = Search(session, "${query.replace(/"/g, '\\"')}", subject_type=${subjectType}, page=${page}, per_page=${perPage})
        results = await search.get_content_model()
        
        output = {
            "success": True,
            "total": results.pager.totalCount,
            "page": results.pager.page,
            "hasMore": results.pager.hasMore,
            "items": []
        }
        
        for item in results.items:
            output["items"].append({
                "id": item.subjectId,
                "title": item.title,
                "releaseDate": str(item.releaseDate) if item.releaseDate else None,
                "year": str(item.releaseDate.year) if item.releaseDate else None,
                "subjectType": "Movie" if item.subjectType == 1 else "Series" if item.subjectType == 2 else "Other",
                "rating": item.imdbRatingValue if hasattr(item, 'imdbRatingValue') else 0,
                "genre": item.genre if hasattr(item, 'genre') else [],
                "description": item.description if hasattr(item, 'description') else "",
                "coverUrl": str(item.cover.url) if item.cover else None,
                "duration": item.duration if hasattr(item, 'duration') else None,
                "pageUrl": item.page_url
            })
        
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

asyncio.run(main())
`;

    return await this.executePythonScript(script);
  }

  /**
   * Get trending movies and TV series
   * @param {Object} options - Options for pagination
   * @returns {Promise<Object>} - Trending content
   */
  async getTrending(options = {}) {
    const { page = 0, perPage = 18 } = options;
    
    const script = `
import asyncio
import json
from moviebox_api import Session, Trending

async def main():
    try:
        session = Session()
        trending = Trending(session, page=${page}, per_page=${perPage})
        results = await trending.get_content_model()
        
        output = {
            "success": True,
            "page": results.pager.page,
            "hasMore": results.pager.hasMore,
            "items": []
        }
        
        for item in results.items:
            output["items"].append({
                "id": item.subjectId,
                "title": item.title,
                "releaseDate": str(item.releaseDate) if item.releaseDate else None,
                "year": str(item.releaseDate.year) if item.releaseDate else None,
                "subjectType": "Movie" if item.subjectType == 1 else "Series" if item.subjectType == 2 else "Other",
                "rating": item.imdbRatingValue if hasattr(item, 'imdbRatingValue') else 0,
                "genre": item.genre if hasattr(item, 'genre') else [],
                "coverUrl": str(item.cover.url) if item.cover else None,
                "pageUrl": item.page_url
            })
        
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

asyncio.run(main())
`;

    return await this.executePythonScript(script);
  }

  /**
   * Get search suggestions as user types
   * @param {string} keyword - Keyword for suggestions
   * @param {number} limit - Number of suggestions
   * @returns {Promise<Object>} - Suggestions
   */
  async getSuggestions(keyword, limit = 10) {
    const script = `
import asyncio
import json
from moviebox_api import Session, SearchSuggestion

async def main():
    try:
        session = Session()
        suggester = SearchSuggestion(session, per_page=${limit})
        results = await suggester.get_content_model("${keyword.replace(/"/g, '\\"')}")
        
        output = {
            "success": True,
            "suggestions": []
        }
        
        for item in results.items:
            output["suggestions"].append({
                "id": item.subjectId,
                "title": item.title,
                "subjectType": "Movie" if item.subjectType == 1 else "Series" if item.subjectType == 2 else "Other",
                "releaseDate": str(item.releaseDate) if item.releaseDate else None,
                "year": str(item.releaseDate.year) if item.releaseDate else None,
                "coverUrl": str(item.cover.url) if item.cover else None
            })
        
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

asyncio.run(main())
`;

    return await this.executePythonScript(script);
  }

  /**
   * Get popular searches
   * @returns {Promise<Object>} - Popular searches
   */
  async getPopularSearches() {
    const script = `
import asyncio
import json
from moviebox_api import Session, PopularSearch

async def main():
    try:
        session = Session()
        popular = PopularSearch(session)
        results = await popular.get_content_model()
        
        output = {
            "success": True,
            "popularSearches": []
        }
        
        for item in results:
            output["popularSearches"].append({
                "id": item.subjectId,
                "title": item.title,
                "subjectType": "Movie" if item.subjectType == 1 else "Series" if item.subjectType == 2 else "Other",
                "coverUrl": str(item.cover.url) if item.cover else None
            })
        
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

asyncio.run(main())
`;

    return await this.executePythonScript(script);
  }

  /**
   * Get movie or series details
   * @param {string} url - Movie/series page URL
   * @param {string} type - 'movie' or 'series'
   * @returns {Promise<Object>} - Detailed information
   */
  async getDetails(url, type = 'movie') {
    const isMovie = type.toLowerCase() === 'movie';
    const detailsClass = isMovie ? 'MovieDetails' : 'TVSeriesDetails';
    
    const script = `
import asyncio
import json
from moviebox_api import Session, ${detailsClass}

async def main():
    try:
        session = Session()
        details = ${detailsClass}("${url.replace(/"/g, '\\"')}", session)
        content = await details.get_content_model()
        
        output = {
            "success": True,
            "title": content.title,
            "releaseDate": str(content.releaseDate) if hasattr(content, 'releaseDate') and content.releaseDate else None,
            "year": str(content.releaseDate.year) if hasattr(content, 'releaseDate') and content.releaseDate else None,
            "duration": content.duration if hasattr(content, 'duration') else None,
            "rating": content.imdbRatingValue if hasattr(content, 'imdbRatingValue') else 0,
            "ratingCount": content.imdbRatingCount if hasattr(content, 'imdbRatingCount') else 0,
            "genre": content.genre if hasattr(content, 'genre') else [],
            "description": content.description if hasattr(content, 'description') else "",
            "cast": content.stafflist if hasattr(content, 'stafflist') else [],
            "country": content.countryName if hasattr(content, 'countryName') else "",
            "coverUrl": str(content.cover.url) if hasattr(content, 'cover') and content.cover else None
        }
        
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

asyncio.run(main())
`;

    return await this.executePythonScript(script);
  }
}

module.exports = MovieBoxClient;
