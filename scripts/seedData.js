/**
 * Seed Data Script
 * Populates the database with sample threat intelligence data
 * 
 * Run with: node scripts/seedData.js
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

// Load environment variables
dotenv.config();

// Sample data for ThreatSources
const threatSources = [
  {
    sourceName: 'AlienVault OTX',
    sourceType: 'open-source',
    reliabilityScore: 8,
    description: 'Open Threat Exchange - Community-driven threat intelligence',
    lastChecked: new Date('2025-11-13')
  },
  {
    sourceName: 'Recorded Future',
    sourceType: 'commercial',
    reliabilityScore: 9,
    description: 'Premium threat intelligence platform',
    lastChecked: new Date('2025-11-14')
  },
  {
    sourceName: 'MISP Project',
    sourceType: 'community',
    reliabilityScore: 7,
    description: 'Malware Information Sharing Platform',
    lastChecked: new Date('2025-11-12')
  },
  {
    sourceName: 'VirusTotal',
    sourceType: 'commercial',
    reliabilityScore: 9,
    description: 'Malware scanning and analysis service',
    lastChecked: new Date('2025-11-14')
  },
  {
    sourceName: 'ThreatCrowd',
    sourceType: 'open-source',
    reliabilityScore: 6,
    description: 'Search engine for threats',
    lastChecked: new Date('2025-11-10')
  }
];

// Function to generate sample ThreatIndicators
const generateIndicators = (sources) => [
  {
    indicatorType: 'IP',
    value: '192.168.100.45',
    severityLevel: 'critical',
    firstSeen: new Date('2025-10-15'),
    lastSeen: new Date('2025-11-13'),
    source: sources[0]._id,
    tags: ['botnet', 'c2', 'malware'],
    confidence: 95,
    metadata: {
      country: 'RU',
      asn: 'AS12345',
      port: 443
    }
  },
  {
    indicatorType: 'Domain',
    value: 'malicious-phishing-site.com',
    severityLevel: 'high',
    firstSeen: new Date('2025-11-01'),
    lastSeen: new Date('2025-11-14'),
    source: sources[1]._id,
    tags: ['phishing', 'credential-theft'],
    confidence: 88
  },
  {
    indicatorType: 'Hash',
    value: 'a3f5d9c2e1b4f6a8d7c9e1f3b5d7a9c2',
    severityLevel: 'critical',
    firstSeen: new Date('2025-09-20'),
    lastSeen: new Date('2025-11-10'),
    source: sources[3]._id,
    tags: ['ransomware', 'cryptolocker', 'malware'],
    confidence: 98
  },
  {
    indicatorType: 'URL',
    value: 'http://evil-download-site.net/payload.exe',
    severityLevel: 'high',
    firstSeen: new Date('2025-10-28'),
    lastSeen: new Date('2025-11-12'),
    source: sources[0]._id,
    tags: ['malware-distribution', 'trojan'],
    confidence: 90
  },
  {
    indicatorType: 'IP',
    value: '10.0.0.254',
    severityLevel: 'medium',
    firstSeen: new Date('2025-11-05'),
    lastSeen: new Date('2025-11-14'),
    source: sources[2]._id,
    tags: ['scanning', 'reconnaissance'],
    confidence: 65,
    metadata: {
      country: 'CN',
      asn: 'AS54321'
    }
  },
  {
    indicatorType: 'Domain',
    value: 'suspicious-banking-portal.org',
    severityLevel: 'critical',
    firstSeen: new Date('2025-10-10'),
    lastSeen: new Date('2025-11-13'),
    source: sources[1]._id,
    tags: ['phishing', 'financial', 'credential-theft'],
    confidence: 92
  },
  {
    indicatorType: 'Hash',
    value: 'b2d6e8f1a3c5d9e7f2b4a6c8d1e3f5a7',
    severityLevel: 'low',
    firstSeen: new Date('2025-11-08'),
    lastSeen: new Date('2025-11-09'),
    source: sources[4]._id,
    tags: ['adware', 'pup'],
    confidence: 55
  },
  {
    indicatorType: 'IP',
    value: '203.0.113.100',
    severityLevel: 'high',
    firstSeen: new Date('2025-10-25'),
    lastSeen: new Date('2025-11-14'),
    source: sources[0]._id,
    tags: ['ddos', 'botnet'],
    confidence: 85,
    metadata: {
      country: 'US',
      asn: 'AS99999',
      protocol: 'TCP'
    }
  }
];

// Function to generate sample ThreatActors
const generateActors = (indicators) => [
  {
    actorName: 'APT28',
    knownAliases: ['Fancy Bear', 'Sofacy', 'Strontium'],
    motivation: 'political',
    techniques: ['spear-phishing', 'zero-day exploits', 'watering hole attacks'],
    activeSince: new Date('2007-01-01'),
    lastActivity: new Date('2025-11-10'),
    linkedIndicators: [indicators[0]._id, indicators[3]._id],
    sophisticationLevel: 'expert',
    targetSectors: ['government', 'military', 'media'],
    targetRegions: ['Europe', 'North America'],
    description: 'Russian-based APT group with ties to military intelligence'
  },
  {
    actorName: 'Lazarus Group',
    knownAliases: ['Hidden Cobra', 'Guardians of Peace'],
    motivation: 'financial',
    techniques: ['ransomware', 'cryptocurrency theft', 'destructive malware'],
    activeSince: new Date('2009-01-01'),
    lastActivity: new Date('2025-11-13'),
    linkedIndicators: [indicators[2]._id, indicators[5]._id],
    sophisticationLevel: 'expert',
    targetSectors: ['financial', 'cryptocurrency', 'entertainment'],
    targetRegions: ['Global'],
    description: 'North Korean state-sponsored hacking group'
  },
  {
    actorName: 'FIN7',
    knownAliases: ['Carbanak Group'],
    motivation: 'financial',
    techniques: ['phishing', 'pos-malware', 'network-intrusion'],
    activeSince: new Date('2013-01-01'),
    lastActivity: new Date('2025-11-08'),
    linkedIndicators: [indicators[1]._id, indicators[5]._id],
    sophisticationLevel: 'advanced',
    targetSectors: ['retail', 'hospitality', 'restaurant'],
    targetRegions: ['United States', 'Europe'],
    description: 'Financially motivated cybercrime group targeting payment systems'
  },
  {
    actorName: 'DarkSide',
    knownAliases: ['Carbon Spider'],
    motivation: 'financial',
    techniques: ['ransomware', 'data-exfiltration', 'double-extortion'],
    activeSince: new Date('2020-08-01'),
    lastActivity: new Date('2025-10-30'),
    linkedIndicators: [indicators[2]._id],
    sophisticationLevel: 'advanced',
    targetSectors: ['energy', 'infrastructure', 'manufacturing'],
    targetRegions: ['North America', 'Europe'],
    description: 'Ransomware-as-a-Service operation, known for Colonial Pipeline attack'
  },
  {
    actorName: 'Anonymous Collective',
    knownAliases: ['Anons'],
    motivation: 'hacktivist',
    techniques: ['ddos', 'website-defacement', 'data-leaks'],
    activeSince: new Date('2003-01-01'),
    lastActivity: new Date('2025-11-12'),
    linkedIndicators: [indicators[7]._id],
    sophisticationLevel: 'intermediate',
    targetSectors: ['government', 'corporate', 'law-enforcement'],
    targetRegions: ['Global'],
    description: 'Decentralized hacktivist collective'
  }
];

// Function to generate sample Incidents
const generateIncidents = (actors, indicators) => [
  {
    incidentTitle: 'Critical Ransomware Attack on Healthcare Provider',
    description: 'Major healthcare provider suffered a ransomware attack encrypting patient records and critical systems. Attackers demanded $5M ransom.',
    reportedDate: new Date('2025-11-10T08:30:00'),
    affectedAssets: ['Patient Database', 'Billing System', 'Medical Records', 'Backup Servers'],
    severity: 'critical',
    linkedActors: [actors[1]._id],
    relatedIndicators: [indicators[2]._id],
    status: 'investigating',
    incidentType: 'ransomware',
    impactLevel: 'severe',
    affectedSystems: 450,
    estimatedLoss: 5000000,
    assignedTo: 'Security Team Alpha',
    tags: ['ransomware', 'healthcare', 'data-breach'],
    evidenceLinks: ['https://evidence.local/case001'],
    notes: [
      {
        author: 'John Doe',
        content: 'Initial detection by EDR system. Isolating affected systems.',
        timestamp: new Date('2025-11-10T09:00:00')
      }
    ]
  },
  {
    incidentTitle: 'Phishing Campaign Targeting Executive Team',
    description: 'Sophisticated spear-phishing campaign targeting C-level executives with fake board meeting invitations containing malicious attachments.',
    reportedDate: new Date('2025-11-12T14:20:00'),
    affectedAssets: ['Executive Email Accounts', 'Corporate VPN'],
    severity: 'high',
    linkedActors: [actors[0]._id],
    relatedIndicators: [indicators[1]._id, indicators[3]._id],
    status: 'contained',
    incidentType: 'phishing',
    impactLevel: 'moderate',
    affectedSystems: 12,
    estimatedLoss: 0,
    assignedTo: 'Security Team Bravo',
    tags: ['phishing', 'social-engineering', 'apt'],
    evidenceLinks: ['https://evidence.local/case002'],
    notes: [
      {
        author: 'Jane Smith',
        content: 'Blocked malicious domains. Resetting compromised credentials.',
        timestamp: new Date('2025-11-12T15:45:00')
      }
    ]
  },
  {
    incidentTitle: 'DDoS Attack on E-commerce Platform',
    description: 'Distributed Denial of Service attack overwhelming web servers during peak shopping period. Attack originated from botnet.',
    reportedDate: new Date('2025-11-13T16:00:00'),
    affectedAssets: ['Web Servers', 'API Gateway', 'CDN'],
    severity: 'high',
    linkedActors: [actors[4]._id],
    relatedIndicators: [indicators[7]._id],
    status: 'resolved',
    incidentType: 'ddos',
    impactLevel: 'major',
    affectedSystems: 8,
    estimatedLoss: 250000,
    resolvedDate: new Date('2025-11-13T19:30:00'),
    assignedTo: 'Network Operations',
    tags: ['ddos', 'botnet', 'availability'],
    evidenceLinks: ['https://evidence.local/case003'],
    notes: [
      {
        author: 'Bob Wilson',
        content: 'Activated DDoS mitigation service. Traffic normalized.',
        timestamp: new Date('2025-11-13T17:30:00')
      },
      {
        author: 'Bob Wilson',
        content: 'Attack mitigated. Reviewing logs for IOCs.',
        timestamp: new Date('2025-11-13T19:30:00')
      }
    ]
  },
  {
    incidentTitle: 'Credential Stuffing Attack on User Accounts',
    description: 'Automated credential stuffing attempt detected with stolen credentials from external breach. Multiple account takeover attempts.',
    reportedDate: new Date('2025-11-08T03:15:00'),
    affectedAssets: ['User Authentication System', 'Customer Database'],
    severity: 'medium',
    linkedActors: [actors[2]._id],
    relatedIndicators: [indicators[5]._id],
    status: 'closed',
    incidentType: 'data-breach',
    impactLevel: 'minor',
    affectedSystems: 3,
    estimatedLoss: 0,
    resolvedDate: new Date('2025-11-09T12:00:00'),
    assignedTo: 'Security Team Charlie',
    tags: ['credential-stuffing', 'account-takeover'],
    evidenceLinks: ['https://evidence.local/case004'],
    notes: [
      {
        author: 'Alice Brown',
        content: 'Implemented rate limiting and CAPTCHA. Forced password resets.',
        timestamp: new Date('2025-11-08T10:00:00')
      }
    ]
  },
  {
    incidentTitle: 'Malware Detected on Executive Workstation',
    description: 'Advanced persistent threat malware discovered on CFO workstation during routine scan. Established C2 communication.',
    reportedDate: new Date('2025-11-14T09:45:00'),
    affectedAssets: ['CFO Workstation', 'Financial Network Segment'],
    severity: 'critical',
    linkedActors: [actors[0]._id, actors[1]._id],
    relatedIndicators: [indicators[0]._id, indicators[2]._id, indicators[3]._id],
    status: 'investigating',
    incidentType: 'malware',
    impactLevel: 'major',
    affectedSystems: 1,
    estimatedLoss: 0,
    assignedTo: 'Incident Response Team',
    tags: ['malware', 'apt', 'executive-target', 'c2'],
    evidenceLinks: ['https://evidence.local/case005'],
    notes: [
      {
        author: 'Mike Johnson',
        content: 'System isolated. Conducting forensic analysis.',
        timestamp: new Date('2025-11-14T10:30:00')
      }
    ]
  }
];

// Main seeding function
const seedData = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    
    // Clear existing collections
    await ThreatSource.deleteMany({});
    await ThreatIndicator.deleteMany({});
    await ThreatActor.deleteMany({});
    await Incident.deleteMany({});

    console.log('✅ Existing data cleared\n');

    // Insert ThreatSources
    console.log('📊 Seeding Threat Sources...');
    const insertedSources = await ThreatSource.insertMany(threatSources);
    console.log(`✅ Inserted ${insertedSources.length} threat sources\n`);

    // Insert ThreatIndicators
    console.log('🎯 Seeding Threat Indicators...');
    const indicators = generateIndicators(insertedSources);
    const insertedIndicators = await ThreatIndicator.insertMany(indicators);
    console.log(`✅ Inserted ${insertedIndicators.length} threat indicators\n`);

    // Insert ThreatActors
    console.log('👤 Seeding Threat Actors...');
    const actors = generateActors(insertedIndicators);
    const insertedActors = await ThreatActor.insertMany(actors);
    console.log(`✅ Inserted ${insertedActors.length} threat actors\n`);

    // Insert Incidents
    console.log('🚨 Seeding Incidents...');
    const incidents = generateIncidents(insertedActors, insertedIndicators);
    const insertedIncidents = await Incident.insertMany(incidents);
    console.log(`✅ Inserted ${insertedIncidents.length} incidents\n`);

    // Display summary
    console.log('═══════════════════════════════════════════');
    console.log('🎉 Database seeding completed successfully!');
    console.log('═══════════════════════════════════════════');
    console.log(`📊 Threat Sources:    ${insertedSources.length}`);
    console.log(`🎯 Threat Indicators: ${insertedIndicators.length}`);
    console.log(`👤 Threat Actors:     ${insertedActors.length}`);
    console.log(`🚨 Incidents:         ${insertedIncidents.length}`);
    console.log('═══════════════════════════════════════════\n');

    // Display sample data
    console.log('📋 Sample Data Overview:\n');
    
    console.log('Top Threat Sources:');
    insertedSources.slice(0, 3).forEach(source => {
      console.log(`  • ${source.sourceName} (${source.sourceType}) - Score: ${source.reliabilityScore}/10`);
    });

    console.log('\nCritical Indicators:');
    insertedIndicators.filter(i => i.severityLevel === 'critical').forEach(indicator => {
      console.log(`  • ${indicator.indicatorType}: ${indicator.value} (${indicator.tags.join(', ')})`);
    });

    console.log('\nActive Threat Actors:');
    insertedActors.slice(0, 3).forEach(actor => {
      console.log(`  • ${actor.actorName} - ${actor.motivation} (${actor.sophisticationLevel})`);
    });

    console.log('\nRecent Incidents:');
    insertedIncidents.slice(0, 3).forEach(incident => {
      console.log(`  • ${incident.incidentTitle} [${incident.severity.toUpperCase()}]`);
    });

    console.log('\n✅ You can now start the server with: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Execute seeding
seedData();
