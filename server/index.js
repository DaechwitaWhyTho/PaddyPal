// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import { dirname, resolve } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// dotenv.config({ path: resolve(__dirname, '.env') });

// // Dynamic import — NOT hoisted, so this only runs (and only resolves
// // './db.js' etc. inside server.js) after dotenv.config() above completes.
// await import('./server.js');

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '.env');
const result;
try {
    // result = dotenv.config({ path: envPath });

    console.log('Looking for .env at:', envPath);
} catch (error) {
    console.error('Error occurred while loading .env:', error.message);
    if (result.error) {
        console.error('dotenv failed to load:', result.error.message);
    } else {
        console.log('dotenv loaded keys:', Object.keys(result.parsed));
    }
}



await import('./server.js');