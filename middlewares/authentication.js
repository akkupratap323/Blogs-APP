const { verifyToken } = require('../services/authentication');

function authenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenval = req.cookies[cookieName];

        // If token is missing, send 401 and stop execution
        if (!tokenval) {
            return next();
        }

        try {
            // Verify the token
            const userpayload = verifyToken(tokenval);

            // If token is invalid, send 401 and stop execution
            if (!userpayload) {
                return res.status(401).send("Unauthorized");
            }

            // Attach the user payload to the request object for use in subsequent middleware/routes
            req.user = userpayload;

            // Call next() to proceed to the next middleware/route handler
            return next();
        } catch (err) {
            // Log the error and pass it to the error-handling middleware
            console.log(err);
            next(err);
        }
    };
}

module.exports = {
    authenticationCookie,
};