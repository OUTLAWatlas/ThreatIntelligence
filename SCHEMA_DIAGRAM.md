# Database Schema Relationships

## Entity Relationship Diagram

```
┌─────────────────────────┐
│    ThreatSource         │
├─────────────────────────┤
│ _id (ObjectId)          │
│ sourceName (String)     │◄──────────┐
│ sourceType (Enum)       │           │
│ reliabilityScore (0-10) │           │ source (ref)
│ lastChecked (Date)      │           │
│ isActive (Boolean)      │           │
└─────────────────────────┘           │
                                      │
                                      │
                    ┌─────────────────┴──────────────────┐
                    │   ThreatIndicator                  │
                    ├────────────────────────────────────┤
                    │ _id (ObjectId)                     │
                    │ indicatorType (IP/Domain/URL/Hash) │
                    │ value (String, unique)             │◄────────────┐
                    │ severityLevel (low-critical)       │             │
                    │ firstSeen (Date)                   │             │
                    │ lastSeen (Date)                    │             │
                    │ source (ObjectId → ThreatSource)   │             │
                    │ tags ([String])                    │             │
                    │ confidence (0-100)                 │             │
                    └────────────────────────────────────┘             │
                                      │                                │
                                      │                                │
                                      │ linkedIndicators               │
                                      │ (array)                        │
                                      │                                │
                                      ▼                                │
                    ┌─────────────────────────────────────┐            │
                    │    ThreatActor                      │            │
                    ├─────────────────────────────────────┤            │
                    │ _id (ObjectId)                      │◄───────┐   │
                    │ actorName (String, unique)          │        │   │
                    │ knownAliases ([String])             │        │   │
                    │ motivation (Enum)                   │        │   │
                    │ techniques ([String])               │        │   │ relatedIndicators
                    │ activeSince (Date)                  │        │   │ (array)
                    │ lastActivity (Date)                 │        │   │
                    │ linkedIndicators ([ObjectId])       │────────┘   │
                    │ sophisticationLevel (Enum)          │            │
                    │ targetSectors ([String])            │            │
                    └─────────────────────────────────────┘            │
                                      │                                │
                                      │                                │
                                      │ linkedActors (array)           │
                                      │                                │
                                      ▼                                │
                    ┌─────────────────────────────────────┐            │
                    │    Incident                         │            │
                    ├─────────────────────────────────────┤            │
                    │ _id (ObjectId)                      │            │
                    │ incidentTitle (String)              │            │
                    │ description (String)                │            │
                    │ reportedDate (Date)                 │            │
                    │ affectedAssets ([String])           │            │
                    │ severity (low-critical)             │            │
                    │ linkedActors ([ObjectId])           │────────────┘
                    │ relatedIndicators ([ObjectId])      │────────────┘
                    │ status (new-closed)                 │
                    │ incidentType (Enum)                 │
                    │ impactLevel (Enum)                  │
                    │ notes ([{author, content, time}])   │
                    └─────────────────────────────────────┘
```

## Relationship Summary

### One-to-Many Relationships

1. **ThreatSource → ThreatIndicator**
   - One source can have many indicators
   - Each indicator references one source
   - Virtual populate: `source.indicators`

### Many-to-Many Relationships

2. **ThreatActor ↔ ThreatIndicator**
   - Actors can use multiple indicators
   - Indicators can be linked to multiple actors
   - Stored as: `actor.linkedIndicators` (array of ObjectIds)

3. **ThreatActor ↔ Incident**
   - Actors can be involved in multiple incidents
   - Incidents can be attributed to multiple actors
   - Stored as: `incident.linkedActors` (array of ObjectIds)

4. **ThreatIndicator ↔ Incident**
   - Indicators can appear in multiple incidents
   - Incidents can contain multiple indicators
   - Stored as: `incident.relatedIndicators` (array of ObjectIds)

## Collection Indexes

### ThreatSource
- `sourceName`: Unique index
- `sourceType + reliabilityScore`: Compound index
- `lastChecked`: Single field index

### ThreatIndicator
- `value`: Unique + text index
- `indicatorType + severityLevel`: Compound index
- `source + lastSeen`: Compound index
- `tags`: Array index

### ThreatActor
- `actorName`: Unique index
- `motivation + sophisticationLevel`: Compound index
- `lastActivity`: Single field index
- `techniques`: Array index
- `knownAliases`: Array index

### Incident
- `reportedDate`: Descending index
- `severity + status`: Compound index
- `incidentType`: Single field index
- `status + reportedDate`: Compound index
- `tags`: Array index
- `incidentTitle + description`: Text index

## Query Examples

### Find Critical Indicators with Source Info
```javascript
await ThreatIndicator.find({ severityLevel: 'critical' })
  .populate('source', 'sourceName sourceType reliabilityScore')
  .sort('-lastSeen');
```

### Find Actor with All Related Data
```javascript
await ThreatActor.findById(actorId)
  .populate('linkedIndicators')
  .populate('incidents');
```

### Find Incidents by Actor
```javascript
await Incident.find({ linkedActors: actorId })
  .populate('linkedActors', 'actorName motivation')
  .populate('relatedIndicators', 'indicatorType value');
```

### Complex Query: Critical Incidents with Full Context
```javascript
await Incident.find({ 
  severity: 'critical',
  status: { $ne: 'closed' }
})
.populate({
  path: 'linkedActors',
  populate: { path: 'linkedIndicators' }
})
.populate({
  path: 'relatedIndicators',
  populate: { path: 'source' }
})
.sort('-reportedDate');
```

## Data Flow Example

1. **Threat Intelligence Collection**
   ```
   ThreatSource created → Indicators discovered → Linked to source
   ```

2. **Actor Attribution**
   ```
   Indicators analyzed → Patterns matched → Linked to ThreatActor
   ```

3. **Incident Response**
   ```
   Incident detected → Indicators found → Actor attributed → All linked
   ```

## Sample Data Counts

After running `npm run seed`:
- **5** Threat Sources (AlienVault, Recorded Future, MISP, VirusTotal, ThreatCrowd)
- **8** Threat Indicators (mix of IPs, Domains, URLs, Hashes)
- **5** Threat Actors (APT28, Lazarus, FIN7, DarkSide, Anonymous)
- **5** Security Incidents (Ransomware, Phishing, DDoS, etc.)

## Schema Design Decisions

### Why ObjectId References?
- Maintains data integrity
- Allows efficient queries with populate
- Supports many-to-many relationships
- Easy to update related documents

### Why Embedded Arrays for Relationships?
- Fast read access for related entities
- Suitable for moderate array sizes (<1000 items)
- Easy to query and filter
- Better performance than separate junction tables

### Why Separate Collections?
- Clear separation of concerns
- Independent scaling
- Flexible querying
- Easier to maintain and extend

### Virtual Fields
- `daysActive` - Calculated from date ranges
- `resolutionTime` - Computed incident metrics
- `indicators` - Reverse population from ThreatSource
- No storage overhead, computed on-demand
