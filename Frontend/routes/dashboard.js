const express = require('express')
const router = express.Router()
const Server = require('../models/server');

// Render the Dashboard view
router.get('/dashboard', async (req, res) => {
    try {
        const servers = await Server.find({}).lean();

        const stats = {
            totalServers: servers.length,
            onlineServers: servers.filter(s => s.status === 'on').length,
            offlineServers: servers.filter(s => s.status === 'off').length,
            activeTeams: new Set(servers.map(s => s.team)).size
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