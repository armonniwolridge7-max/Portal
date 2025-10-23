const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeadSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'new' },
  contact: {
    name: String, phone: String, email: String, preferredContact: String, bestTime: String
  },
  property: {
    address: String, city: String, state: String, zip: String,
    type: String, condition: String, occupancy: String,
    askingPrice: Number, mortgageBalance: Number, estimatedRepairCost: Number,
    onMarket: Boolean, titleIssues: Boolean, notes: String, photos: [String]
  },
  eligibility: {
    score: Number,
    breakdown: Schema.Types.Mixed,
    status: String
  },
  source: String,
  emailSent: { type: Boolean, default: false },
  assignedTo: String
});

module.exports = mongoose.model('Lead', LeadSchema);
