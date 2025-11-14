/**
 * ThreatSource Schema Model
 * Represents threat intelligence sources
 */

import mongoose from 'mongoose';

const threatSourceSchema = new mongoose.Schema(
  {
    sourceName: {
      type: String,
      required: [true, 'Source name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Source name cannot exceed 100 characters']
    },
    sourceType: {
      type: String,
      required: [true, 'Source type is required'],
      enum: {
        values: ['open-source', 'commercial', 'community'],
        message: '{VALUE} is not a valid source type'
      }
    },
    reliabilityScore: {
      type: Number,
      required: [true, 'Reliability score is required'],
      min: [0, 'Reliability score must be at least 0'],
      max: [10, 'Reliability score cannot exceed 10'],
      default: 5
    },
    lastChecked: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
threatSourceSchema.index({ sourceName: 1 });
threatSourceSchema.index({ sourceType: 1, reliabilityScore: -1 });
threatSourceSchema.index({ lastChecked: -1 });

// Virtual field to get all indicators from this source
threatSourceSchema.virtual('indicators', {
  ref: 'ThreatIndicator',
  localField: '_id',
  foreignField: 'source'
});

// Instance method to update last checked timestamp
threatSourceSchema.methods.updateLastChecked = function() {
  this.lastChecked = Date.now();
  return this.save();
};

const ThreatSource = mongoose.model('ThreatSource', threatSourceSchema);

export default ThreatSource;
