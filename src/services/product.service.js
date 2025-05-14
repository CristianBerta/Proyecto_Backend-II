import ProductRepository from '../repositories/Product.Repository.js';

class ProductService {
    constructor() {
        this.productRepository = new ProductRepository();
    }

    async getProducts(options = {}) {
        try {
            return await this.productRepository.getProducts(options);
        } catch (error) {
            throw new Error(`Error en el servicio al obtener productos: ${error.message}`);
        }
    }

    async getProductById(id) {
        try {
            const product = await this.productRepository.getProductById(id);
            if (!product) {
                throw new Error(`Producto con ID ${id} no encontrado`);
            }
            return product;
        } catch (error) {
            throw new Error(`Error en el servicio al obtener producto por ID: ${error.message}`);
        }
    }

    async addProduct(productData) {
        try {
            // Validación básica
            if (!productData.title || !productData.description || !productData.code ||
                !productData.price || !productData.stock || !productData.category) {
                throw new Error('Faltan campos obligatorios');
            }

            // Verificar si ya existe un producto con el mismo código
            const existingProducts = await this.productRepository.getProducts({
                query: { code: productData.code }
            });

            if (existingProducts.payload && existingProducts.payload.length > 0) {
                throw new Error(`Ya existe un producto con el código ${productData.code}`);
            }

            return await this.productRepository.addProduct(productData);
        } catch (error) {
            throw new Error(`Error en el servicio al crear producto: ${error.message}`);
        }
    }

    async updateProduct(id, updatedFields) {
        try {
            // Comprobar primero si el producto existe
            const existingProduct = await this.productRepository.getProductById(id);
            if (!existingProduct) {
                throw new Error(`Producto con ID ${id} no encontrado`);
            }

            // Si se actualiza el código, verificar que no exista otro producto con ese código
            if (updatedFields.code && updatedFields.code !== existingProduct.code) {
                const productsWithSameCode = await this.productRepository.getProducts({
                    query: { code: updatedFields.code }
                });

                if (productsWithSameCode.payload && productsWithSameCode.payload.length > 0) {
                    throw new Error(`Ya existe un producto con el código ${updatedFields.code}`);
                }
            }

            return await this.productRepository.updateProduct(id, updatedFields);
        } catch (error) {
            throw new Error(`Error en el servicio al actualizar producto: ${error.message}`);
        }
    }

    async deleteProduct(id) {
        try {
            const existingProduct = await this.productRepository.getProductById(id);
            if (!existingProduct) {
                throw new Error(`Producto con ID ${id} no encontrado`);
            }

            const result = await this.productRepository.deleteProduct(id);
            if (!result) {
                throw new Error(`No se pudo eliminar el producto con ID ${id}`);
            }
            return true;
        } catch (error) {
            throw new Error(`Error en el servicio al eliminar producto: ${error.message}`);
        }
    }
}

export default ProductService;