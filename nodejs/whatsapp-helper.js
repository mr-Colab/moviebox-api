/**
 * WhatsApp Bot Helper for MovieBox API
 * Provides formatted responses perfect for WhatsApp messages
 */

const MovieBoxClient = require('./moviebox-client');

class WhatsAppMovieHelper {
  constructor(options = {}) {
    this.client = new MovieBoxClient(options);
    this.maxResults = options.maxResults || 5;
  }

  /**
   * Format movie/series info for WhatsApp message
   * @param {Object} item - Movie or series item
   * @returns {string} - Formatted message
   */
  formatMovieInfo(item) {
    const emoji = item.subjectType === 'Movie' ? '🎬' : '📺';
    const rating = item.rating > 0 ? `⭐ ${item.rating}/10` : 'No rating';
    const genres = item.genre && item.genre.length > 0 ? item.genre.join(', ') : 'N/A';
    const year = item.year || 'N/A';
    
    let message = `${emoji} *${item.title}* (${year})\n`;
    message += `📊 ${rating}\n`;
    message += `🎭 ${genres}\n`;
    
    if (item.duration) {
      message += `⏱️ ${item.duration} min\n`;
    }
    
    if (item.description) {
      const shortDesc = item.description.length > 200 
        ? item.description.substring(0, 200) + '...' 
        : item.description;
      message += `\n📝 ${shortDesc}\n`;
    }
    
    return message;
  }

  /**
   * Search movies and format for WhatsApp
   * @param {string} query - Search query
   * @param {string} type - 'movies', 'series', or 'all'
   * @returns {Promise<string>} - Formatted WhatsApp message
   */
  async searchAndFormat(query, type = 'all') {
    try {
      const results = await this.client.searchMovies(query, type, { perPage: this.maxResults });
      
      if (!results.success) {
        return `❌ Error: ${results.error}`;
      }
      
      if (results.items.length === 0) {
        return `😔 No results found for "${query}"`;
      }
      
      const typeEmoji = type === 'movies' ? '🎬' : type === 'series' ? '📺' : '🎭';
      let message = `${typeEmoji} *Search Results for "${query}"*\n`;
      message += `Found ${results.total} results (showing ${results.items.length})\n\n`;
      
      results.items.forEach((item, index) => {
        message += `*${index + 1}.* ${item.title} (${item.year || 'N/A'})\n`;
        message += `   ⭐ ${item.rating > 0 ? item.rating + '/10' : 'No rating'} | ${item.subjectType}\n`;
        if (item.genre && item.genre.length > 0) {
          message += `   🎭 ${item.genre.slice(0, 3).join(', ')}\n`;
        }
        message += `\n`;
      });
      
      return message.trim();
    } catch (error) {
      return `❌ Error searching: ${error.message}`;
    }
  }

  /**
   * Get detailed info about a movie/series
   * @param {string} url - Movie/series URL
   * @param {string} type - 'movie' or 'series'
   * @returns {Promise<string>} - Formatted WhatsApp message
   */
  async getDetailsFormatted(url, type = 'movie') {
    try {
      const details = await this.client.getDetails(url, type);
      
      if (!details.success) {
        return `❌ Error: ${details.error}`;
      }
      
      const emoji = type === 'movie' ? '🎬' : '📺';
      let message = `${emoji} *${details.title}*\n\n`;
      
      if (details.year) {
        message += `📅 Year: ${details.year}\n`;
      }
      
      if (details.rating > 0) {
        message += `⭐ Rating: ${details.rating}/10 (${details.ratingCount || 0} votes)\n`;
      }
      
      if (details.duration) {
        message += `⏱️ Duration: ${details.duration} min\n`;
      }
      
      if (details.genre && details.genre.length > 0) {
        message += `🎭 Genres: ${details.genre.join(', ')}\n`;
      }
      
      if (details.country) {
        message += `🌍 Country: ${details.country}\n`;
      }
      
      if (details.description) {
        message += `\n📝 *Description:*\n${details.description}\n`;
      }
      
      if (details.cast && details.cast.length > 0) {
        message += `\n🎭 *Cast:* ${details.cast.slice(0, 5).join(', ')}`;
        if (details.cast.length > 5) {
          message += ` and ${details.cast.length - 5} more`;
        }
        message += `\n`;
      }
      
      return message.trim();
    } catch (error) {
      return `❌ Error getting details: ${error.message}`;
    }
  }

