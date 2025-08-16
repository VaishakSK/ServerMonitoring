require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const hbs = require('hbs');
const path = require('path');

const app = express();
const port = 6161;

// Import routes
const authRoutes = require('./routes/AuthRoutes');
const serverRoutes = require('./routes/server');
const homeRoutes = require('./routes/home');
const dashboardRoutes = require('./routes/dashboard');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine to handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Configure MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://vaishak123:vaishaksk@usercredentials.ljwcsrd.mongodb.net/?retryWrites=true&w=majority&appName=userCredentials', {
});

const db = mongoose.connection;

// MongoDB connection event handlers
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.once('open', () => {
    console.log('MongoDB connected successfully');
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
// Start the server
app.listen(port, () => {
    console.log(`Server running: http://localhost:${port}`);
});