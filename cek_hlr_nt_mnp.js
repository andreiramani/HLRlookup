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

async function performLookups(msisdn) {
    try {
        const client = new HlrLookupClient(
            config.apiCredentials.apiKey,
            config.apiCredentials.apiSecret
        );

        // Test authentication
        let authResponse = await client.get('/auth-test');
        console.log('\nAuthentication Status:', authResponse.status);
        
        if (authResponse.status !== 200) {
            console.log('Authentication failed');
            return;
        }

        // HLR Lookup
        console.log('\n=== Performing HLR Lookup ===');
        let hlrResponse = await client.post('/hlr-lookup', { msisdn: msisdn });
        console.log('HLR Status Code:', hlrResponse.status);
        console.log('HLR Response:', hlrResponse.data);

        if (hlrResponse.status !== 200) {
            console.log('HLR lookup failed');
            return;
        }

        // NT Lookup
        console.log('\n=== Performing NT Lookup ===');
        let ntResponse = await client.post('/nt-lookup', { number: msisdn });
        console.log('NT Status Code:', ntResponse.status);
        console.log('NT Response:', ntResponse.data);

        if (ntResponse.status !== 200) {
            console.log('NT lookup failed');
            return;
        }

        // MNP Lookup
        console.log('\n=== Performing MNP Lookup ===');
        let mnpResponse = await client.post('/mnp-lookup', { msisdn: msisdn });
        console.log('MNP Status Code:', mnpResponse.status);
        console.log('MNP Response:', mnpResponse.data);

        if (mnpResponse.status !== 200) {
            console.log('MNP lookup failed');
            return;
        }

        console.log('\n=== All lookups completed successfully ===');
        console.log('Final Results:');
        console.log('- HLR Data:', hlrResponse.data);
        console.log('- NT Data:', ntResponse.data);
        console.log('- MNP Data:', mnpResponse.data);

    } catch (error) {
        console.error('\nError:', error.message);
    } finally {
        readline.close();
    }
}

// Prompt user for MSISDN input
readline.question('Enter MSISDN number (with country code, e.g. +6289612341234): ', msisdn => {
    // Validate input
    if (!msisdn.startsWith('+')) {
        console.log('Error: Please include country code (e.g. +62 for Indonesia)');
        process.exit(1);
    }
    
    if (!/^\+\d{8,15}$/.test(msisdn)) {
        console.log('Error: Invalid phone number format');
        process.exit(1);
    }

    performLookups(msisdn);
});