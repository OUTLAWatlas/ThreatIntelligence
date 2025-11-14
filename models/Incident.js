/**
 * Incident Schema Model
 * Represents security incidents and breaches
 */

import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    incidentTitle: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    reportedDate: {
      type: Date,
      required: [true, 'Reported date is required'],
      default: Date.now
    },
    affectedAssets: [{
      type: String,
      trim: true
    }],
    severity: {
      type: String,
      required: [true, 'Severity is required'],
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid severity level'
      },
      default: 'medium',
      index: true
    },
    linkedActors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ThreatActor'
    }],
    relatedIndicators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ThreatIndicator'
    }],
    status: {
      type: String,
      enum: ['new', 'investigating', 'contained', 'resolved', 'closed'],
      default: 'new',
      index: true
    },
    incidentType: {
      type: String,
      enum: ['malware', 'phishing', 'data-breach', 'ddos', 'ransomware', 'insider-threat', 'other'],
      default: 'other'
    },
    impactLevel: {
      type: String,
      enum: ['none', 'minor', 'moderate', 'major', 'severe'],
      default: 'minor'
    },
    affectedSystems: {
      type: Number,
      min: [0, 'Affected systems cannot be negative'],
      default: 0
    },
    estimatedLoss: {
      type: Number,
      min: [0, 'Estimated loss cannot be negative'],
      default: 0
    },
    resolvedDate: {
      type: Date
    },
    assignedTo: {
      type: String,
      trim: true
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    evidenceLinks: [{
      type: String,
      trim: true
    }],
    notes: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      author: String,
      content: String
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
incidentSchema.index({ reportedDate: -1 });
incidentSchema.index({ severity: 1, status: 1 });
incidentSchema.index({ incidentType: 1 });
incidentSchema.index({ status: 1, reportedDate: -1 });
incidentSchema.index({ tags: 1 });
incidentSchema.index({ incidentTitle: 'text', description: 'text' });

// Virtual for resolution time (if resolved)
incidentSchema.virtual('resolutionTime').get(function() {
  if (this.resolvedDate) {
    return Math.ceil((this.resolvedDate - this.reportedDate) / (1000 * 60 * 60));
  }
  return null;
});

// Virtual for days since reported
incidentSchema.virtual('daysSinceReported').get(function() {
  return Math.ceil((Date.now() - this.reportedDate) / (1000 * 60 * 60 * 24));
});

// Method to mark incident as resolved
incidentSchema.methods.markResolved = function() {
  this.status = 'resolved';
  this.resolvedDate = Date.now();
  return this.save();
};

// Method to add a note
incidentSchema.methods.addNote = function(author, content) {
  this.notes.push({ author, content, timestamp: Date.now() });
  return this.save();
};

// Static method to find critical incidents
incidentSchema.statics.findCritical = function() {
  return this.find({ severity: 'critical', status: { $ne: 'closed' } })
    .populate('linkedActors')
    .populate('relatedIndicators')
    .sort('-reportedDate');
};

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;
