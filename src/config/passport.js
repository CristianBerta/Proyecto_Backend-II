import passport from "passport";
import local from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import userModel from "../dao/models/user.model.js";

const LocalStrategy = local.Strategy;

const initializePassport = () => {
    // Estrategia LOCAL para login
    passport.use(
        "login",
        new LocalStrategy(
            { usernameField: "email" },
            async (email, password, done) => {
                try {
                    const user = await userModel.findOne({ email });
                    if (!user) {
                        return done(null, false, { message: "Usuario no encontrado" });
                    }

                    const isMatch = bcrypt.compareSync(password, user.password);
                    if (!isMatch) {
                        return done(null, false, { message: "Contraseña incorrecta" });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    // Estrategia JWT
    passport.use(
        "jwt",
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: "secretJWT", // Asegurate de usar esta misma clave al firmar el token
            },
            async (jwt_payload, done) => {
                try {
                    const user = await userModel.findById(jwt_payload.id);
                    if (!user) {
                        return done(null, false);
                    }
                    return done(null, user);
                } catch (error) {
                    return done(error, false);
                }
            }
        )
    );
};

export default initializePassport;