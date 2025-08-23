const express = require('express');
const router = express.Router();
const Performance = require('../models/performance');
const Server = require('../models/server');

// Get performance metrics for a specific server
router.get('/performance/:serverId', async (req, res) => {
    try {
        const { serverId } = req.params;
        const { days = 15 } = req.query; // Default to 15 days, can be overridden

        // Calculate the date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Get performance data for the specified time range
        const performanceData = await Performance.find({
            serverId: serverId,
            timestamp: { $gte: startDate, $lte: endDate }
        }).sort({ timestamp: -1 });

        if (performanceData.length === 0) {
            return res.json({
                success: false,
                message: 'No performance data available for this server',
                data: {
                    uptime: 0,
                    cpuUtilization: {
                        last15Days: 0,
                        last7Days: 0
                    },
                    memoryUsage: 0,
                    diskUsage: 0,
                    networkStats: {
                        in: 0,
                        out: 0
                    }
                }
            });
        }

        // Calculate uptime (total uptime from the most recent record)
        const latestRecord = performanceData[0];
        const uptime = latestRecord.uptime;

        // Calculate CPU utilization averages
        const last15DaysData = performanceData.filter(p => 
            p.timestamp >= new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        );
        const last7DaysData = performanceData.filter(p => 
            p.timestamp >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );

        const avgCPU15Days = last15DaysData.length > 0 
            ? last15DaysData.reduce((sum, p) => sum + p.cpuUtilization, 0) / last15DaysData.length 
            : 0;
        const avgCPU7Days = last7DaysData.length > 0 
            ? last7DaysData.reduce((sum, p) => sum + p.cpuUtilization, 0) / last7DaysData.length 
            : 0;

        // Calculate other metrics averages
        const avgMemory = performanceData.length > 0 
            ? performanceData.reduce((sum, p) => sum + p.memoryUsage, 0) / performanceData.length 
            : 0;
        const avgDisk = performanceData.length > 0 
            ? performanceData.reduce((sum, p) => sum + p.diskUsage, 0) / performanceData.length 
            : 0;

        // Calculate network totals
        const totalNetworkIn = performanceData.reduce((sum, p) => sum + p.networkIn, 0);
        const totalNetworkOut = performanceData.reduce((sum, p) => sum + p.networkOut, 0);

        res.json({
            success: true,
            data: {
                uptime: uptime,
                cpuUtilization: {
                    last15Days: Math.round(avgCPU15Days * 100) / 100,
                    last7Days: Math.round(avgCPU7Days * 100) / 100
                },
                memoryUsage: Math.round(avgMemory * 100) / 100,
                diskUsage: Math.round(avgDisk * 100) / 100,
                networkStats: {
                    in: totalNetworkIn,
                    out: totalNetworkOut
                },
                dataPoints: performanceData.length,
                timeRange: `${days} days`
            }
        });

    } catch (error) {
        console.error('Error fetching performance data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance data',
            error: error.message
        });
    }
});

// Get performance metrics for all servers (summary)
router.get('/performance', async (req, res) => {
    try {
        const servers = await Server.find({}).lean();
        const performanceSummary = [];

        for (const server of servers) {
            const latestPerformance = await Performance.findOne({ 
                serverId: server._id 
            }).sort({ timestamp: -1 });

            if (latestPerformance) {
                performanceSummary.push({
                    serverId: server._id,
                    serverName: server.model,
                    serverIp: server.serverIp,
                    uptime: latestPerformance.uptime,
                    cpuUtilization: latestPerformance.cpuUtilization,
                    memoryUsage: latestPerformance.memoryUsage,
                    diskUsage: latestPerformance.diskUsage,
                    lastUpdated: latestPerformance.timestamp
                });
            } else {
                performanceSummary.push({
                    serverId: server._id,
                    serverName: server.model,
                    serverIp: server.serverIp,
                    uptime: 0,
                    cpuUtilization: 0,
                    memoryUsage: 0,
                    diskUsage: 0,
                    lastUpdated: null
                });
            }
        }

        res.json({
            success: true,
            data: performanceSummary
        });

    } catch (error) {
        console.error('Error fetching performance summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance summary',
            error: error.message
        });
    }
});

// Add sample performance data (for testing/demo purposes)
router.post('/performance/sample/:serverId', async (req, res) => {
    try {
        const { serverId } = req.params;
        const server = await Server.findById(serverId);
        
        if (!server) {
            return res.status(404).json({
                success: false,
                message: 'Server not found'
            });
        }

        // Generate sample performance data for the last 15 days
        const sampleData = [];
        const now = new Date();
        
        for (let i = 14; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const uptime = Math.floor(Math.random() * 86400) + 3600; // Random uptime between 1-24 hours
            const cpuUtilization = Math.random() * 100; // Random CPU usage 0-100%
            const memoryUsage = Math.random() * 100; // Random memory usage 0-100%
            const diskUsage = Math.random() * 100; // Random disk usage 0-100%
            
            sampleData.push({
                serverId: serverId,
                serverIp: server.serverIp,
                timestamp: timestamp,
                uptime: uptime,
                cpuUtilization: Math.round(cpuUtilization * 100) / 100,
                memoryUsage: Math.round(memoryUsage * 100) / 100,
                diskUsage: Math.round(diskUsage * 100) / 100,
                networkIn: Math.floor(Math.random() * 1000000),
                networkOut: Math.floor(Math.random() * 1000000)
            });
        }

        await Performance.insertMany(sampleData);

        res.json({
            success: true,
            message: `Generated ${sampleData.length} sample performance records for server ${server.model}`,
            data: sampleData
        });

    } catch (error) {
        console.error('Error generating sample data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate sample data',
            error: error.message
        });
    }
});

module.exports = router;
