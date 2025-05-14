import UserRepository from "../repositories/User.Repository.js";
import bcrypt from "bcrypt";

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async registerUser(userData) {
        const {email, password} = userData;

        const existingUser = await this.userRepository.getUserByEmail(email);
        if (existingUser) {
            throw new Error('El email ya está registrado.');
        }
        
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = await this.userRepository.createUser({
            ...userData,
            password: hashedPassword
        });
        return newUser;
    }

    async getUserByEmail(email) {
        return await this.userRepository.getUserByEmail(email);
    }

    async getUserById(id) {
        return await this.userRepository.getUserById(id);
    }
}

export default UserService;