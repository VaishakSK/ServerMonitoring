const express = require('express');
const router = express.Router();
const Server = require('../models/server');

// Helper to compute total active teams (sum of all team assignments across servers)
async function getActiveTeamsCount() {
    try {
        const result = await Server.aggregate([
            { $unwind: '$team' },
            { $count: 'count' }
        ]);
        return (result && result[0] && result[0].count) || 0;
    } catch (e) {
        return 0;
    }
}

// Add Server Page
router.get('/add', async (req, res) => {
    const securityCode = req.query.code;
    // console.log("Query param (decoded):", securityCode); // 👈 should print server@kle

    // Save to session if matches
    if (securityCode === process.env.SECURITY_CODE) {
        req.session.securityCode = securityCode;
        const existingServerNumbers = await Server.find().distinct('serverNumber');
        const activeTeamsCount = await getActiveTeamsCount();
        res.render('Server', {
            title: 'Add Server',
            securityCode: req.session.securityCode,
            server: {},
            existingServerNumbers: JSON.stringify(existingServerNumbers),
            activeTeamsCount: activeTeamsCount
        });
    } else {
        res.render('access-denied', {
            title: 'Access Denied'
        });
    }
});

// Add Server Form Submission
router.post('/add', async (req, res) => {
    try {
        // console.log("Session code:", req.session.securityCode);
        // console.log("Env code:", process.env.SECURITY_CODE);

        // Check against session + env
        if (!req.session.securityCode || req.session.securityCode !== process.env.SECURITY_CODE) {
            const existingServerNumbers = await Server.find().distinct('serverNumber');
            const activeTeamsCount = await getActiveTeamsCount();
            return res.render('Server', {
                title: 'Add Server',
                server: req.body,
                error: 'Access denied: Invalid or missing security code.',
                existingServerNumbers: JSON.stringify(existingServerNumbers),
                activeTeamsCount: activeTeamsCount
            });
        }

        const normalizeToArray = (value) => {
            if (Array.isArray(value)) {
                return value.map(v => String(v).trim()).filter(v => v);
            }
            if (typeof value === 'string') {
                return value
                    .split(',')
                    .map(v => v.trim())
                    .filter(v => v);
            }
            return [];
        };

        const serverData = {
            ...req.body,
            serverNumber: Number.parseInt(req.body.serverNumber, 10),
            team: normalizeToArray(req.body.team),
            allocatedDomain: normalizeToArray(req.body.allocatedDomain)
        };

        // Pre-check uniqueness to provide clearer error instead of relying on Mongo duplicate error
        if (Number.isNaN(serverData.serverNumber)) {
            const existingServerNumbers = await Server.find().distinct('serverNumber');
            const activeTeamsCount = await getActiveTeamsCount();
            return res.render('Server', {
                title: 'Add Server',
                server: req.body,
                error: 'Server number is invalid.',
                existingServerNumbers: JSON.stringify(existingServerNumbers),
                activeTeamsCount: activeTeamsCount
            });
        }
        const numberExists = await Server.exists({ serverNumber: serverData.serverNumber });
        if (numberExists) {
            const existingServerNumbers = await Server.find().distinct('serverNumber');
            const activeTeamsCount = await getActiveTeamsCount();
            return res.render('Server', {
                title: 'Add Server',
                server: req.body,
                error: 'A server with this server number already exists.',
                existingServerNumbers: JSON.stringify(existingServerNumbers),
                activeTeamsCount: activeTeamsCount
            });
        }

        const server = new Server(serverData);
        await server.save();

        // Clear code after successful add (optional)
        delete req.session.securityCode;

        res.redirect('/dashboard');
    } catch (err) {
        const existingServerNumbers = await Server.find().distinct('serverNumber');
        const activeTeamsCount = await getActiveTeamsCount();
        let errorMessage = 'Failed to add server.';
        if (err && err.code === 11000) {
            const field = Object.keys(err.keyValue || {})[0] || 'field';
            errorMessage = `Duplicate value for ${field}. A server with this ${field} already exists.`;
        } else if (err && err.name === 'ValidationError') {
            const messages = Object.values(err.errors || {}).map(e => e.message);
            errorMessage = messages.join(' ');
        } else if (err && typeof err.message === 'string') {
            errorMessage = err.message;
        }
        res.render('Server', {
            title: 'Add Server',
            server: req.body,
            error: errorMessage,
            existingServerNumbers: JSON.stringify(existingServerNumbers),
            activeTeamsCount: activeTeamsCount
        });
    }
});

// Edit Server Page
router.get('/edit/:id', async (req, res) => {
    try {
        const securityCode = req.query.code;
        if (securityCode === process.env.SECURITY_CODE) {
            req.session.securityCode = securityCode;
            const server = await Server.findById(req.params.id);
            const activeTeamsCount = await getActiveTeamsCount();

            res.render('Server', {
                title: 'Edit Server',
                securityCode: securityCode,
                server: server,
                activeTeamsCount: activeTeamsCount
            });
        } else {
            res.render('access-denied', {
                title: 'Access Denied'
            });
        }
    } catch (err) {
        res.redirect('/dashboard');
    }
});

// Edit Server Form Submission
router.post('/edit/:id', async (req, res) => {
    try {
        const normalizeToArray = (value) => {
            if (Array.isArray(value)) {
                return value.map(v => String(v).trim()).filter(v => v);
            }
            if (typeof value === 'string') {
                return value
                    .split(',')
                    .map(v => v.trim())
                    .filter(v => v);
            }
            return [];
        };

        const serverData = {
            ...req.body,
            serverNumber: Number.parseInt(req.body.serverNumber, 10),
            team: normalizeToArray(req.body.team),
            allocatedDomain: normalizeToArray(req.body.allocatedDomain)
        };
        await Server.findByIdAndUpdate(req.params.id, serverData);
        res.redirect('/dashboard');
    } catch (err) {
        const server = await Server.findById(req.params.id);
        const activeTeamsCount = await getActiveTeamsCount();
        res.render('Server', {
            title: 'Edit Server',
            server: req.body,
            error: err.message,
            activeTeamsCount: activeTeamsCount
        });
    }
});


// Delete Server
router.post('/delete/:id', async (req, res) => {
    try {
        if (req.body.code === process.env.SECURITY_CODE) {
            await Server.findByIdAndDelete(req.params.id);
            res.redirect('/dashboard');
        } else {
            res.render('access-denied', {
                title: 'Access Denied'
            });
        }
    } catch (err) {
        console.error(`Failed to delete server ${req.params.id}:`, err);
        res.redirect('/dashboard?error=delete_failed'); // Redirect with an error flag
    }
});

module.exports = router;
