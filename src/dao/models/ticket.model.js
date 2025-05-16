import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    },
    products: {
        type: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            title: String,
            price: Number,
            quantity: {
                type: Number,
                required: true
            }
        }],
        default: []
    },
    status: {
        type: String,
        enum: ['completed', 'incomplete', 'pending', 'failed'],
        default: 'completed'
    },
    failedProducts: {
        type: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            title: String,
            price: Number,
            quantity: Number,
            reason: String
        }],
        default: []
    }
}, { timestamps: true });

//Metodo para generar un codigo
ticketSchema.statics.generateUniqueCode = async function() {
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TICKET-${timestamp}-${randomNum}`;
};

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;