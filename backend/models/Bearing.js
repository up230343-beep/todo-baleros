const mongoose = require('mongoose');

const bearingSchema = new mongoose.Schema({
  sku: { type: String, required: true, index: true },
  aliases: [{ type: String }],
  d: { type: Number, required: true },
  D: { type: Number, required: true },
  B: { type: Number, required: true },
  Cr: { type: Number },
  C0r: { type: Number },
  velocity_grease: { type: Number },
  velocity_oil: { type: Number },
  weight: { type: Number },
  available_seals: [{ type: String }],
  category: { type: String, required: true, index: true },
  desc: { type: String }
}, { 
  timestamps: true,
  collection: 'baleros'
});

module.exports = mongoose.model('Bearing', bearingSchema);