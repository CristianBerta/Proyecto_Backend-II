import userModel from "../dao/models/user.model.js";
//import bcrypt from "bcrypt";

class UserRepository {        
    async createUser(userData) {
        try {
            //Hash del password
            //const hashedPassword = bcrypt.hashSync(userData.password, 10);
            // const user = await userModel.create({
            //     ...userData,
            //     password: hashedPassword
            const newUser = await this.userModel.create(userDataWithHashedPassword);
            return newUser.toObject();

            //return user;
        } catch (error) {
            if (error.code === 11000){
                throw new Error(`Error al crear usuario en el repositorio: El email '${userDataWithHashedPassword.email}' ya existe.`);
            }
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async getUserByEmail(email) {
        try {
            return await userModel.findOne({ email }).populate('email').lean();
        } catch (error) {
            throw new Error(`Error al obtener el usuario por email: ${error.message}`);
        }
    }

    async getUserById(id) {
        try {
            return await userModel.findById(id).populate('cart').lean();
        } catch (error) {
            throw new Error(`Error al obtener el usuario por ID: ${error.message}`);
        }
    }
}

export default UserRepository;