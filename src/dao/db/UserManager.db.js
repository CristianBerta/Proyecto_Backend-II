import mongoose from 'mongoose';
import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";

class UserManagerDB {
    constructor() {
        this.userModel = userModel;
    }

    async createUser(userData) {
        try {
            //Hash del password
            const hashedPassword = bcrypt.hashSync(userData.password, 10);

            const user = await this.userModel.create({
                ...userData,
                password: hashedPassword
            });

            return user;
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async getUserByEmail(email) {
        try {
            return await this.userModel.findOne({ email }).populate('email').lean();
        } catch (error) {
            throw new Error(`Error al obtener el usuario por email: ${error.message}`);
        }
    }

    async getUserById(id) {
        try {
            return await this.userModel.findById(id).populate('cart').lean();
        } catch (error) {
            throw new Error(`Error al obtener el usuario por ID: ${error.message}`);
        }
    }
}

export default UserManagerDB;