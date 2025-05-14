import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import UserDTO from "../dto/UserDTO.js";

const router = Router();

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
        if (!req.user){
            return res.status(401).json({ status: "error", message: "Usuario no autenticado." });
        }
        
        const userToDisplay = new UserDTO(req.user);
        res.json({ status: "success", user: userToDisplay });
    }
);

export default router;