const express = require('express')
const router = express.Router()
const Server = require('../models/server');
const Performance = require('../models/performance');

// Render the Dashboard view
router.get('/dashboard', async (req, res) => {
    try {
        const servers = await Server.find({}).sort({ serverNumber: 1 }).lean();

        const totalTeams = servers.reduce((sum, server) => {
            if (Array.isArray(server.team)) return sum + server.team.length;
            if (server.team == null) return sum;
            return sum + 1; // handle legacy single-value strings
        }, 0);

        const stats = {
            totalServers: servers.length,
            onlineServers: servers.filter(s => s.status === 'on').length,
            offlineServers: servers.filter(s => s.status === 'off').length,
            activeTeams: totalTeams
        };

        res.render('Dashboard', {
            servers: servers,
            stats: stats,
        });
    } catch (err) {
        res.render('Dashboard', { error: 'Could not load server data.' });
    }
});

// Render the Analyze view for a specific server
router.get('/analyze/:serverId', async (req, res) => {
    try {
        const { serverId } = req.params;
        const server = await Server.findById(serverId).lean();
        
        if (!server) {
            return res.status(404).render('error', { 
                message: 'Server not found' 
            });
        }

        res.render('analyze', {
            serverId: serverId,
            serverName: server.model || 'Unknown Server',
            serverIp: server.serverIp || 'Unknown IP'
        });
    } catch (err) {
        console.error('Error loading analyze page:', err);
        res.status(500).render('error', { 
            message: 'Could not load server analysis data.' 
        });
    }
});

// Render the comprehensive server analysis page
router.get('/server-analysis', async (req, res) => {
    try {
        const servers = await Server.find({}).sort({ serverNumber: 1 }).lean();
        
        res.render('server-analysis', {
            servers: servers
        });
    } catch (err) {
        console.error('Error loading server analysis page:', err);
        res.status(500).render('error', { 
            message: 'Could not load server analysis data.' 
        });
    }
});

// Render the Settings page
router.get('/settings', async (req, res) => {
    try {
        const servers = await Server.find({}).sort({ serverNumber: 1 }).lean();
        const totalServers = servers.length;
        const onlineServers = servers.filter(s => s.status === 'on').length;
        const offlineServers = totalServers - onlineServers;
        
        res.render('settings', {
            servers: servers,
            stats: {
                totalServers,
                onlineServers,
                offlineServers
            }
        });
    } catch (err) {
        console.error('Error loading settings page:', err);
        res.status(500).render('error', { 
            message: 'Could not load settings data.' 
        });
    }
});

module.exports = router;