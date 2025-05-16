import { Router } from "express";
import ProductService from "../services/product.service.js";
import CartService from "../services/cart.service.js";
import UserService from "../services/user.service.js";
import TicketService from "../services/ticket.service.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = Router();
const PS = new ProductService();
const CS = new CartService();
const US = new UserService();
const TS = new TicketService();

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/register", (req, res) => {
    res.render("register");
});

//Paginacion
router.get("/", async (req, res) => {
    try {
        // Extraer parámetros
        const { limit = 10, page = 1, sort, category, status } = req.query;
        
        // Construir el objeto
        const filterQuery = {};
        
        if (category) {
            filterQuery.category = category;
        }
        
        if (status === "true" || status === "false") {
            filterQuery.status = status === "true";
        }

        // Obtener productos con filtros
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort,
            query: filterQuery
        };
        
        const result = await PS.getProducts(options);
        
        res.render("home", { 
            products: result.payload,
            pagination: {
                page: result.page,
                totalPages: result.totalPages,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.hasPrevPage ? `/?limit=${limit}&page=${result.page - 1}&sort=${sort}${category ? `&category=${category}` : ''}${status ? `&status=${status}` : ''}` : null,
                nextLink: result.hasNextPage ? `/?limit=${limit}&page=${result.page + 1}&sort=${sort}${category ? `&category=${category}` : ''}${status ? `&status=${status}` : ''}` : null
            },
            filters: {
                category,
                status,
                sort
            },
            user: req.user
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
        res.status(500).send("Error al cargar productos");
    }
});

//Rutas protegidas
router.get("/profile", isAuthenticated, (req, res) => {
    res.render("profile", { user: req.user });
});

router.get("/realtimeproducts", isAuthenticated, (req, res) => {
    res.render("realTimeProducts", { user: req.user });
});

router.get("/carts", isAuthenticated, async (req, res) => {
    try {
        if (!req.user || !req.user.cart) {
            console.log("Sin carrito:", req.user);
            return res.status(404).render("error", { 
                message: "No tienes un carrito asociado a tu cuenta"
            });
        }
        
        const cartId = req.user.cart;
        const cart = await CS.getCartById(cartId);
        
        if (!cart) {
            return res.status(404).render("error", { 
                message: "Carrito no encontrado" 
            });
        }

        res.render("cart", { 
            cartId: cart._id,
            products: cart.products,
            totalItems: cart.totalItems,
            totalPrice: cart.totalPrice,
            isEmpty: cart.products.length === 0,
            user: req.user
        });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).render("error", { 
            message: "Error al cargar el carrito" 
        });
    }
});

router.get("/carts/:cid", isAuthenticated, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await CS.getCartById(cartId);
        
        if (!cart) {
            return res.status(404).render("error", { 
                message: "Carrito no encontrado" 
            });
        }

        res.render("cart", { 
            cartId: cart._id,
            products: cart.products,
            totalItems: cart.totalItems,
            totalPrice: cart.totalPrice,
            isEmpty: cart.products.length === 0,
            user: req.user
        });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).render("error", { 
            message: "Error al cargar el carrito" 
        });
    }
});

//Ruta para mostrar formulario de recuperación de contraseña
router.get("/forgot-password", (req, res) => {
    res.render("forgotPassword");
});

//Ruta para mostrar formulario de reset de contraseña con token
router.get("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        await US.verifyResetToken(token);
        res.render("resetPassword");
    } catch (error) {
        res.render("error", { 
            message: "El enlace para restablecer la contraseña es inválido o ha expirado." 
        });
    }
});

//Historial de compras
router.get("/tickets/history", isAuthenticated, async (req, res) => {
    try {
        const tickets = await TS.getTicketsByUser(req.user.email);
        
        res.render("ticketHistory", {
            tickets,
            user: req.user
        });
    } catch (error) {
        console.error("Error al obtener historial de tickets:", error);
        res.render("error", { 
            error: "Error al cargar el historial de compras", 
            message: error.message 
        });
    }
});

//Detalle de un ticket
router.get("/tickets/:tid", isAuthenticated, async (req, res) => {
    try {
        const ticketId = req.params.tid;
        const ticket = await TS.getTicketById(ticketId);
        
        if (req.user.role !== 'admin' && ticket.purchaser !== req.user.email) {
            return res.status(403).render("error", { 
                error: "Acceso denegado", 
                message: "No tienes permiso para ver este ticket" 
            });
        }
        
        res.render("ticketDetail", {
            ticket,
            user: req.user
        });
    } catch (error) {
        console.error("Error al obtener detalle del ticket:", error);
        res.render("error", { 
            error: "Error al cargar los detalles del ticket", 
            message: error.message 
        });
    }
});

//Administracion para tickets (solo admin)
router.get("/admin/tickets", isAuthenticated, authorizeRoles(['admin']), async (req, res) => {
    try {
        const tickets = await TS.getAllTickets();
        
        res.render("tickets", {
            tickets,
            user: req.user
        });
    } catch (error) {
        console.error("Error al obtener todos los tickets:", error);
        res.render("error", { 
            error: "Error al cargar la administración de tickets", 
            message: error.message 
        });
    }
});

export default router;