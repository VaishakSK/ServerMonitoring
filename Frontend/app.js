require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const hbs = require('hbs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 7887;

// Import routes
const authRoutes = require('./routes/AuthRoutes');
const serverRoutes = require('./routes/server');
const homeRoutes = require('./routes/home');
const dashboardRoutes = require('./routes/dashboard');
const { requireSecurityCode } = require('./middleware/security');

// Middlewar
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true, // Creates a session for every visitor, which is needed for the security check.
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        // Session expires after 1 week.
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// Route to render the monitoring page
app.get('/monitor', (req, res) => {
    const { ip, name } = req.query;
    if (!ip || !name) {
        return res.status(400).send('Server IP and Name are required.');
    }
    // Pass serverIp and serverName to the view
    res.render('monitor', { 
        serverIp: ip, 
        serverName: name,
        layout: false // Assuming you don't want the default layout
    });
});

// Proxy route to fetch metrics from the Windows Exporter
app.get('/api/metrics', async (req, res) => {
    const { ip } = req.query;
    if (!ip) {
        return res.status(400).json({ error: 'IP address is required' });
    }

    try {
        const metricsUrl = `http://${ip}:9182/metrics`;
        const response = await axios.get(metricsUrl, { timeout: 5000 });

        // Forward the metrics as plain text
        res.header('Content-Type', 'text/plain');
        res.send(response.data);
    } catch (error) {
        console.error(`Failed to fetch metrics from ${ip}:`, error.message, `(Code: ${error.code})`);
        
        let userMessage = `Could not connect to the server's metric endpoint (${ip}:9182).`;
        if (error.code === 'ECONNREFUSED') {
            userMessage += ' The connection was refused. Please ensure the Windows Exporter service is running and not blocked by a firewall.';
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            userMessage += ' The connection timed out. Please ensure the server is reachable and the port is not being silently dropped by a firewall.';
        } else {
            userMessage += ' An unknown error occurred.';
        }
        res.status(500).json({ error: 'Failed to fetch metrics from the target server.', details: userMessage });
    }
});

// Set view engine to handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

hbs.registerHelper('range', function (start, end) {
    const result = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
});

hbs.registerHelper('concat', function (a, b) {
    return a + b;
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Configure MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        // Start the server only after a successful connection
        app.listen(port, () => {
            console.log(`Server running: http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Could not connect to MongoDB. Please check your connection string and IP whitelist.', err);
        process.exit(1);
    });

const db = mongoose.connection;

// MongoDB connection event handler for errors after initial connection
db.on('error', (err) => {
    console.error('MongoDB runtime error:', err);
});

// Render the Auth view
app.get('/auth', (req, res) => {
    res.render('Auth');
});

// Use API routes
app.use('/', homeRoutes);
app.use('/api', authRoutes);
app.use('/server', serverRoutes);
app.use('/', dashboardRoutes);
