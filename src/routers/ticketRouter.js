import { Router } from "express";
import TicketService from "../services/ticket.service.js";
import UserService from "../services/user.service.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
import mongoose from "mongoose";

const ticketRouter = Router();
const TS = new TicketService();
const US = new UserService();

// Validación de ID como middleware
const validateId = (req, res, next) => {
    const ticketId = req.params.tid;
    if (ticketId && !mongoose.Types.ObjectId.isValid(ticketId)) {
        return res.status(400).json({ error: "ID de ticket inválido" });
    }
    
    next();
};

// Procesar compra del carrito del usuario
ticketRouter.post("/process", isAuthenticated, authorizeRoles(['user']), async (req, res) => {
    try {
        const user = await US.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        if (!user.cart) {
            return res.status(404).json({ error: "No tienes un carrito asociado a la cuenta" });
        }

        const cartId = user.cart.toString();
        const result = await TS.processTicket(cartId, user.email);
        
        if (result.status === 'completed') {
            res.status(200).json({
                status: "success",
                message: "Compra completada exitosamente",
                data: result
            });
        } else if (result.status === 'incomplete') {
            res.status(206).json({
                status: "partial",
                message: "Compra completada parcialmente. Algunos productos no pudieron procesarse.",
                data: result
            });
        } else {
            res.status(400).json({
                status: "error",
                message: "No se pudo procesar ningún producto de la compra",
                data: result
            });
        }
    } catch (error) {
        console.error("Error al procesar la compra:", error);
        res.status(500).json({ error: `Error al procesar la compra: ${error.message}` });
    }
});

// Obtener historial de compras del usuario
ticketRouter.get("/history", isAuthenticated, authorizeRoles(['user', 'admin']), async (req, res) => {
    try {
        const tickets = await TS.getTicketsByUser(req.user.email);
        
        res.json({
            status: "success",
            data: tickets
        });
    } catch (error) {
        console.error("Error al obtener historial de compras:", error);
        res.status(500).json({ error: `Error al obtener historial de compras: ${error.message}` });
    }
});

// Obtener detalle de un ticket específico
ticketRouter.get("/:tid", isAuthenticated, validateId, async (req, res) => {
    try {
        const ticketId = req.params.tid;
        const ticket = await TS.getTicketById(ticketId);
        
        // Si es un usuario normal, verificar que el ticket le pertenezca
        if (req.user.role === 'user' && ticket.purchaser !== req.user.email) {
            return res.status(403).json({ 
                status: "error", 
                message: "No tienes permiso para ver este ticket" 
            });
        }
        
        res.json({
            status: "success",
            data: ticket
        });
    } catch (error) {
        console.error("Error al obtener detalle del ticket:", error);
        res.status(500).json({ error: `Error al obtener detalle del ticket: ${error.message}` });
    }
});

// Obtener todos los tickets (solo para admin)
ticketRouter.get("/admin/tickets", isAuthenticated, authorizeRoles(['admin']), async (req, res) => {
    try {
        const tickets = await TS.getAllTickets();
        
        res.json({
            status: "success",
            data: tickets
        });
    } catch (error) {
        console.error("Error al obtener todos los tickets:", error);
        res.status(500).json({ error: `Error al obtener todos los tickets: ${error.message}` });
    }
});

export default ticketRouter;