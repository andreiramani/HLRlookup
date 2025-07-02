const HlrLookupClient = require('node-hlr-client');
const fs = require('fs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load configuration from external file
let config;
try {
  config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  if (!config.apiCredentials || !config.apiCredentials.apiKey || !config.apiCredentials.apiSecret) {
    throw new Error('Invalid configuration format');
  }
} catch (err) {
  console.error('Error loading configuration:', err.message);
  process.exit(1);
}

async function runHlrLookup(msisdn) {
    try {
        const client = new HlrLookupClient(
            config.apiCredentials.apiKey,
            config.apiCredentials.apiSecret
        );

        // Test authentication
        console.log('\nAuthenticating with API...');
        let authResponse = await client.get('/auth-test');
        console.log('Authentication Status:', authResponse.status);

        if (authResponse.status !== 200) {
            console.log('Authentication failed:', authResponse.data);
            return;
        }

        // Perform HLR lookup
        console.log(`\nPerforming HLR lookup for: ${msisdn}`);
        let lookupResponse = await client.post('/hlr-lookup', { msisdn: msisdn });
        
        console.log('\nHLR Lookup Results:');
        console.log('Status Code:', lookupResponse.status);
        console.log('Response Data:', lookupResponse.data);

        if (lookupResponse.status !== 200) {
            console.log('Lookup failed with status:', lookupResponse.status);
            return;
        }

        console.log('\nOperation completed successfully');
        console.log('Carrier:', lookupResponse.data.carrier || 'Unknown');
        console.log('Status:', lookupResponse.data.status || 'Unknown');

    } catch (error) {
        console.error('\nError:', error.message);
    } finally {
        readline.close();
    }
}

// Get user input
readline.question('Enter phone number (international format, e.g. +6289654501234): ', msisdn => {
    // Validate input
    if (!/^\+\d{8,15}$/.test(msisdn)) {
        console.error('Error: Invalid format. Use international format (e.g. +6289654501234)');
        process.exit(1);
    }
    runHlrLookup(msisdn);
});