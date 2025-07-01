const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
//Hint: Use the session authorization feature
    if(!req.session.authorization) return res.status(401).json({message: "user not authenticated. please login first"});

    const token = req.session.authorization.accessToken;

    if(!token) return res.status(401).json({message: "access token not found. please log in again"});

    try {
        // Verify the JWT token using the same secret from auth_users.js
        const { verifyToken } = require('./router/auth_users.js');
        const decoded = verifyToken(token);
        
        // Add decoded user info to request object for use in protected routes
        req.user = decoded;
        
        // Proceed to the next middleware/route handler
        next();
    } catch (error) {
        return res.status(403).json({
            message:"invalid or expired token. please log in again",
            error : error.message
        });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
