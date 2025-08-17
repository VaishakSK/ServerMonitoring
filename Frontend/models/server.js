const mongoose = require('mongoose');

// Server Schema
const serverSchema = new mongoose.Schema({
    model: {
        type: String,
        required: [true, 'Server model is required'],
        trim: true
    },
    serverNumber: {
        type: String,
        required: [true, 'Server number is required'],
        unique: true,
        trim: true
    },
    os: {
        type: String,
        required: [true, 'Operating system is required'],
        trim: true
    },
    ram: {
        type: String,
        required: [true, 'RAM specification is required'],
        trim: true
    },
    storage: {
        type: String,
        required: [true, 'Storage specification is required'],
        trim: true
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true
    },
    serverIp: {
        type: String,
        required: [true, 'Server IP is required'],
        trim: true
    },
    allocatedDomain: {
        type: String,
        required: [true, 'Allocated domain is required'],
        trim: true
    },
    team: {
        type: String,
        required: [true, 'Team assignment is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['on', 'off'],  // restricts values to "on" or "off"
        default: 'off'        // default status when new server is added
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export the Server model
const Server = mongoose.model('Server', serverSchema);

module.exports = Server;
