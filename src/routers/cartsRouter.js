import { Router } from "express";
import CartService from "../services/cart.service.js";
import UserService from "../services/user.service.js";
import mongoose from "mongoose";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const cartsRouter = Router();
const CS = new CartService();
const US = new UserService();

// Validación de ID como middleware
const validateId = (req, res, next) => {
    const cartId = req.params.cid;
    if (cartId && !mongoose.Types.ObjectId.isValid(cartId)) {
        return res.status(400).json({ error: "ID de carrito inválido" });
    }
    
    const productId = req.params.pid;
    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "ID de producto inválido" });
    }
    
    next();
};

//Crear carrito
cartsRouter.post("/", isAuthenticated, async (req, res) => {
    try {
        const newCart = await CS.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        console.error("Error al crear el carrito:", error);
        res.status(500).json({ error: "Error al crear el carrito" });
    }
});

//Obtener todos los carritos
cartsRouter.get("/user/cart", isAuthenticated, async (req, res) => {
    try {
        const user = await US.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        if (!user.cart) {
            return res.status(404).json({ error: "No tienes un carrito asociado a la cuenta" });
        }

        const cart = await CS.getCartById(user.cart.toString());
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener los carritos:", error);
        res.status(500).json({ error: "Error al obtener los carritos" });
    }
});

// Obtener carrito por ID
cartsRouter.get("/:cid", isAuthenticated, validateId, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await CS.getCartById(cartId);
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ error: "Error al obtener el carrito" });
    }
});

//Agregar producto al carrito
cartsRouter.post("/user/product/:pid", isAuthenticated, authorizeRoles(['user']), validateId, async (req, res) => {
    try {
        const productId = req.params.pid;
        const user = await US.getUserById(req.user.id);

        if (!user.cart) {
            return res.status(404).json({ error: "No tienes un carrito asociado a la cuenta" });
        }
        
        const cartId = user.cart._id.toString();
        const cart = await CS.addProductToCart(cartId, productId);
        
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al agregar producto al carrito:", error);
        res.status(500).json({ error: "Error al agregar producto al carrito" });
    }
});

//Eliminar producto del carrito
cartsRouter.delete("/:cid/products/:pid", isAuthenticated, authorizeRoles(['user']), validateId, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        if (req.user.role === 'user' && (!req.user.cart || req.user.cart.toString() !== cartId)) {
            return res.status(403).json({ status: "error", message: "Acceso Denegado - No puedes modificar este carrito." });
        }
        
        const updatedCart = await CS.removeProductFromCart(cartId, productId);
        if (updatedCart) {
            res.json({ 
                status: "success", 
                message: "Producto eliminado del carrito",
                cart: updatedCart 
            });
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar producto del carrito:", error);
        res.status(500).json({ error: "Error al eliminar producto del carrito" });
    }
});

//Actualizar carrito
cartsRouter.put("/:cid", isAuthenticated, validateId, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const { products } = req.body;
        
        if (!Array.isArray(products)) {
            return res.status(400).json({ error: "El campo 'products' debe ser un arreglo" });
        }
        
        for (const item of products) {
            if (!item.product || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ 
                    error: "Cada producto debe tener 'product' (id) y 'quantity' (mayor a 0)" 
                });
            }
        }
        
        const updatedCart = await CS.updateCart(cartId, products);
        if (updatedCart) {
            res.json({ 
                status: "success", 
                message: "Carrito actualizado",
                cart: updatedCart 
            });
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al actualizar el carrito:", error);
        res.status(500).json({ error: "Error al actualizar el carrito" });
    }
});

//Actualizar cantidad de productos
cartsRouter.put("/:cid/products/:pid", isAuthenticated, authorizeRoles(['user']), validateId, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const { quantity } = req.body;

        if (req.user.role === 'user' && (!req.user.cart || req.user.cart.toString() !== cartId)) {
            return res.status(403).json({ status: "error", message: "Acceso Denegado - No puedes modificar este carrito." });
        }
        
        if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
            return res.status(400).json({ 
                error: "La cantidad debe ser un número entero mayor a 0" 
            });
        }
        
        const updatedCart = await CS.updateProductQuantity(cartId, productId, quantity);
        if (updatedCart) {
            res.json({ 
                status: "success", 
                message: "Cantidad de producto actualizada",
                cart: updatedCart 
            });
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al actualizar cantidad de producto:", error);
        res.status(500).json({ error: "Error al actualizar cantidad de producto" });
    }
});

//Vaciar carrito
cartsRouter.delete("/:cid", isAuthenticated, authorizeRoles(['user']), validateId, async (req, res) => {
    try {
        const cartId = req.params.cid;

        if (req.user.role === 'user' && (!req.user.cart || req.user.cart.toString() !== cartId)) {
            return res.status(403).json({ status: "error", message: "Acceso Denegado - No puedes modificar este carrito." });
        }
        
        const emptyCart = await CS.clearCart(cartId);
        if (emptyCart) {
            res.json({ 
                status: "success", 
                message: "Todos los productos han sido eliminados del carrito",
                cart: emptyCart 
            });
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al vaciar el carrito:", error);
        res.status(500).json({ error: "Error al vaciar el carrito" });
    }
});

export default cartsRouter;