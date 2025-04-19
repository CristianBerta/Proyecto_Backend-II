// src/routers/sessionsRouter.js
import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import UserManagerDB from "../dao/db/UserManager.db.js";

const router = Router();
const userManager = new UserManagerDB();

// Register endpoint
router.post("/register",
    passport.authenticate('register', { failureRedirect: '/register', session: false }),
    async (req, res) => {
        res.status(201).json({ status: "success", message: "User registered" });
    }
);

// Login endpoint
router.post("/login",
    passport.authenticate('login', { session: false }),
    async (req, res) => {
        // Generate JWT token
        const token = jwt.sign(
            { id: req.user._id, email: req.user.email, role: req.user.role },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        // Send token in cookie
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour

        res.json({
            status: "success",
            message: "Login successful",
            token,
            user: {
                name: `${req.user.first_name} ${req.user.last_name}`,
                email: req.user.email,
                role: req.user.role
            }
        });
    }
);

// Logout endpoint
router.post("/logout", (req, res) => {
    res.clearCookie('jwt');
    res.json({ status: "success", message: "Logout successful" });
});

// Current user endpoint
router.get("/current",
    passport.authenticate('current', { session: false }),
    (req, res) => {
        // Return user data without sensitive information
        const user = {
            id: req.user._id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age,
            cart: req.user.cart,
            role: req.user.role
        };

        res.json({ status: "success", user });
    }
);

export default router;