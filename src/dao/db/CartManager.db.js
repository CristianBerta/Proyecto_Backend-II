import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import mongoose from 'mongoose';

class CartManagerDB {
    async getCarts() {
        try {
            const carts = await Cart.find().populate('products.product').lean();
            return carts;
        } catch (error) {
            console.error('Error al obtener carritos:', error);
            throw error;
        }
    }

    async getCartById(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('El ID del carrito no es válido');
            }

            const cart = await Cart.findById(id).populate('products.product').lean();
            //
            if (!cart) return null;
            let totalItems = 0;
            let totalPrice = 0;

            cart.products.forEach(item => {
                if (item.product && item.product.price) {
                    totalItems += item.quantity;
                    totalPrice += item.product.price * item.quantity;
                }
            });

            cart.totalItems = totalItems;
            cart.totalPrice = totalPrice;
            
            return cart;
        } catch (error) {
            console.error(`Error al obtener carrito con id ${id}:`, error);
            return null;
        }
    }

    async createCart() {
        try {
            const newCart = new Cart({ products: [] });
            await newCart.save();
            return newCart;
        } catch (error) {
            console.error('Error al crear carrito:', error);
            throw error;
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error(`Producto con id ${productId} no encontrado`);
            }
            const cart = await Cart.findById(cartId);
            if (!cart) return null;

            const productIndex = cart.products.findIndex(
                (item) => item.product.toString() === productId.toString()
            );

            if (productIndex !== -1) {
                cart.products[productIndex].quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }

            await cart.save();
            return await this.getCartById(cartId);
        } catch (error) {
            console.error(`Error al agregar producto ${productId} al carrito ${cartId}:`, error);
            throw error;
        }
    }

    async updateCart(cartId, products) {
        try {
            for (const item of products) {
                const product = await Product.findById(item.product);
                if (!product) {
                    throw new Error(`Producto con id ${item.product} no encontrado`);
                }
            }

            const updatedCart = await Cart.findByIdAndUpdate(
                cartId,
                { products },
                { new: true }
            ).populate('products.product');

            if (!updatedCart) return null;
            return updatedCart;
        } catch (error) {
            console.error(`Error al actualizar carrito ${cartId}:`, error);
            throw error;
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            if (quantity <= 0) {
                throw new Error('La cantidad debe ser mayor a 0');
            }

            const cart = await Cart.findById(cartId);
            if (!cart) return null;

            const productIndex = cart.products.findIndex(
                (item) => item.product.toString() === productId.toString()
            );

            if (productIndex === -1) {
                throw new Error(`Producto con id ${productId} no encontrado en el carrito`);
            }

            cart.products[productIndex].quantity = quantity;
            await cart.save();
            return await this.getCartById(cartId);
        } catch (error) {
            console.error(`Error al actualizar cantidad del producto ${productId} en el carrito ${cartId}:`, error);
            throw error;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const result = await Cart.findByIdAndUpdate(
                cartId,
                { $pull: { products: { product: productId } } },
                { new: true }
            ).populate('products.product');

            if (!result) return null;
            return result;
        } catch (error) {
            console.error(`Error al eliminar producto ${productId} del carrito ${cartId}:`, error);
            throw error;
        }
    }

    async clearCart(cartId) {
        try {
            const result = await Cart.findByIdAndUpdate(
                cartId,
                { products: [] },
                { new: true }
            );

            if (!result) return null;
            return result;
        } catch (error) {
            console.error(`Error al vaciar el carrito ${cartId}:`, error);
            throw error;
        }
    }
}

export default CartManagerDB;