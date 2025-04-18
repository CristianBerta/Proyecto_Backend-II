import { Router } from "express";
import ProductManagerDB from "../dao/db/ProductManager.db.js";
import CartManagerDB from "../dao/db/CartManager.db.js";

const router = Router();
const PM = new ProductManagerDB();
const CM = new CartManagerDB();

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
            }
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
        res.status(500).send("Error al cargar productos");
    }
});

router.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts");
});

router.get("/carts", async (req, res) => {
    try {
        const carts = await CM.getCarts();
        const cart = await CM.getCartById(carts[0]._id);
        
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
            isEmpty: cart.products.length === 0
        });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).render("error", { 
            message: "Error al cargar el carrito" 
        });
    }
});

export default router;