  /**
   * Get trending movies/series formatted for WhatsApp
   * @param {number} limit - Number of results
   * @returns {Promise<string>} - Formatted WhatsApp message
   */
  async getTrendingFormatted(limit = 10) {
    try {
      const results = await this.client.getTrending({ perPage: limit });
      
      if (!results.success) {
        return `❌ Error: ${results.error}`;
      }
      
      if (results.items.length === 0) {
        return `😔 No trending content available`;
      }
      
      let message = `🔥 *Trending Movies & Series*\n\n`;
      
      results.items.forEach((item, index) => {
        const emoji = item.subjectType === 'Movie' ? '🎬' : '📺';
        message += `${index + 1}. ${emoji} *${item.title}* (${item.year || 'N/A'})\n`;
        message += `   ⭐ ${item.rating > 0 ? item.rating + '/10' : 'No rating'}\n`;
        if (item.genre && item.genre.length > 0) {
          message += `   ${item.genre.slice(0, 2).join(', ')}\n`;
        }
        message += `\n`;
      });
      
      return message.trim();
    } catch (error) {
      return `❌ Error getting trending: ${error.message}`;
    }
  }

  /**
   * Get popular searches formatted for WhatsApp
   * @returns {Promise<string>} - Formatted WhatsApp message
   */
  async getPopularSearchesFormatted() {
    try {
      const results = await this.client.getPopularSearches();
      
      if (!results.success) {
        return `❌ Error: ${results.error}`;
      }
      
      if (results.popularSearches.length === 0) {
        return `😔 No popular searches available`;
      }
      
      let message = `🔍 *Popular Searches*\n\n`;
      
      results.popularSearches.slice(0, 10).forEach((item, index) => {
        const emoji = item.subjectType === 'Movie' ? '🎬' : '📺';
        message += `${index + 1}. ${emoji} ${item.title}\n`;
      });
      
      return message.trim();
    } catch (error) {
      return `❌ Error getting popular searches: ${error.message}`;
    }
  }

  /**
   * Get search suggestions formatted for WhatsApp
   * @param {string} keyword - Search keyword
   * @returns {Promise<string>} - Formatted WhatsApp message
   */
  async getSuggestionsFormatted(keyword) {
    try {
      const results = await this.client.getSuggestions(keyword, 5);
      
      if (!results.success) {
        return `❌ Error: ${results.error}`;
      }
      
      if (results.suggestions.length === 0) {
        return `😔 No suggestions found for "${keyword}"`;
      }
      
      let message = `💡 *Suggestions for "${keyword}"*\n\n`;
      
      results.suggestions.forEach((item, index) => {
        const emoji = item.subjectType === 'Movie' ? '🎬' : '📺';
        message += `${index + 1}. ${emoji} ${item.title}`;
        if (item.year) {
          message += ` (${item.year})`;
        }
        message += `\n`;
      });
      
      return message.trim();
    } catch (error) {
      return `❌ Error getting suggestions: ${error.message}`;
    }
  }

  /**
   * Generate help message for WhatsApp bot
   * @returns {string} - Help message
   */
  getHelpMessage() {
    return `🎬 *MovieBox Bot Commands*\n\n` +
           `*Search Commands:*\n` +
           `• /search <query> - Search all content\n` +
           `• /movie <query> - Search movies only\n` +
           `• /series <query> - Search TV series only\n\n` +
           `*Discover Commands:*\n` +
           `• /trending - Get trending content\n` +
           `• /popular - Show popular searches\n\n` +
           `*Examples:*\n` +
           `• /search avatar\n` +
           `• /movie inception\n` +
           `• /series breaking bad\n` +
           `• /trending\n\n` +
           `Type any command to get started! 🚀`;
  }
}

module.exports = WhatsAppMovieHelper;
