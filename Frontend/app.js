require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const hbs = require('hbs');
const path = require('path');

const app = express();
const port = 7171;

// Import routes
const authRoutes = require('./routes/AuthRoutes');
const serverRoutes = require('./routes/server');
const homeRoutes = require('./routes/home');
const dashboardRoutes = require('./routes/dashboard');
const { requireSecurityCode } = require('./middleware/security');

// Middlewar
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine to handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname,  'views'));

hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

// Serve static files
app.use(express.static(path.join(__dirname,  'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Configure MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://vaishak123:vaishaksk@usercredentials.ljwcsrd.mongodb.net/?retryWrites=true&w=majority&appName=userCredentials')
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
app.use('/server', requireSecurityCode, serverRoutes);
app.use('/', dashboardRoutes);
