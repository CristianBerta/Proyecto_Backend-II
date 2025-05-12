class ProductRepository {
    constructor(productDao) {
        this.productDao = productDao;
    }

    async getProducts(options) {
        return await this.productDao.getProducts(options);
    }

    async getProductById(id) {
        return await this.productDao.getProductById(id);
    }

    async createProduct(productData) {
        return await this.productDao.addProduct(productData);
    }

    async updateProduct(id, updatedFields) {
        return await this.productDao.updateProduct(id, updatedFields);
    }

    async deleteProduct(id) {
        return await this.productDao.deleteProduct(id);
    }
}

export default ProductRepository;