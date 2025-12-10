// /**
//  * Script to seed States and Cities from JSON file
//  * 
//  * Usage: node src/scripts/seed-states-cities.js [path-to-json-file]
//  * 
//  * JSON Format Expected (Districts Format):
//  * {
//  *   "districts": [
//  *     {
//  *       "state": "Andhra Pradesh",
//  *       "district": "Alluri Sitharama Raju",
//  *       "headquarters": "Paderu",
//  *       ...
//  *     },
//  *     {
//  *       "state": "Maharashtra",
//  *       "district": "Mumbai",
//  *       "headquarters": "Mumbai",
//  *       ...
//  *     }
//  *   ]
//  * }
//  * 
//  * OR (Simple Format):
//  * [
//  *   {
//  *     "name": "Maharashtra",
//  *     "cities": ["Mumbai", "Pune", "Nagpur", ...]
//  *   }
//  * ]
//  * 
//  * The script will:
//  * 1. Insert states (skip if already exists)
//  * 2. Insert cities (districts) for each state (skip if already exists)
//  * 3. Show progress and summary
//  */

// const path = require('path');
// const fs = require('fs');
// // Load .env from project root (two levels up from scripts folder)
// const envPath = path.join(__dirname, '../../.env');

// // Check if .env file exists
// if (!fs.existsSync(envPath)) {
//   console.error('❌ ERROR: .env file not found!');
//   console.error(`   Expected location: ${envPath}`);
//   console.error('   Please ensure .env file exists in the project root (Learning_shala_project/.env)');
//   process.exit(1);
// }

// // Load environment variables
// const dotenvResult = require('dotenv').config({ path: envPath });

// if (dotenvResult.error) {
//   console.error('❌ ERROR loading .env file:', dotenvResult.error.message);
//   process.exit(1);
// }

// // Verify required environment variables
// if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
//   console.error('❌ ERROR: Missing required database environment variables!');
//   console.error('   Required: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
//   console.error(`   Found: DB_HOST=${process.env.DB_HOST ? '✓' : '✗'}, DB_USER=${process.env.DB_USER ? '✓' : '✗'}, DB_PASSWORD=${process.env.DB_PASSWORD ? '✓' : '✗'}, DB_NAME=${process.env.DB_NAME ? '✓' : '✗'}`);
//   process.exit(1);
// }

// const mysql = require('mysql2/promise');

// // Use same database configuration as db.ts
// const isProd = process.env.NODE_ENV === 'production';
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: 3306,
//   ssl: isProd ? { rejectUnauthorized: false } : undefined,
// });

// // Get JSON file path from command line or use default
// const jsonFilePath = process.argv[2] || path.join(__dirname, '../data/indian-states-cities.json');

// async function seedStatesAndCities() {
//   let connection;
  
//   try {
//     // Check if JSON file exists
//     if (!fs.existsSync(jsonFilePath)) {
//       console.error(`❌ ERROR: JSON file not found at: ${jsonFilePath}`);
//       console.error('\n📝 Please provide the path to your JSON file:');
//       console.error('   node src/scripts/seed-states-cities.js path/to/your/file.json');
//       console.error('\n📋 Expected JSON format:');
//       console.error(JSON.stringify([
//         {
//           name: "Maharashtra",
//           cities: ["Mumbai", "Pune", "Nagpur"]
//         },
//         {
//           name: "Karnataka",
//           cities: ["Bengaluru", "Mysuru"]
//         }
//       ], null, 2));
//       process.exit(1);
//     }

//     // Read and parse JSON file
//     console.log(`📖 Reading JSON file: ${jsonFilePath}`);
//     const rawData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
//     let jsonData;
    
//     // Handle two formats:
//     // 1. Districts format: { "districts": [...] }
//     // 2. Simple format: [ { "name": "...", "cities": [...] } ]
//     if (rawData.districts && Array.isArray(rawData.districts)) {
//       console.log('📋 Detected districts format - converting to state/city structure...');
      
//       // Group districts by state
//       const stateMap = new Map();
      
//       for (const district of rawData.districts) {
//         if (!district.state || !district.district) {
//           continue;
//         }
        
//         const stateName = district.state.trim();
//         const districtName = district.district.trim();
        
//         if (!stateMap.has(stateName)) {
//           stateMap.set(stateName, []);
//         }
        
//         // Add district as city (you can also use district.headquarters if preferred)
//         stateMap.get(stateName).push(districtName);
//       }
      
//       // Convert to simple format
//       jsonData = Array.from(stateMap.entries()).map(([stateName, cities]) => ({
//         name: stateName,
//         cities: cities
//       }));
      
