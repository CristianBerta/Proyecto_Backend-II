import TicketRepository from '../repositories/Ticket.Repository.js';
import CartRepository from '../repositories/Cart.Repository.js';
import ProductRepository from '../repositories/Product.Repository.js';
import mongoose from 'mongoose';

class TicketService {
    constructor() {
        this.ticketRepository = new TicketRepository();
        this.cartRepository = new CartRepository();
        this.productRepository = new ProductRepository();
    }

    /**
     * Procesa la compra de productos en un carrito
     * @param {string} cartId - ID del carrito a procesar
     * @param {string} userEmail - Email del usuario que realiza la compra
     * @returns {Object} - Información del resultado de la compra
     */
    async processTicket(cartId, userEmail) {
        // Iniciar una sesión de transacción MongoDB
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('El ID del carrito no es válido');
            }

            // Obtener el carrito con sus productos
            const cart = await this.cartRepository.getCartById(cartId);
            if (!cart || !cart.products || cart.products.length === 0) {
                throw new Error('El carrito está vacío o no existe');
            }

            const productsToProcess = cart.products;
            const purchasedProducts = [];
            const failedProducts = [];
            let totalAmount = 0;

            // Procesar cada producto en el carrito
            for (const item of productsToProcess) {
                // Verificar si el producto existe y hay suficiente stock
                const productId = item.product._id.toString();
                const product = await this.productRepository.getProductById(productId);
                
                if (!product) {
                    failedProducts.push({
                        product: item.product._id,
                        title: item.product.title,
                        price: item.product.price,
                        quantity: item.quantity,
                        reason: 'Producto no encontrado'
                    });
                    continue;
                }

                if (product.stock < item.quantity) {
                    failedProducts.push({
                        product: product._id,
                        title: product.title,
                        price: product.price,
                        quantity: item.quantity,
                        reason: `Stock insuficiente. Disponible: ${product.stock}`
                    });
                    continue;
                }

                // Actualizar el stock del producto
                const newStock = product.stock - item.quantity;
                await this.productRepository.updateProduct(product._id, { stock: newStock }, { session });

                // Agregar a la lista de productos comprados
                purchasedProducts.push({
                    product: product._id,
                    title: product.title,
                    price: product.price,
                    quantity: item.quantity
                });

                // Sumar al total
                totalAmount += product.price * item.quantity;
            }

            // Determinar el estado de la compra
            const status = failedProducts.length === 0 
                ? 'completed' 
                : purchasedProducts.length === 0 
                    ? 'failed' 
                    : 'incomplete';

            // Crear el ticket
            const ticketData = {
                purchaser: userEmail,
                amount: totalAmount,
                products: purchasedProducts,
                status,
                failedProducts
            };
            
            const newTicket = await this.ticketRepository.createTicket(ticketData);

            // Actualizar el carrito: eliminar los productos comprados
            if (purchasedProducts.length > 0) {
                const productIdsToRemove = purchasedProducts.map(p => p.product.toString());
                
                const remainingProducts = cart.products.filter(item => 
                    !productIdsToRemove.includes(item.product._id.toString())
                );
                
                await this.cartRepository.updateCart(cartId, remainingProducts);
            }

            // Confirmar la transacción
            await session.commitTransaction();
            session.endSession();

            return {
                ticket: newTicket,
                purchasedProducts,
                failedProducts,
                status
            };
        } catch (error) {
            // Revertir la transacción en caso de error
            await session.abortTransaction();
            session.endSession();
            
            console.error('Error en el proceso de compra:', error);
            throw new Error(`Error al procesar la compra: ${error.message}`);
        }
    }

    /**
     * Obtiene un ticket por su ID
     * @param {string} ticketId - ID del ticket
     * @returns {Object} - Ticket encontrado
     */
    async getTicketById(ticketId) {
        try {
            const ticket = await this.ticketRepository.getTicketById(ticketId);
            if (!ticket) {
                throw new Error(`Ticket con ID ${ticketId} no encontrado`);
            }
            return ticket;
        } catch (error) {
            throw new Error(`Error al obtener ticket: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los tickets de un usuario
     * @param {string} userEmail - Email del usuario
     * @returns {Array} - Lista de tickets del usuario
     */
    async getTicketsByUser(userEmail) {
        try {
            return await this.ticketRepository.getTicketsByPurchaser(userEmail);
        } catch (error) {
            throw new Error(`Error al obtener tickets del usuario: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los tickets (para usuarios admin)
     * @returns {Array} - Lista de todos los tickets
     */
    async getAllTickets() {
        try {
            return await this.ticketRepository.getAllTickets();
        } catch (error) {
            throw new Error(`Error al obtener todos los tickets: ${error.message}`);
        }
    }
}

export default TicketService;