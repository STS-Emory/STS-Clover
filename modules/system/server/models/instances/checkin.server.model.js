'use strict';

var mongoose = require('mongoose'),
  autoIncrement = require('mongoose-auto-increment'),
  Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

// Plugin initialization
autoIncrement.initialize(mongoose.connection);

var CheckinSchema = new Schema({
  //Basic instance information
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  preDiagnostic:{
    type: String,
    trim: true,
    required: 'Preliminary diagnostic information is required.'
  },
  suggestedAction:{
    type: String,
    trim: true,
    required: 'Suggested action information is required.'
  },
  deviceManufacturer:{
    type: String,
    trim: true,
    required: 'Device manufacturer information is required'
  },
  deviceModel:{
    type: String,
    trim: true,
    required: 'Device model information is required'
  },
  deviceInfoUser:{
    type: String,
    trim: true,
    required: 'Device user information is required'
  },
  deviceInfoPwd:{
    type: String,
    trim: true,
    required: 'Device password information is required'
  },
  deviceInfoOS:{
    type: [String],
    trim: true,
    default: []
  },
  itemReceived:{
    type: [String],
    trim: true,
    required: true
  },
  otherItem:{
    type: String,
    trim: true,
    default: ''
  },
  reformatConsent:{
    type: Boolean,
    required: true
  },
  liabilitySig:{
    type: String,
    trim: true,
    default: ''
  },
  pickupSig:{
    type: String,
    trim: true,
    default: ''
  },
  receiptEmailSent:{
    type: Boolean,
    default: false
  },
  pickupEmailSent:{
    type: Boolean,
    default: false
  },
  logEmailSent:{
    type: Boolean,
    default: false
  },

  //Walkin information
  walkin: {
    type: Number,
    ref: 'Walkin',
    required: true
  },

  // Instance log
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Service log
  status: {
    type: String,
    enum: ['Checkout pending', 'Verification pending', 'Work in progress', 'Completed', 'User action pending'],
    default: ['Work in progress']
  },
  serviceLog: {
    type: [Schema.ObjectId],
    ref: 'ServiceEntry',
    default: []
  },
  completionTechnician: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  completionTime:{
    type: Date
  },
  verificationTechnician: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  verificationTime:{
    type: Date
  },
  checkoutTechnician: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  checkoutTime:{
    type: Date
  },
  templateApplied: {
    type: String,
    trim: true,
    default: ''
  },

  // Service Now information
  snSysId: {
    type: String,
    trim: true,
    default: ''
  },
  snValue: {
    type: String,
    trim: true,
    default: ''
  }
});

CheckinSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

CheckinSchema.plugin(autoIncrement.plugin, 'Checkin');
mongoose.model('Checkin', CheckinSchema);
