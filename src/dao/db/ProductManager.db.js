import Product from '../models/product.model.js';

class ProductManagerDB {
  async getProducts(options = {}) {
    try {
      const {
        limit = 10, 
        page = 1, 
        sort, 
        query = {} 
      } = options;

      const sortOptions = {};
      if (sort === 'asc') sortOptions.price = 1;
      if (sort === 'desc') sortOptions.price = -1;

      const result = await Product.paginate(query, {
        limit: parseInt(limit),
        page: parseInt(page),
        sort: sortOptions,
        lean: true
      });

      return {
        status: 'success',
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: (result.hasPrevPage ? `/?limit=${limit}&page=${result.page - 1}` : null),
        nextLink: (result.hasNextPage ? `/?limit=${limit}&page=${result.page + 1}` : null)
      };
    } catch(error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }

  async getProductById(id) {
  try {
    const product = await Product.findById(id).lean();
    return product;
  } catch (error) {
    console.error(`Error al obtener producto con id ${id}:`, error);
    return null;
  }
}

  async addProduct(productData) {
  try {
    const newProduct = new Product(productData);
    await newProduct.save();
    return newProduct;
  } catch (error) {
    console.error('Error al agregar producto:', error);
    throw error;
  }
}

  async updateProduct(id, updatedFields) {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true }
    );
    return updatedProduct;
  } catch (error) {
    console.error(`Error al actualizar producto con id ${id}:`, error);
    return null;
  }
}

  async deleteProduct(id) {
  try {
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error(`Error al eliminar producto con id ${id}:`, error);
    return false;
  }
}
}

export default ProductManagerDB;