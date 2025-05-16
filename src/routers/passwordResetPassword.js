import { Router } from "express";
import UserService from "../services/user.service.js";

const router = Router();
const userService = new UserService();

// Solicitar recuperación de contraseña
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: "error", message: "El email es requerido." });
        }

        await userService.requestPasswordReset(email);
        
        return res.status(200).json({ 
            status: "success", 
            message: "Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña." 
        });
    } catch (error) {
        console.error("Error en recuperación de contraseña:", error);
        return res.status(500).json({ status: "error", message: "Error interno del servidor." });
    }
});

// Verificar token de recuperación
router.get("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        await userService.verifyResetToken(token);
        
        return res.status(200).json({ status: "success", validToken: true });
    } catch (error) {
        return res.status(400).json({ 
            status: "error", 
            message: "El enlace para restablecer la contraseña es inválido o ha expirado."
        });
    }
});

// Restablecer contraseña
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ status: "error", message: "La contraseña es requerida." });
        }

        await userService.resetPassword(token, password);
        
        return res.status(200).json({ 
            status: "success", 
            message: "Contraseña restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña." 
        });
    } catch (error) {
        return res.status(400).json({ status: "error", message: error.message });
    }
});

export default router;