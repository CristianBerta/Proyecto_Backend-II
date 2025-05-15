import Ticket from '../dao/models/ticket.model.js';
import Cart from '../dao/models/cart.model.js';
import Product from '../dao/models/product.model.js';
import mongoose from 'mongoose';

class TicketRepository {
    async createTicket(ticketData) {
        try {
            // Generar código único para el ticket
            const code = await Ticket.generateUniqueCode();
            
            // Crear el ticket con los datos proporcionados y el código generado
            const newTicket = new Ticket({
                ...ticketData,
                code
            });
            
            await newTicket.save();
            return newTicket;
        } catch (error) {
            console.error('Error al crear ticket:', error);
            throw error;
        }
    }

    async getTicketById(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('El ID del ticket no es válido');
            }

            const ticket = await Ticket.findById(id).populate('products.product').lean();
            if (!ticket) return null;
            return ticket;
        } catch (error) {
            console.error(`Error al obtener ticket con id ${id}:`, error);
            throw error;
        }
    }

    async getTicketsByPurchaser(email) {
        try {
            const tickets = await Ticket.find({ purchaser: email })
                .populate('products.product')
                .sort({ purchase_datetime: -1 })
                .lean();

            return tickets;
        } catch (error) {
            console.error(`Error al obtener tickets del comprador ${email}:`, error);
            throw error;
        }
    }

    async getAllTickets() {
        try {
            const tickets = await Ticket.find()
                .populate('products.product')
                .sort({ purchase_datetime: -1 })
                .lean();
                
            return tickets;
        } catch (error) {
            console.error('Error al obtener todos los tickets:', error);
            throw error;
        }
    }

    async updateTicketStatus(ticketId, status, failedProducts = []) {
        try {
            const updatedTicket = await Ticket.findByIdAndUpdate(
                ticketId,
                { 
                    status, 
                    failedProducts: failedProducts.length > 0 ? failedProducts : undefined 
                },
                { new: true }
            ).populate('products.product');

            if (!updatedTicket) return null;
            return updatedTicket;
        } catch (error) {
            console.error(`Error al actualizar estado del ticket ${ticketId}:`, error);
            throw error;
        }
    }
}

export default TicketRepository;