const requireSecurityCode = (req, res, next) => {
    // Get code from query parameters (for GET requests) or body (for POST requests)
    const securityCode = req.query.code ?? req.body.code;
    const secretKey = process.env.SERVER_MANAGEMENT_SECRET || 'server@kle';

    if (securityCode == null) { // Check for both null and undefined
        return res.status(401).render('access-denied', {
            message: 'A security code is required to perform this action.'
        });
    }

    if (securityCode !== secretKey) {
        return res.status(403).render('access-denied', {
            message: 'The security code you entered is invalid. Please try again.'
        });
    }

    // If the code is valid, proceed to the next middleware or route handler
    next();
};

module.exports = { requireSecurityCode };