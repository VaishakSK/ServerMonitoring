const express = require('express');
const router = express.Router();
const Server = require('../models/server');

// Add Server Page
router.get('/add', (req, res) => {
    const securityCode = req.query.code;
    // console.log("Query param (decoded):", securityCode); // 👈 should print server@kle

    // Save to session if matches
    if (securityCode === process.env.SECURITY_CODE) {
        req.session.securityCode = securityCode;
    }

    res.render('Server', {
        title: 'Add Server',
        securityCode: req.session.securityCode,
        server: {}
    });
});

// Add Server Form Submission
router.post('/add', async (req, res) => {
    try {
        // console.log("Session code:", req.session.securityCode);
        // console.log("Env code:", process.env.SECURITY_CODE);

        // Check against session + env
        if (!req.session.securityCode || req.session.securityCode !== process.env.SECURITY_CODE) {
            return res.render('Server', {
                title: 'Add Server',
                server: req.body,
                error: 'Access denied: Invalid or missing security code.'
            });
        }

        const server = new Server(req.body);
        await server.save();

        // Clear code after successful add (optional)
        delete req.session.securityCode;

        res.redirect('/dashboard');
    } catch (err) {
        res.render('Server', {
            title: 'Add Server',
            server: req.body,
            error: err.message
        });
    }
});

// Edit Server Page
router.get('/edit/:id', async (req, res) => {
    try {
        const server = await Server.findById(req.params.id);
        const securityCode = req.query.code;
        res.render('Server', {
            title: 'Edit Server',
            securityCode: securityCode,
            server: server
        });
    } catch (err) {
        res.redirect('/dashboard');
    }
});

// Edit Server Form Submission
router.post('/edit/:id', async (req, res) => {
    try {
        await Server.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/dashboard');
    } catch (err) {
        res.render('Server', {
            title: 'Edit Server',
            server: req.body,
            error: err.message
        });
    }
});

// Delete Server
router.post('/delete/:id', async (req, res) => {
    try {
        await Server.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(`Failed to delete server ${req.params.id}:`, err);
        res.redirect('/dashboard?error=delete_failed'); // Redirect with an error flag
    }
});

module.exports = router;
