import { Router } from "express";
import CartManagerDB from "../dao/db/CartManager.db.js";
import UserManagerDB from "../dao/db/UserManager.db.js";
import mongoose from "mongoose";
import { isAuthenticated } from "../middlewares/auth.js";

const cartsRouter = Router();
const CM = new CartManagerDB();
const UM = new UserManagerDB();

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

cartsRouter.post("/", isAuthenticated, async (req, res) => {
    try {
        const newCart = await CM.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        console.error("Error al crear el carrito:", error);
        res.status(500).json({ error: "Error al crear el carrito" });
    }
});

// Obtener todos los carritos
cartsRouter.get("/user/cart", isAuthenticated, async (req, res) => {
    try {
        const user = await UM.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        if (!user.cart) {
            return res.status(404).json({ error: "No tienes un carrito asociado a la cuenta" });
        }

        const cart = await CM.getCartById(user.cart.toString());
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
        const cart = await CM.getCartById(cartId);
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


//Agregar producto
// cartsRouter.post("/:cid/product/:pid", isAuthenticated, async (req, res) => {
//     try {
//         const cartId = req.params.cid;
//         console.log("agregar al carrito ", cartId);
//         const productId = req.params.pid;
//         const cart = await CM.addProductToCart(cartId, productId);
//         if (cart) {
//             res.json(cart);
//         } else {
//             res.status(404).json({ error: "Carrito no encontrado" });
//         }
//     } catch (error) {
//         console.error("Error al agregar producto al carrito:", error);
//         res.status(500).json({ error: "Error al agregar producto al carrito" });
//     }
// });
// Add a new route that uses the user's cart automatically
cartsRouter.post("/user/product/:pid", isAuthenticated, validateId, async (req, res) => {
    try {
        const productId = req.params.pid;
        const user = await UM.getUserById(req.user.id);
        
        if (!user.cart) {
            return res.status(404).json({ error: "No tienes un carrito asociado a la cuenta" });
        }
        
        const cartId = user.cart._id.toString();
        console.log(cartId);
        const cart = await CM.addProductToCart(cartId, productId);
        
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

cartsRouter.delete("/:cid/products/:pid", isAuthenticated, validateId, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        
        const updatedCart = await CM.removeProductFromCart(cartId, productId);
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
        
        const updatedCart = await CM.updateCart(cartId, products);
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

cartsRouter.put("/:cid/products/:pid", isAuthenticated, validateId, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const { quantity } = req.body;
        
        if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
            return res.status(400).json({ 
                error: "La cantidad debe ser un número entero mayor a 0" 
            });
        }
        
        const updatedCart = await CM.updateProductQuantity(cartId, productId, quantity);
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

cartsRouter.delete("/:cid", isAuthenticated, validateId, async (req, res) => {
    try {
        const cartId = req.params.cid;
        
        const emptyCart = await CM.clearCart(cartId);
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