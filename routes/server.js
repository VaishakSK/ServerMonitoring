const express = require('express');
const router = express.Router();
const Server = require('../models/server');

// Add Server Page
router.get('/add', (req, res) => {
    res.render('Server', {
        title: 'Add Server',
        server: {}
    });
});

// Add Server Form Submission
router.post('/add', async (req, res) => {
    try {
        const server = new Server(req.body);
        await server.save();
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
        res.render('Server', {
            title: 'Edit Server',
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
