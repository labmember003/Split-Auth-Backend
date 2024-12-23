// Required dependencies to be installed:
// npm install express jsonwebtoken google-auth-library dotenv cors

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Environment variables required:
// GOOGLE_CLIENT_ID=your-google-client-id
// JWT_SECRET=your-jwt-secret
// PORT=3000 (or any port you prefer)

// Verify Google token and create JWT
async function verifyGoogleToken(token) {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        // Extract relevant user information
        return {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            email_verified: payload.email_verified
        };
    } catch (error) {
        throw new Error('Invalid Google token');
    }
}

// Create JWT token
function createJwtToken(user) {
    return jwt.sign(
        user,
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

// Auth endpoint
app.post('/auth/google', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        // Verify Google token
        const userData = await verifyGoogleToken(token);

        if (!userData.email_verified) {
            return res.status(403).json({
                success: false,
                message: 'Email not verified with Google'
            });
        }

        // Create JWT token
        const jwtToken = createJwtToken(userData);

        res.json({
            success: true,
            token: jwtToken,
            user: userData
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message || 'Authentication failed'
        });
    }
});

// Middleware to verify JWT token (for protected routes)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token is required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
}

// Example protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Access granted',
        user: req.user
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});