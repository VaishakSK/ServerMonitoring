const mongoose = require('mongoose');

// Performance Metrics Schema
const performanceSchema = new mongoose.Schema({
    serverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server',
        required: true
    },
    serverIp: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    uptime: {
        type: Number, // uptime in seconds
        required: true
    },
    cpuUtilization: {
        type: Number, // CPU usage percentage (0-100)
        required: true
    },
    memoryUsage: {
        type: Number, // Memory usage percentage (0-100)
        default: 0
    },
    diskUsage: {
        type: Number, // Disk usage percentage (0-100)
        default: 0
    },
    networkIn: {
        type: Number, // Network input in bytes
        default: 0
    },
    networkOut: {
        type: Number, // Network output in bytes
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient querying
performanceSchema.index({ serverId: 1, timestamp: -1 });
performanceSchema.index({ serverIp: 1, timestamp: -1 });

// Create and export the Performance model
const Performance = mongoose.model('Performance', performanceSchema);

module.exports = Performance;
