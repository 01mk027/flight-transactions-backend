// flight.model.js
const mongoose = require('mongoose');
const User = require('./user.model');
const Schema = mongoose.Schema;


const flightSchema = new mongoose.Schema({
    userId: String,
    price: Number,
    lastUpdatedAt: {type: String, default: null},
    actualLandingTime: {type: String, default: null},
    actualOffBlockTime: {type: String, default: null},
    aircraftRegistration: {type: String, default: null},
    aircraftType: {
      iataMain: {type: String, default: null},
      iataSub: {type: String, default: null},
    },
    baggageClaim: {
      belts: {type: [String], default: []},
    },
    checkinAllocations:{
        checkinAllocations: {type: [Schema.Types.Mixed], default: []},
        remarks:{type: [Schema.Types.Mixed], default: []},
    },
    codeshares: {
        codeshares: {type: [String], default: []}
    },
    estimatedLandingTime:{type: String, default: null},
    expectedTimeBoarding:{type: String, default: null},
    expectedTimeGateClosing:{type: String, default: null},
    expectedTimeGateOpen: {type: String, default: null},
    expectedTimeOnBelt: {type: String, default: null},
    expectedSecurityFilter: {type: String, default: null},
    flightDirection: {type: String, default: null},
    flightName: {type: String, default: null},
    flightNumber: Number,
    gate: {type: String, default: null},
    pier: {type: String, default: null},
    id: {type: String, default: null},
    isOperationalFlight:{type: Boolean, default: null},
    mainFlight: {type: String, default: null},
    prefixIATA: {type: String, default: null},
    prefixICAO: {type: String, default: null},
    airlineCode:{type: Number, default: null},
    publicEstimatedOffBlockTime: {type: String, default: null},
    publicFlightState:{
        flightStates: {type: [String], default: []}
    },
    route:{
        destinations: {type: [String], default: []},
        eu:{type: String, default: null},
        visa: {type: Boolean, default: null}
        },
    scheduleDateTime: {type: String, default: null},
    scheduleDate: {type: String, default: null},
    scheduleTime: {type: String, default: null},
    serviceType: {type: String, default: null},
    terminal: {type: Number, default: null},
    transferPositions:{
        transferPositions: {type: [Number], default:[]},
    },
    schemaVersion: {type: String, default: null}
}, { timestamps: true });

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;
