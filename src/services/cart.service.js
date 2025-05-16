import CartRepository from '../repositories/Cart.Repository.js';
import ProductRepository from '../repositories/Product.Repository.js';
import mongoose from 'mongoose';

class CartService {
    constructor() {
        this.cartRepository = new CartRepository();
        this.productRepository = new ProductRepository();
    }

    async getAllCarts() {
        try {
            return await this.cartRepository.getCarts();
        } catch (error) {
            throw new Error(`Error en el servicio al obtener todos los carritos: ${error.message}`);
        }
    }

    async getCartById(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('El ID del carrito no es válido');
            }

            const cart = await this.cartRepository.getCartById(id);
            if (!cart) {
                throw new Error(`Carrito con ID ${id} no encontrado`);
            }
            return cart;
        } catch (error) {
            throw new Error(`Error en el servicio al obtener carrito por ID: ${error.message}`);
        }
    }

    async createCart() {
        try {
            return await this.cartRepository.createCart();
        } catch (error) {
            throw new Error(`Error en el servicio al crear carrito: ${error.message}`);
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('El ID del carrito no es válido');
            }

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error('El ID del producto no es válido');
            }

            const product = await this.productRepository.getProductById(productId);
            if (!product) {
                throw new Error(`Producto con ID ${productId} no encontrado`);
            }

            const cart = await this.cartRepository.getCartById(cartId);
            if (!cart) {
                throw new Error(`Carrito con ID ${cartId} no encontrado`);
            }

            if (product.stock <= 0) {
                throw new Error(`El producto ${product.title} no tiene stock disponible`);
            }

            const existingProduct = cart.products.find(item => 
                item.product._id.toString() === productId.toString()
            );
            
            if (existingProduct && existingProduct.quantity >= product.stock) {
                throw new Error(`No hay suficiente stock del producto ${product.title}`);
            }

            return await this.cartRepository.addProductToCart(cartId, productId);
        } catch (error) {
            throw new Error(`Error en el servicio al agregar producto al carrito: ${error.message}`);
        }
    }

    async updateCart(cartId, products) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('El ID del carrito no es válido');
            }

            if (!Array.isArray(products)) {
                throw new Error("El formato de productos no es válido, debe ser un array");
            }

            for (const item of products) {
                if (!item.product || !item.quantity || item.quantity <= 0) {
                    throw new Error("Cada producto debe tener 'product' (id) y 'quantity' (mayor a 0)");
                }

                if (!mongoose.Types.ObjectId.isValid(item.product)) {
                    throw new Error(`El ID del producto ${item.product} no es válido`);
                }

                const product = await this.productRepository.getProductById(item.product);
                if (!product) {
                    throw new Error(`Producto con ID ${item.product} no encontrado`);
                }

                if (item.quantity > product.stock) {
                    throw new Error(`No hay suficiente stock del producto ${product.title}`);
                }
            }

            return await this.cartRepository.updateCart(cartId, products);
        } catch (error) {
            throw new Error(`Error en el servicio al actualizar carrito: ${error.message}`);
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('El ID del carrito no es válido');
            }

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error('El ID del producto no es válido');
            }

            if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
                throw new Error('La cantidad debe ser un número entero mayor a 0');
            }

            const product = await this.productRepository.getProductById(productId);
            if (!product) {
                throw new Error(`Producto con ID ${productId} no encontrado`);
            }

            if (quantity > product.stock) {
                throw new Error(`No hay suficiente stock del producto ${product.title}`);
            }

            return await this.cartRepository.updateProductQuantity(cartId, productId, quantity);
        } catch (error) {
            throw new Error(`Error en el servicio al actualizar cantidad de producto: ${error.message}`);
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('El ID del carrito no es válido');
            }

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error('El ID del producto no es válido');
            }

            const cart = await this.cartRepository.getCartById(cartId);
            if (!cart) {
                throw new Error(`Carrito con ID ${cartId} no encontrado`);
            }

            const productInCart = cart.products.some(item => 
                item.product._id.toString() === productId.toString()
            );
            
            if (!productInCart) {
                throw new Error(`Producto con ID ${productId} no encontrado en el carrito`);
            }

            return await this.cartRepository.removeProductFromCart(cartId, productId);
        } catch (error) {
            throw new Error(`Error en el servicio al eliminar producto del carrito: ${error.message}`);
        }
    }

    async clearCart(cartId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('El ID del carrito no es válido');
            }

            const cart = await this.cartRepository.getCartById(cartId);
            if (!cart) {
                throw new Error(`Carrito con ID ${cartId} no encontrado`);
            }

            return await this.cartRepository.clearCart(cartId);
        } catch (error) {
            throw new Error(`Error en el servicio al vaciar el carrito: ${error.message}`);
        }
    }
}

export default CartService;