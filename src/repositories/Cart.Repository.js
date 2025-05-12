class CartRepository {
    constructor(cartDao) {
        this.cartDao = cartDao;
    }

    async getAllCarts() {
        return await this.cartDao.getCarts();
    }

    async getCartById(id) {
        return await this.cartDao.getCartById(id);
    }

    async createCart() {
        return await this.cartDao.createCart();
    }

    async addProductToCart(cartId, productId) {
        return await this.cartDao.addProductToCart(cartId, productId);
    }

    async updateCart(cartId, products) {
        return await this.cartDao.updateCart(cartId, products);
    }

    async updateProductQuantity(cartId, productId, quantity) {
        return await this.cartDao.updateProductQuantity(cartId, productId, quantity);
    }

    async removeProductFromCart(cartId, productId) {
        return await this.cartDao.removeProductFromCart(cartId, productId);
    }

    async clearCart(cartId) {
        return await this.cartDao.clearCart(cartId);
    }
}

export default CartRepository;  