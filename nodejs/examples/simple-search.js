/**
 * Simple Example: Search Movies
 * 
 * This is the simplest way to search for movies using the MovieBox API
 */

const MovieBoxClient = require('../moviebox-client');

async function searchMovies() {
  // Create a new client
  const client = new MovieBoxClient();
  
  console.log('🎬 MovieBox API - Simple Search Example\n');
  console.log('Searching for "Avatar"...\n');
  
  try {
    // Search for movies
    const results = await client.searchMovies('Avatar', 'movies', { perPage: 5 });
    
    if (results.success) {
      console.log(`✅ Found ${results.total} results (showing ${results.items.length})\n`);
      
      results.items.forEach((movie, index) => {
        console.log(`${index + 1}. ${movie.title} (${movie.year})`);
        console.log(`   ⭐ Rating: ${movie.rating > 0 ? movie.rating + '/10' : 'No rating'}`);
        console.log(`   🎭 Genre: ${movie.genre.join(', ') || 'N/A'}`);
        console.log(`   📝 ${movie.description.substring(0, 100)}...`);
        console.log('');
      });
    } else {
      console.log(`❌ Error: ${results.error}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Python 3.10+ is installed');
    console.log('2. moviebox-api is installed: pip install moviebox-api');
    console.log('3. You have internet connectivity');
  }
}

// Run the example
if (require.main === module) {
  searchMovies();
}

module.exports = { searchMovies };
