import { Router } from "express";
import CartManagerDB from "../dao/db/CartManager.db.js";
import mongoose from "mongoose";

const cartsRouter = Router();
const CM = new CartManagerDB();

cartsRouter.post("/", async (req, res) => {
    try {
        const newCart = await CM.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        console.error("Error al crear el carrito:", error);
        res.status(500).json({ error: "Error al crear el carrito" });
    }
});

cartsRouter.get("/carts", async (req, res) => {
    try {
        const cart = await CM.getCarts();
        if (cart) {
            res.send(cart);
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ error: "Error al obtener el carrito" });
    }
});

cartsRouter.post("/:cid/product/:pid", async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
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

cartsRouter.delete("/:cid/products/:pid", async (req, res) => {
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

cartsRouter.put("/:cid", async (req, res) => {
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

cartsRouter.put("/:cid/products/:pid", async (req, res) => {
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

cartsRouter.delete("/:cid", async (req, res) => {
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