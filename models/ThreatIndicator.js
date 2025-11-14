/**
 * ThreatIndicator Schema Model
 * Represents IOCs (Indicators of Compromise)
 */

import mongoose from 'mongoose';

const threatIndicatorSchema = new mongoose.Schema(
  {
    indicatorType: {
      type: String,
      required: [true, 'Indicator type is required'],
      enum: {
        values: ['IP', 'Domain', 'URL', 'Hash'],
        message: '{VALUE} is not a valid indicator type'
      },
      index: true
    },
    value: {
      type: String,
      required: [true, 'Indicator value is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    severityLevel: {
      type: String,
      required: [true, 'Severity level is required'],
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid severity level'
      },
      default: 'medium',
      index: true
    },
    firstSeen: {
      type: Date,
      default: Date.now,
      required: true
    },
    lastSeen: {
      type: Date,
      default: Date.now,
      required: true
    },
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ThreatSource',
      required: [true, 'Source reference is required']
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    confidence: {
      type: Number,
      min: [0, 'Confidence must be at least 0'],
      max: [100, 'Confidence cannot exceed 100'],
      default: 50
    },
    isActive: {
      type: Boolean,
      default: true
    },
    metadata: {
      country: String,
      asn: String,
      port: Number,
      protocol: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for common queries
threatIndicatorSchema.index({ indicatorType: 1, severityLevel: -1 });
threatIndicatorSchema.index({ source: 1, lastSeen: -1 });
threatIndicatorSchema.index({ tags: 1 });
threatIndicatorSchema.index({ value: 'text' });

// Virtual for calculating days active
threatIndicatorSchema.virtual('daysActive').get(function() {
  return Math.ceil((this.lastSeen - this.firstSeen) / (1000 * 60 * 60 * 24));
});

// Method to update last seen timestamp
threatIndicatorSchema.methods.updateLastSeen = function() {
  this.lastSeen = Date.now();
  return this.save();
};

// Static method to find by severity
threatIndicatorSchema.statics.findBySeverity = function(severity) {
  return this.find({ severityLevel: severity, isActive: true })
    .populate('source')
    .sort('-lastSeen');
};

const ThreatIndicator = mongoose.model('ThreatIndicator', threatIndicatorSchema);

export default ThreatIndicator;
