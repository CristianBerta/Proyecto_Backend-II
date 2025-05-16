import { Router } from "express";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
import ProductService from "../services/product.service.js";

const productsRouter = Router();
const PS = new ProductService();

//Obtener todos los productos (público)
productsRouter.get("/", async (req, res) => {
    try {
        // Extraer parámetros
        const { limit = 10, page = 1, sort, category, status } = req.query;

        // Construir objeto de opciones
        const filterQuery = {};

        // Agregar filtros
        if (category) { filterQuery.category = category; }
        if (status === "true" || status === "false") { filterQuery.status = status === "true"; }

        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort,
            query: filterQuery
        };

        // Obtener productos con filtros
        const products = await PS.getProducts(options);

        res.send({
            status: "success",
            payload: products.payload,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/products?limit=${limit}&page=${products.prevPage}&sort=${sort}${category ? `&category=${category}` : ''}${status ? `&status=${status}` : ''}` : null,
            nextLink: products.hasNextPage ? `/products?limit=${limit}&page=${products.nextPage}&sort=${sort}${category ? `&category=${category}` : ''}${status ? `&status=${status}` : ''}` : null
        });
    } catch (error) {
        console.log("Error en obtener los Productos!", error);
        res.status(500).send({ status: "error", message: "Error en obtener los Productos!" });
    }
});

//Obtener un producto por ID (público)
productsRouter.get("/:pid", async (req, res) => {
    try {
        const product = await PS.getProductById(req.params.pid);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto" });
    }
});

//Crear producto (solo admin)
productsRouter.post("/", isAuthenticated, authorizeRoles(['admin']), async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }
        const newProduct = await PS.addProduct({ title, description, code, price, status, stock, category, thumbnails });
        res.status(201).json({
            status: "success",
            message: "Producto creado exitosamente", 
            product: newProduct
        });
    } catch (error) {
        console.error("Error al crear el producto:", error);
        res.status(500).json({ status: "error", message: "Error al crear el producto" });
    }
});

//Actualizar producto (solo admin)
productsRouter.put("/:pid", isAuthenticated, authorizeRoles(['admin']), async (req, res) => {
    try {
        const updatedProduct = await PS.updateProduct(req.params.pid, req.body);
        if (updatedProduct) {
            res.json({
                status: "success",
                message: "Producto actualizado exitosamente",
                product: updatedProduct
            });
        } else {
            res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ status: "error", message: "Error al actualizar el producto" });
    }
});

//Eliminar producto (solo admin)
productsRouter.delete("/:pid", isAuthenticated, authorizeRoles(['admin']), async (req, res) => {
    try {
        const deleted = await PS.deleteProduct(req.params.pid);
        if (deleted) {
            res.json({ status: "success", message: "Producto eliminado exitosamente" });
        } else {
            res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ status: "error", message: "Error al eliminar el producto" });
    }
});

export default productsRouter;