//       console.log(`✅ Converted ${rawData.districts.length} districts into ${jsonData.length} states\n`);
//     } else if (Array.isArray(rawData)) {
//       jsonData = rawData;
//       console.log(`✅ Found ${jsonData.length} states/UTs in JSON file\n`);
//     } else {
//       throw new Error('JSON file must contain either a "districts" array or an array of states');
//     }

//     // Get database connection from pool (using existing db connection)
//     console.log('🔌 Getting database connection from pool...');
//     connection = await pool.getConnection();
//     console.log('✅ Connected to database\n');

//     let statesInserted = 0;
//     let statesSkipped = 0;
//     let citiesInserted = 0;
//     let citiesSkipped = 0;
//     const stateIdMap = new Map(); // Map state name to state ID

//     // Step 1: Insert States
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     console.log('📊 STEP 1: Inserting States...');
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

//     for (const stateData of jsonData) {
//       if (!stateData.name || typeof stateData.name !== 'string') {
//         console.warn(`⚠️  Skipping invalid state entry: ${JSON.stringify(stateData)}`);
//         continue;
//       }

//       const stateName = stateData.name.trim();
      
//       try {
//         // Check if state already exists
//         const [existing] = await connection.query(
//           'SELECT id FROM states WHERE name = ?',
//           [stateName]
//         );

//         if (existing.length > 0) {
//           // State exists, use existing ID
//           stateIdMap.set(stateName, existing[0].id);
//           statesSkipped++;
//           console.log(`⏭️  State already exists: ${stateName} (ID: ${existing[0].id})`);
//         } else {
//           // Insert new state
//           const [result] = await connection.query(
//             'INSERT INTO states (name, is_active) VALUES (?, ?)',
//             [stateName, 1]
//           );
//           stateIdMap.set(stateName, result.insertId);
//           statesInserted++;
//           console.log(`✅ Inserted state: ${stateName} (ID: ${result.insertId})`);
//         }
//       } catch (error) {
//         console.error(`❌ Error processing state "${stateName}":`, error.message);
//       }
//     }

//     console.log(`\n📈 States Summary: ${statesInserted} inserted, ${statesSkipped} already existed\n`);

//     // Step 2: Insert Cities
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     console.log('📊 STEP 2: Inserting Cities...');
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

//     for (const stateData of jsonData) {
//       const stateName = stateData.name.trim();
//       const stateId = stateIdMap.get(stateName);

//       if (!stateId) {
//         console.warn(`⚠️  Skipping cities for state "${stateName}" - state not found`);
//         continue;
//       }

//       if (!stateData.cities || !Array.isArray(stateData.cities)) {
//         console.warn(`⚠️  No cities array found for state: ${stateName}`);
//         continue;
//       }

//       const cities = stateData.cities.filter(city => city && typeof city === 'string');
//       console.log(`\n📍 Processing ${cities.length} cities for ${stateName}...`);

//       for (const cityName of cities) {
//         const trimmedCityName = cityName.trim();
        
//         if (!trimmedCityName) {
//           continue;
//         }

//         try {
//           // Check if city already exists for this state
//           const [existing] = await connection.query(
//             'SELECT id FROM cities WHERE state_id = ? AND name = ?',
//             [stateId, trimmedCityName]
//           );

//           if (existing.length > 0) {
//             citiesSkipped++;
//             // Uncomment below if you want to see skipped cities
//             // console.log(`   ⏭️  City already exists: ${trimmedCityName}`);
//           } else {
//             // Insert new city
//             await connection.query(
//               'INSERT INTO cities (state_id, name, is_active) VALUES (?, ?, ?)',
//               [stateId, trimmedCityName, 1]
//             );
//             citiesInserted++;
//             // Uncomment below if you want to see each city inserted
//             // console.log(`   ✅ Inserted: ${trimmedCityName}`);
//           }
//         } catch (error) {
//           console.error(`   ❌ Error inserting city "${trimmedCityName}" for ${stateName}:`, error.message);
//         }
//       }

//       console.log(`   ✅ Completed ${stateName}: ${citiesInserted} new cities inserted (${citiesSkipped} already existed)`);
//     }

//     // Final Summary
//     console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     console.log('📊 FINAL SUMMARY');
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
//     console.log(`✅ States: ${statesInserted} inserted, ${statesSkipped} already existed`);
//     console.log(`✅ Cities: ${citiesInserted} inserted, ${citiesSkipped} already existed`);
//     console.log(`\n🎉 Seeding completed successfully!\n`);

//   } catch (error) {
//     console.error('\n❌ ERROR:', error.message);
//     console.error(error.stack);
//     process.exit(1);
//   } finally {
//     if (connection) {
//       connection.release(); // Release connection back to pool (not end)
//       console.log('🔌 Database connection released to pool');
//     }
//     // Don't close the pool, let it be reused
//   }
// }

// // Run the script
// seedStatesAndCities();

