/**
 * Advanced Example: Complete Movie Search with Filtering
 * 
 * This example shows advanced usage with multiple features
 */

const MovieBoxClient = require('../moviebox-client');

class AdvancedMovieSearch {
  constructor() {
    this.client = new MovieBoxClient({ timeout: 30000 });
  }

  /**
   * Search with advanced filtering
   */
  async searchWithFilters(query, options = {}) {
    const {
      type = 'all',
      minRating = 0,
      maxResults = 10,
      genres = []
    } = options;

    console.log(`🔍 Searching for: "${query}"`);
    console.log(`   Type: ${type}, Min Rating: ${minRating}, Max Results: ${maxResults}\n`);

    const results = await this.client.searchMovies(query, type, { perPage: 20 });

    if (!results.success) {
      throw new Error(results.error);
    }

    // Filter results
    let filtered = results.items;

    // Filter by minimum rating
    if (minRating > 0) {
      filtered = filtered.filter(item => item.rating >= minRating);
    }

    // Filter by genres if specified
    if (genres.length > 0) {
      filtered = filtered.filter(item => 
        item.genre.some(g => genres.includes(g.toLowerCase()))
      );
    }

    // Limit results
    filtered = filtered.slice(0, maxResults);

    return filtered;
  }

  /**
   * Get comprehensive movie information
   */
  async getMovieInfo(searchQuery) {
    // First, search for the movie
    const searchResults = await this.client.searchMovies(searchQuery, 'movies', { perPage: 1 });

    if (!searchResults.success || searchResults.items.length === 0) {
      throw new Error('Movie not found');
    }

    const movie = searchResults.items[0];

    // Then get detailed information
    const details = await this.client.getDetails(movie.pageUrl, 'movie');

    if (!details.success) {
      throw new Error('Failed to get movie details');
    }

    return { ...movie, details };
  }

  /**
   * Compare movies
   */
  async compareMovies(movie1Query, movie2Query) {
    console.log(`🆚 Comparing: "${movie1Query}" vs "${movie2Query}"\n`);

    const [movie1Results, movie2Results] = await Promise.all([
      this.client.searchMovies(movie1Query, 'movies', { perPage: 1 }),
      this.client.searchMovies(movie2Query, 'movies', { perPage: 1 })
    ]);

    if (!movie1Results.success || movie1Results.items.length === 0) {
      throw new Error(`Movie "${movie1Query}" not found`);
    }

    if (!movie2Results.success || movie2Results.items.length === 0) {
      throw new Error(`Movie "${movie2Query}" not found`);
    }

    const movie1 = movie1Results.items[0];
    const movie2 = movie2Results.items[0];

    return {
      movie1: {
        title: movie1.title,
        year: movie1.year,
        rating: movie1.rating,
        genre: movie1.genre
      },
      movie2: {
        title: movie2.title,
        year: movie2.year,
        rating: movie2.rating,
        genre: movie2.genre
      },
      winner: movie1.rating > movie2.rating ? movie1.title : 
              movie2.rating > movie1.rating ? movie2.title : 'Tie'
    };
  }

  /**
   * Get recommendations based on genre
   */
  async getRecommendationsByGenre(genre, limit = 10) {
    console.log(`🎭 Getting ${genre} recommendations...\n`);

    const trending = await this.client.getTrending({ perPage: 50 });

    if (!trending.success) {
      throw new Error('Failed to get trending content');
    }

    // Filter by genre
    const recommendations = trending.items
      .filter(item => item.genre.some(g => g.toLowerCase().includes(genre.toLowerCase())))
      .slice(0, limit);

    return recommendations;
  }

  /**
   * Get top rated movies
   */
  async getTopRated(type = 'movies', limit = 10) {
    console.log(`🏆 Getting top rated ${type}...\n`);

    const trending = await this.client.getTrending({ perPage: 50 });

    if (!trending.success) {
      throw new Error('Failed to get content');
    }

    // Filter by type and sort by rating
    const topRated = trending.items
      .filter(item => type === 'all' || item.subjectType.toLowerCase() === type.toLowerCase().replace(/s$/, ''))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);

    return topRated;
  }
}

// Example usage
async function runExamples() {
  const search = new AdvancedMovieSearch();

  console.log('🎬 Advanced MovieBox API Examples\n');
  console.log('=' .repeat(50) + '\n');

  try {
    // Example 1: Search with filters
    console.log('Example 1: Search with Filters');
    console.log('-'.repeat(50));
    const filtered = await search.searchWithFilters('action', {
      type: 'movies',
      minRating: 7.0,
      maxResults: 5
    });
    
    console.log(`Found ${filtered.length} high-rated action movies:\n`);
    filtered.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} (${movie.year}) - ⭐ ${movie.rating}/10`);
    });

    console.log('\n' + '='.repeat(50) + '\n');

    // Example 2: Get comprehensive movie info
    console.log('Example 2: Comprehensive Movie Information');
    console.log('-'.repeat(50));
    const movieInfo = await search.getMovieInfo('Inception');
    console.log(`Title: ${movieInfo.title}`);
    console.log(`Year: ${movieInfo.year}`);
    console.log(`Rating: ${movieInfo.rating}/10`);
    console.log(`Genres: ${movieInfo.genre.join(', ')}`);
    console.log(`Duration: ${movieInfo.duration} min`);

    console.log('\n' + '='.repeat(50) + '\n');

    // Example 3: Compare movies
    console.log('Example 3: Compare Movies');
    console.log('-'.repeat(50));
    const comparison = await search.compareMovies('Avatar', 'Titanic');
    console.log(`Movie 1: ${comparison.movie1.title} (${comparison.movie1.year}) - ⭐ ${comparison.movie1.rating}`);
    console.log(`Movie 2: ${comparison.movie2.title} (${comparison.movie2.year}) - ⭐ ${comparison.movie2.rating}`);
    console.log(`Winner: ${comparison.winner}`);

    console.log('\n' + '='.repeat(50) + '\n');

    // Example 4: Genre recommendations
    console.log('Example 4: Genre Recommendations');
    console.log('-'.repeat(50));
    const recommendations = await search.getRecommendationsByGenre('action', 5);
    console.log(`Top 5 Action recommendations:\n`);
    recommendations.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (${item.year}) - ⭐ ${item.rating}/10`);
    });

    console.log('\n' + '='.repeat(50) + '\n');

    // Example 5: Top rated
    console.log('Example 5: Top Rated Movies');
    console.log('-'.repeat(50));
    const topRated = await search.getTopRated('movies', 5);
    console.log(`Top 5 rated movies:\n`);
    topRated.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} (${movie.year}) - ⭐ ${movie.rating}/10`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Python 3.10+ is installed');
    console.log('2. moviebox-api is installed: pip install moviebox-api');
    console.log('3. You have internet connectivity');
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}

module.exports = AdvancedMovieSearch;
