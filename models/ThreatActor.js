/**
 * ThreatActor Schema Model
 * Represents known threat actors and APT groups
 */

import mongoose from 'mongoose';

const threatActorSchema = new mongoose.Schema(
  {
    actorName: {
      type: String,
      required: [true, 'Actor name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Actor name cannot exceed 100 characters']
    },
    knownAliases: [{
      type: String,
      trim: true
    }],
    motivation: {
      type: String,
      required: [true, 'Motivation is required'],
      enum: {
        values: ['financial', 'political', 'hacktivist', 'espionage', 'unknown'],
        message: '{VALUE} is not a valid motivation type'
      },
      default: 'unknown',
      index: true
    },
    techniques: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    activeSince: {
      type: Date,
      required: [true, 'Active since date is required']
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    linkedIndicators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ThreatIndicator'
    }],
    sophisticationLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    targetSectors: [{
      type: String,
      trim: true
    }],
    targetRegions: [{
      type: String,
      trim: true
    }],
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
threatActorSchema.index({ actorName: 1 });
threatActorSchema.index({ motivation: 1, sophisticationLevel: -1 });
threatActorSchema.index({ lastActivity: -1 });
threatActorSchema.index({ techniques: 1 });
threatActorSchema.index({ knownAliases: 1 });

// Virtual for calculating days active
threatActorSchema.virtual('activeForDays').get(function() {
  return Math.ceil((this.lastActivity - this.activeSince) / (1000 * 60 * 60 * 24));
});

// Virtual for linked incidents
threatActorSchema.virtual('incidents', {
  ref: 'Incident',
  localField: '_id',
  foreignField: 'linkedActors'
});

// Method to update last activity
threatActorSchema.methods.updateLastActivity = function() {
  this.lastActivity = Date.now();
  return this.save();
};

// Static method to find by motivation
threatActorSchema.statics.findByMotivation = function(motivation) {
  return this.find({ motivation, isActive: true })
    .populate('linkedIndicators')
    .sort('-lastActivity');
};

const ThreatActor = mongoose.model('ThreatActor', threatActorSchema);

export default ThreatActor;
