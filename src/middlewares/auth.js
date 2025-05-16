import passport from "passport";
import ProductService from "../services/product.service.js";

const PS = new ProductService();

export const isAuthenticated = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => { //jwt=current
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ status: "error", message: "No Autorizado" });
        }
        req.user = user;
        return next();
    })(req, res, next);
};

//Middleware de autorización basado en roles
export const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.log("Usuario no autenticado en authorizeRoles");
            return res.status(401).json({ status: "error", message: "No Autorizado" });
        }

        if (!req.user.role) {
            console.log("Usuario sin rol especificado:", req.user.email);
            return res.status(403).json({ status: "error", message: "Acceso Denegado, Rol no especificado" });
        }

        const hasRole = allowedRoles.includes(req.user.role);
        if (hasRole) {
            return next();
        }

        return res.status(403).json({ status: "error", message: `Acceso Denegado - Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`});
    };
};

// Middleware para verificar si puede comprar un producto
export const canPurchaseProduct = (productService) => {
    return async (req, res, next) => {
        try {
            if (req.user.role === 'user') {
                return next();
            }
            
            const productId = req.params.pid || req.body.productId;
            if (!productId) {
                return res.status(400).json({ status: "error", message: "ID de producto no proporcionado" });
            }
            
            const product = await PS.getProductById(productId);
            if (!product) {
                return res.status(404).json({ status: "error", message: "Producto no encontrado" });
            }
            
            return next();
        } catch (error) {
            console.error("Error en middleware canPurchaseProduct:", error);
            return res.status(500).json({ status: "error", message: "Error interno del servidor" });
        }
    };
};