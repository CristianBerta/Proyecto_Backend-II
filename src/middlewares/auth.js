import passport from "passport";

export const isAuthenticated = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
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

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ status: "error", message: "Acceso Denegado" });
};