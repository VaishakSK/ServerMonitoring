const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email or username already exists'
            });
        }

        // Create new user
        const newUser = new User({
            name,
            email,
            username,
            password
        });

        // Save user (password will be automatically hashed by the pre-save middleware)
        await newUser.save();

        // Return user without password
        const userResponse = newUser.toJSON();

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to register user',
            error: error.message
        });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username and include password for comparison
        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username or password'
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username or password'
            });
        }

        // Return user without password
        const userResponse = user.toJSON();

        res.status(200).json({
            status: 'success',
            message: 'User logged in successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to login',
            error: error.message
        });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    try {
        // For now, just return a success message
        // In a real application, you would invalidate JWT tokens or clear sessions
        res.status(200).json({
            status: 'success',
            message: 'User logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to logout',
            error: error.message
        });
    }
});

// Get all users (for testing purposes)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json({
            status: 'success',
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get users',
            error: error.message
        });
    }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            user: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get user',
            error: error.message
        });
    }
});

module.exports = router;
