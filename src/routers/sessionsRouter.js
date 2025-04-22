import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import UserManagerDB from "../dao/db/UserManager.db.js";

const router = Router();
const userManager = new UserManagerDB();

//Registro
router.post("/register",
    passport.authenticate('register', { failureRedirect: '/register', session: false }),
    async (req, res) => {
        res.status(201).json({ status: "success", message: "Usuario registrado" });
    }
);

//Login
router.post("/login",
    passport.authenticate('login', { session: false }),
    async (req, res) => {
        //JWT token
        const token = jwt.sign(
            { id: req.user._id, email: req.user.email, role: req.user.role, cart: req.user.cart ? req.user.cart.toString() : null },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        //Token a cookie
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });

        res.json({
            status: "success",
            message: "Login successful",
            token,
            user: {
                name: `${req.user.first_name} ${req.user.last_name}`,
                email: req.user.email,
                role: req.user.role,
                cart: req.user.cart ? req.user.cart.toString() : null
            }
        });
    }
);

//Logout
router.post("/logout", (req, res) => {
    res.clearCookie('jwt');
    res.json({ status: "success", message: "Logout successful" });
});

//Current
router.get("/current",
    passport.authenticate('current', { session: false }),
    (req, res) => {
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