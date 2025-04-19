import { Router } from "express";
import ProductManagerDB from "../dao/db/ProductManager.db.js";
import CartManagerDB from "../dao/db/CartManager.db.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = Router();
const PM = new ProductManagerDB();
const CM = new CartManagerDB();

// Public routes
router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/register", (req, res) => {
    res.render("register");
});

// Home route - Showing products with pagination
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
        
        const result = await PM.getProducts(options);
        
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
            user: req.user // Pass user data if available
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
        res.status(500).send("Error al cargar productos");
    }
});

// Protected routes
router.get("/profile", isAuthenticated, (req, res) => {
    res.render("profile", { user: req.user });
});

// RealTime products - Protected
router.get("/realtimeproducts", isAuthenticated, (req, res) => {
    res.render("realTimeProducts", { user: req.user });
});

// User's cart - Protected 
router.get("/carts", isAuthenticated, async (req, res) => {
    try {
        // If user has a cart in their profile, use that cart ID
        let cartId;
        
        if (req.user && req.user.cart) {
            cartId = req.user.cart;
        } else {
            // Fallback to getting the first cart if no user cart exists
            const carts = await CM.getCarts();
            if (carts && carts.length > 0) {
                cartId = carts[0]._id;
            } else {
                return res.status(404).render("error", { 
                    message: "No hay carritos disponibles"
                });
            }
        }
        
        const cart = await CM.getCartById(cartId);
        
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

// Specific cart by ID - Protected
router.get("/carts/:cid", isAuthenticated, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await CM.getCartById(cartId);
        
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

export default router;