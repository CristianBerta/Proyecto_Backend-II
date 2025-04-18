import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import __dirname from "./utils.js";
import productsRouter from "./routers/productsRouter.js";
import cartsRouter from "./routers/cartsRouter.js";
import viewsRouter from "./routers/viewsRouter.js";
import sessionsRouter from "./routers/sessionsRouter.js";
import ProductManagerDB from "./dao/db/ProductManager.db.js";
import helpers from "./views/helpers/helpers.js";
import mongoose from "mongoose";
import passport from "passport";
//import "./config/passport.js";
import initializePassport from "./config/passport.js";

const app = express();
const port = 8080;
const httpServer = app.listen(port, () => {
    console.log("Servidor activo en el puerto: " + port);
});
const socketServer = new Server(httpServer);

// Configuraciones para la app
app.engine("handlebars", handlebars.engine({helpers: helpers}));
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = await mongoose.connect("mongodb+srv://cristian:Adidas88!@cluster0.ehtm7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
if (connectDB) {
    console.log("Conectado a MongoDB");
}

//Passport
initializePassport();
app.use(passport.initialize());

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);
app.use("/api/sessions", sessionsRouter);

const PM = new ProductManagerDB();

socketServer.on("connection", async socket => {
    console.log("Nuevo cliente conectado");
    try {
        const products = await PM.getProducts();
        socket.emit("realtimeproducts", products.payload || products);
    } catch (error) {
        console.error("Error al enviar productos:", error);
        socket.emit("realtimeproducts", []);
    }

    socket.on("nuevoProducto", async data => {
        try {
            await PM.addProduct(data);
            console.log("Se agregó un nuevo producto!");
            const updatedProducts = await PM.getProducts();
            socketServer.emit("realtimeproducts", updatedProducts.payload || updatedProducts);
        } catch (error) {
            console.error("Error al agregar producto:", error);
        }
    });

    socket.on("eliminarProducto", async id => {
        try {
            await PM.deleteProduct(id);
            console.log("Se eliminó un producto!");
            const updatedProducts = await PM.getProducts();
            socketServer.emit("realtimeproducts", updatedProducts.payload || updatedProducts);
        } catch (error) {
            console.error("Error al eliminar producto:", error);
        }
    });
});