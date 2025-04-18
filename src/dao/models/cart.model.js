import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    products: {
        type: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: 1
            }
        }],
        default: []
    }
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;