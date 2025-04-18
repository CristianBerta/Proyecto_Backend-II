import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import UserModel from "../dao/models/user.model.js";

const sessionsRouter = Router();

//Registro
sessionsRouter.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        const exists = await UserModel.findOne({ email });
        if (exists) return res.status(400).json({ message: "El usuario ya existe" });

        const newUser = new UserModel({ first_name, last_name, email, age, password });
        await newUser.save();

        res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al registrar usuario", error });
    }
});

//Login
sessionsRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

        const isValid = await user.comparePassword(password);
        if (!isValid) return res.status(401).json({ message: "Contraseña incorrecta" });

        const token = jwt.sign({ user: { id: user._id, role: user.role } }, "jwtSecret", {
            expiresIn: "1h",
        });

        res.status(200).json({ message: "Login exitoso", token });
    } catch (error) {
        res.status(500).json({ message: "Error al loguear usuario", error });
    }
});

//Current
sessionsRouter.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        res.json({ user: req.user });
    }
);

export default sessionsRouter;