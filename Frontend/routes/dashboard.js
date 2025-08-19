const express = require('express')
const router = express.Router()
const Server = require('../models/server');

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

module.exports = router;