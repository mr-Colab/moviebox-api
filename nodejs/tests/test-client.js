/**
 * Test Suite for MovieBox Client
 * 
 * This file tests the MovieBoxClient functionality
 * Note: Requires internet connectivity and moviebox-api Python package
 */

const MovieBoxClient = require('../moviebox-client');
const WhatsAppMovieHelper = require('../whatsapp-helper');

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async test(name, testFn) {
    process.stdout.write(`Testing: ${name}... `);
    try {
      await testFn();
      console.log('✅ PASSED');
      this.passed++;
      this.tests.push({ name, status: 'PASSED' });
    } catch (error) {
      console.log('❌ FAILED');
      console.log(`   Error: ${error.message}`);
      this.failed++;
      this.tests.push({ name, status: 'FAILED', error: error.message });
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.passed + this.failed}`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log('='.repeat(60) + '\n');

    if (this.failed > 0) {
      console.log('Failed Tests:');
      this.tests
        .filter(t => t.status === 'FAILED')
        .forEach(t => {
          console.log(`  - ${t.name}: ${t.error}`);
        });
      console.log('');
    }
  }
}

async function runTests() {
  console.log('🧪 MovieBox API Client Test Suite\n');
  console.log('Prerequisites:');
  console.log('  - Python 3.10+ installed');
  console.log('  - moviebox-api package installed (pip install moviebox-api)');
  console.log('  - Internet connectivity\n');
  console.log('Starting tests...\n');

  const runner = new TestRunner();
  const client = new MovieBoxClient({ timeout: 30000 });
  const whatsappHelper = new WhatsAppMovieHelper({ maxResults: 3, timeout: 30000 });

  // Test 1: Client initialization
  await runner.test('Client Initialization', async () => {
    if (!client) throw new Error('Client not initialized');
    if (typeof client.searchMovies !== 'function') {
      throw new Error('searchMovies method not available');
    }
  });

  // Test 2: Search movies
  await runner.test('Search Movies (Avatar)', async () => {
    const results = await client.searchMovies('Avatar', 'movies', { perPage: 3 });
    
    if (!results.success) {
      throw new Error(results.error || 'Search failed');
    }
    
    if (!results.items || results.items.length === 0) {
      throw new Error('No results returned');
    }
    
    const firstMovie = results.items[0];
    if (!firstMovie.title || !firstMovie.id) {
      throw new Error('Invalid movie data structure');
    }
  });

  // Test 3: Search TV series
  await runner.test('Search TV Series (Breaking Bad)', async () => {
    const results = await client.searchMovies('Breaking Bad', 'series', { perPage: 3 });
    
    if (!results.success) {
      throw new Error(results.error || 'Search failed');
    }
    
    if (!results.items || results.items.length === 0) {
      throw new Error('No results returned');
    }
  });

  // Test 4: Search all content
  await runner.test('Search All Content (Action)', async () => {
    const results = await client.searchMovies('action', 'all', { perPage: 5 });
    
    if (!results.success) {
      throw new Error(results.error || 'Search failed');
    }
    
    if (!results.items || results.items.length === 0) {
      throw new Error('No results returned');
    }
  });

  // Test 5: Get trending
  await runner.test('Get Trending Content', async () => {
    const results = await client.getTrending({ perPage: 5 });
    
    if (!results.success) {
      throw new Error(results.error || 'Failed to get trending');
    }
    
    if (!results.items || results.items.length === 0) {
      throw new Error('No trending items returned');
    }
  });

  // Test 6: Get suggestions
  await runner.test('Get Search Suggestions (avat)', async () => {
    const results = await client.getSuggestions('avat', 5);
    
    if (!results.success) {
      throw new Error(results.error || 'Failed to get suggestions');
    }
    
    if (!results.suggestions || results.suggestions.length === 0) {
      throw new Error('No suggestions returned');
    }
  });

  // Test 7: Get popular searches
  await runner.test('Get Popular Searches', async () => {
    const results = await client.getPopularSearches();
    
    if (!results.success) {
      throw new Error(results.error || 'Failed to get popular searches');
    }
    
    if (!results.popularSearches || results.popularSearches.length === 0) {
      throw new Error('No popular searches returned');
    }
  });

  // Test 8: WhatsApp helper - search and format
  await runner.test('WhatsApp Helper - Search and Format', async () => {
    const message = await whatsappHelper.searchAndFormat('Avatar', 'movies');
    
    if (!message || typeof message !== 'string') {
      throw new Error('No message returned');
    }
    
    if (!message.includes('Avatar')) {
      throw new Error('Message does not contain search term');
    }
    
    if (!message.includes('⭐')) {
      throw new Error('Message not properly formatted');
    }
  });

  // Test 9: WhatsApp helper - trending formatted
  await runner.test('WhatsApp Helper - Get Trending Formatted', async () => {
    const message = await whatsappHelper.getTrendingFormatted(5);
    
    if (!message || typeof message !== 'string') {
      throw new Error('No message returned');
    }
    
    if (!message.includes('Trending')) {
      throw new Error('Message does not indicate trending content');
    }
  });

  // Test 10: WhatsApp helper - help message
  await runner.test('WhatsApp Helper - Get Help Message', async () => {
    const message = whatsappHelper.getHelpMessage();
    
    if (!message || typeof message !== 'string') {
      throw new Error('No help message returned');
    }
    
    if (!message.includes('/search') || !message.includes('/trending')) {
      throw new Error('Help message incomplete');
    }
  });

  // Test 11: Error handling - invalid search
  await runner.test('Error Handling - Empty Query', async () => {
    const results = await client.searchMovies('', 'movies', { perPage: 1 });
    
    // Should either return no results or handle gracefully
    if (results.success && results.items.length > 0) {
      // Some APIs might return results for empty query
      return;
    }
    
    if (!results.success && !results.error) {
      throw new Error('Error not properly reported');
    }
  });

  // Test 12: Pagination
  await runner.test('Pagination - Different Page Sizes', async () => {
    const results1 = await client.searchMovies('action', 'all', { perPage: 5 });
    const results2 = await client.searchMovies('action', 'all', { perPage: 10 });
    
    if (!results1.success || !results2.success) {
      throw new Error('Pagination queries failed');
    }
    
    if (results1.items.length > 5 || results2.items.length > 10) {
      throw new Error('Pagination limits not respected');
    }
  });

  runner.printSummary();

  // Exit with appropriate code
  process.exit(runner.failed > 0 ? 1 : 0);
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('\n❌ Test suite crashed:', error.message);
    console.error('\nMake sure:');
    console.error('1. Python 3.10+ is installed');
    console.error('2. moviebox-api package is installed: pip install moviebox-api');
    console.error('3. You have internet connectivity\n');
    process.exit(1);
  });
}

module.exports = { runTests };
