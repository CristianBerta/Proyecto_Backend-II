import passport from "passport";
import local from "passport-local";
import jwt from "passport-jwt";
import bcrypt from "bcrypt";
import UserService from "../services/user.service.js";
import CartService from "../services/cart.service.js";
import config from "./config.js";

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const userService = new UserService();
const cartService = new CartService();

const initializePassport = () => {
    //Estrategia Registro
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, email, password, done) => {
            try {
                const { first_name, last_name, age } = req.body;

                const user = await userService.getUserByEmail(email);
                if (user) {
                    return done(null, false, { message: 'User already exists' });
                }

                const cart = await cartService.createCart();

                const newUser = await userService.registerUser({
                    first_name,
                    last_name,
                    email,
                    age,
                    password,
                    cart: cart._id
                });

                return done(null, newUser);
            } catch (error) {
                return done(error);
            }
        }
    ));

    //Estrategia Login
    passport.use('login', new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await userService.getUserByEmail(email);
                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }

                const isValidPassword = bcrypt.compareSync(password, user.password);
                if (!isValidPassword) {
                    return done(null, false, { message: 'Invalid password' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    //Estrategia JWT
    passport.use('jwt', new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([
                ExtractJWT.fromAuthHeaderAsBearerToken(),
                (req) => {
                    let token = null;
                    if (req && req.cookies) {
                        token = req.cookies['jwt'];
                    }
                    return token;
                }
            ]),
            secretOrKey: config.jwtSecret
        },
        async (jwt_payload, done) => {
            try {
                const user = await userService.getUserById(jwt_payload.id);
                if (!user){
                    return done(null, false);
                }
                return done(null, jwt_payload);
            } catch (error) {
                return done(error);
            }
        }
    ));

    //Estrategia Current
    passport.use('current', new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([
                ExtractJWT.fromAuthHeaderAsBearerToken(),
                (req) => {
                    let token = null;
                    if (req && req.cookies) {
                        token = req.cookies['jwt'];
                    }
                    return token;
                }
            ]),
            secretOrKey: config.jwtSecret
        },
        async (jwt_payload, done) => {
            try {
                const user = await userService.getUserById(jwt_payload.id);
                if (!user) {
                    return done(null, false);
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userService.getUserById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

export default initializePassport;