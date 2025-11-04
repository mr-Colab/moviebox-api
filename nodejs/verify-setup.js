#!/usr/bin/env node

/**
 * Verification Script for MovieBox Node.js Integration
 * 
 * This script verifies that all files are correctly set up
 * and the basic structure is valid without requiring API calls
 */

const fs = require('fs');
const path = require('path');

class Verifier {
  constructor() {
    this.checks = [];
    this.passed = 0;
    this.failed = 0;
  }

  check(description, testFn) {
    try {
      testFn();
      console.log(`✅ ${description}`);
      this.passed++;
      this.checks.push({ description, status: 'PASSED' });
    } catch (error) {
      console.log(`❌ ${description}`);
      console.log(`   Error: ${error.message}`);
      this.failed++;
      this.checks.push({ description, status: 'FAILED', error: error.message });
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Checks: ${this.passed + this.failed}`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    
    if (this.failed === 0) {
      console.log('\n🎉 All checks passed! The Node.js wrapper is correctly set up.');
      console.log('\nNext steps:');
      console.log('1. Ensure Python 3.10+ is installed: python3 --version');
      console.log('2. Install moviebox-api: pip install moviebox-api');
      console.log('3. Run examples: node examples/simple-search.js');
      console.log('4. Check the README.md for WhatsApp bot integration\n');
    } else {
      console.log('\n⚠️  Some checks failed. Please review the errors above.\n');
    }
    
    console.log('='.repeat(70) + '\n');
  }
}

function runVerification() {
  console.log('🔍 MovieBox Node.js Integration Verification\n');
  console.log('Verifying installation and file structure...\n');

  const verifier = new Verifier();
  const basePath = __dirname;

  // Check 1: Main client file exists
  verifier.check('moviebox-client.js exists', () => {
    const filePath = path.join(basePath, 'moviebox-client.js');
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
  });

  // Check 2: WhatsApp helper exists
  verifier.check('whatsapp-helper.js exists', () => {
    const filePath = path.join(basePath, 'whatsapp-helper.js');
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
  });

  // Check 3: README exists
  verifier.check('README.md exists', () => {
    const filePath = path.join(basePath, 'README.md');
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
  });

  // Check 4: Package.json exists
  verifier.check('package.json exists', () => {
    const filePath = path.join(basePath, 'package.json');
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
  });

  // Check 5: Examples directory exists
  verifier.check('examples/ directory exists', () => {
    const dirPath = path.join(basePath, 'examples');
    if (!fs.existsSync(dirPath)) {
      throw new Error('Directory not found');
    }
  });

  // Check 6: MovieBoxClient can be required
  verifier.check('MovieBoxClient can be loaded', () => {
    const MovieBoxClient = require(path.join(basePath, 'moviebox-client.js'));
    if (typeof MovieBoxClient !== 'function') {
      throw new Error('MovieBoxClient is not a constructor');
    }
  });

  // Check 7: WhatsAppMovieHelper can be required
  verifier.check('WhatsAppMovieHelper can be loaded', () => {
    const WhatsAppMovieHelper = require(path.join(basePath, 'whatsapp-helper.js'));
    if (typeof WhatsAppMovieHelper !== 'function') {
      throw new Error('WhatsAppMovieHelper is not a constructor');
    }
  });

  // Check 8: MovieBoxClient instance creation
  verifier.check('MovieBoxClient can be instantiated', () => {
    const MovieBoxClient = require(path.join(basePath, 'moviebox-client.js'));
    const client = new MovieBoxClient();
    if (!client) {
      throw new Error('Failed to create instance');
    }
    if (typeof client.searchMovies !== 'function') {
      throw new Error('searchMovies method not available');
    }
  });

  // Check 9: WhatsAppMovieHelper instance creation
  verifier.check('WhatsAppMovieHelper can be instantiated', () => {
    const WhatsAppMovieHelper = require(path.join(basePath, 'whatsapp-helper.js'));
    const helper = new WhatsAppMovieHelper();
    if (!helper) {
      throw new Error('Failed to create instance');
    }
    if (typeof helper.searchAndFormat !== 'function') {
      throw new Error('searchAndFormat method not available');
    }
  });

  // Check 10: MovieBoxClient has all required methods
  verifier.check('MovieBoxClient has all required methods', () => {
    const MovieBoxClient = require(path.join(basePath, 'moviebox-client.js'));
    const client = new MovieBoxClient();
    const requiredMethods = [
      'executePythonScript',
      'searchMovies',
      'getTrending',
      'getSuggestions',
      'getPopularSearches',
      'getDetails'
    ];
    
    requiredMethods.forEach(method => {
      if (typeof client[method] !== 'function') {
        throw new Error(`Method ${method} not found`);
      }
    });
  });

  // Check 11: WhatsAppMovieHelper has all required methods
  verifier.check('WhatsAppMovieHelper has all required methods', () => {
    const WhatsAppMovieHelper = require(path.join(basePath, 'whatsapp-helper.js'));
    const helper = new WhatsAppMovieHelper();
    const requiredMethods = [
      'formatMovieInfo',
      'searchAndFormat',
      'getDetailsFormatted',
      'getTrendingFormatted',
      'getPopularSearchesFormatted',
      'getSuggestionsFormatted',
      'getHelpMessage'
    ];
    
    requiredMethods.forEach(method => {
      if (typeof helper[method] !== 'function') {
        throw new Error(`Method ${method} not found`);
      }
    });
  });

  // Check 12: Help message is properly formatted
  verifier.check('Help message is properly formatted', () => {
    const WhatsAppMovieHelper = require(path.join(basePath, 'whatsapp-helper.js'));
    const helper = new WhatsAppMovieHelper();
    const helpMsg = helper.getHelpMessage();
    
    if (!helpMsg || typeof helpMsg !== 'string') {
      throw new Error('Help message is not a string');
    }
    
    if (!helpMsg.includes('/search')) {
      throw new Error('Help message missing /search command');
    }
    
    if (!helpMsg.includes('/trending')) {
      throw new Error('Help message missing /trending command');
    }
  });

  // Check 13: Example files exist
  verifier.check('Example files exist', () => {
    const exampleFiles = [
      'examples/simple-search.js',
      'examples/advanced-search.js',
      'examples/whatsapp-bot-example.js'
    ];
    
    exampleFiles.forEach(file => {
      const filePath = path.join(basePath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Example file ${file} not found`);
      }
    });
  });

  // Check 14: Test file exists
  verifier.check('Test file exists', () => {
    const testPath = path.join(basePath, 'tests/test-client.js');
    if (!fs.existsSync(testPath)) {
      throw new Error('Test file not found');
    }
  });

  // Check 15: Documentation files exist
  verifier.check('Documentation files exist', () => {
    const docs = [
      'README.md',
      'WHATSAPP_INTEGRATION.md'
    ];
    
    docs.forEach(doc => {
      const docPath = path.join(basePath, doc);
      if (!fs.existsSync(docPath)) {
        throw new Error(`Documentation ${doc} not found`);
      }
    });
  });

  // Check 16: Python availability (optional check)
  verifier.check('Python 3 is available (optional)', () => {
    const { spawnSync } = require('child_process');
    const result = spawnSync('python3', ['--version']);
    
    if (result.error) {
      throw new Error('Python 3 not found in PATH');
    }
  });

  // Check 17: moviebox-api package installed (optional check)
  verifier.check('moviebox-api package is installed (optional)', () => {
    const { spawnSync } = require('child_process');
    const result = spawnSync('python3', ['-c', 'import moviebox_api']);
    
    if (result.status !== 0) {
      throw new Error('moviebox-api package not installed. Run: pip install moviebox-api');
    }
  });

  verifier.printSummary();

  return verifier.failed === 0;
}

// Run verification
if (require.main === module) {
  const success = runVerification();
  process.exit(success ? 0 : 1);
}

module.exports = { runVerification };
