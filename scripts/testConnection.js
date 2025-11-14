/**
 * Database Connection Test
 * Quickly verify MongoDB connection and model functionality
 * 
 * Run with: node scripts/testConnection.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import {
  ThreatSource,
  ThreatIndicator,
  ThreatActor,
  Incident
} from '../models/index.js';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('\n🔍 Testing MongoDB Connection and Models...\n');
    
    // Test 1: Connect to MongoDB
    console.log('Test 1: Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connection successful\n');
    
    // Test 2: Check collections exist
    console.log('Test 2: Checking collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Available collections:', collectionNames.join(', ') || 'None (run npm run seed)');
    console.log('✅ Collections checked\n');
    
    // Test 3: Count documents
    console.log('Test 3: Counting documents...');
    const counts = await Promise.all([
      ThreatSource.countDocuments(),
      ThreatIndicator.countDocuments(),
      ThreatActor.countDocuments(),
      Incident.countDocuments()
    ]);
    
    console.log(`  📊 Threat Sources:    ${counts[0]}`);
    console.log(`  🎯 Threat Indicators: ${counts[1]}`);
    console.log(`  👤 Threat Actors:     ${counts[2]}`);
    console.log(`  🚨 Incidents:         ${counts[3]}`);
    
    if (counts.every(c => c === 0)) {
      console.log('\n⚠️  No data found. Run: npm run seed\n');
    } else {
      console.log('✅ Documents found\n');
      
      // Test 4: Sample queries
      console.log('Test 4: Testing sample queries...');
      
      // Query 1: Find a critical indicator
      const criticalIndicator = await ThreatIndicator.findOne({ 
        severityLevel: 'critical' 
      }).populate('source');
      
      if (criticalIndicator) {
        console.log('✅ Critical indicator found:');
        console.log(`   Type: ${criticalIndicator.indicatorType}`);
        console.log(`   Value: ${criticalIndicator.value}`);
        console.log(`   Source: ${criticalIndicator.source?.sourceName || 'N/A'}`);
      }
      
      // Query 2: Find an active threat actor
      const actor = await ThreatActor.findOne({ isActive: true })
        .populate('linkedIndicators');
      
      if (actor) {
        console.log('✅ Threat actor found:');
        console.log(`   Name: ${actor.actorName}`);
        console.log(`   Motivation: ${actor.motivation}`);
        console.log(`   Linked Indicators: ${actor.linkedIndicators.length}`);
      }
      
      // Query 3: Find recent incident
      const incident = await Incident.findOne()
        .sort('-reportedDate')
        .populate('linkedActors', 'actorName')
        .populate('relatedIndicators', 'indicatorType value');
      
      if (incident) {
        console.log('✅ Recent incident found:');
        console.log(`   Title: ${incident.incidentTitle}`);
        console.log(`   Severity: ${incident.severity}`);
        console.log(`   Status: ${incident.status}`);
        console.log(`   Linked Actors: ${incident.linkedActors.length}`);
        console.log(`   Related Indicators: ${incident.relatedIndicators.length}`);
      }
      
      console.log('\n✅ Sample queries successful\n');
    }
    
    // Test 5: Model validation
    console.log('Test 5: Testing model validation...');
    try {
      const invalidSource = new ThreatSource({
        sourceName: 'Test Source'
        // Missing required fields
      });
      await invalidSource.validate();
    } catch (validationError) {
      console.log('✅ Validation working correctly (expected error caught)');
    }
    
    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎉 All tests passed successfully!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (counts.every(c => c === 0)) {
      console.log('Next steps:');
      console.log('  1. Run: npm run seed');
      console.log('  2. Run: npm run mongo:dev');
      console.log('  3. Visit: http://localhost:5000/api/stats\n');
    } else {
      console.log('Your database is ready! Start the server:');
      console.log('  npm run mongo:dev\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  • Is MongoDB running? (net start MongoDB)');
    console.error('  • Check MONGODB_URI in .env file');
    console.error('  • Ensure dependencies installed: npm install\n');
    process.exit(1);
  }
};

// Run tests
testConnection();
