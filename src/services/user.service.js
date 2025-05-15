import UserRepository from "../repositories/User.Repository.js";
import EmailService from "./email.service.js";
import bcrypt from "bcrypt";

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
        this.emailService = new EmailService();
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

    // Métodos para recuperación de contraseña
    async requestPasswordReset(email) {
        const user = await this.userRepository.getUserByEmail(email);
        if (!user) {
            throw new Error('No existe un usuario con ese email.');
        }

        // Crear token de recuperación
        const { token } = await this.userRepository.createPasswordResetToken(email);
        
        // Enviar email
        await this.emailService.sendPasswordResetEmail(email, token);
        
        return true;
    }

    async verifyResetToken(token) {
        const user = await this.userRepository.getUserByResetToken(token);
        if (!user) {
            throw new Error('Token inválido o expirado.');
        }
        return user;
    }

    async resetPassword(token, newPassword) {
        const user = await this.userRepository.getUserByResetToken(token);
        if (!user) {
            throw new Error('Token inválido o expirado.');
        }

        // Verificar que la nueva contraseña no sea igual a la actual
        const isSamePassword = bcrypt.compareSync(newPassword, user.password);
        if (isSamePassword) {
            throw new Error('La nueva contraseña no puede ser igual a la anterior.');
        }

        // Verificar que la nueva contraseña no esté en el historial
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        
        // Verificar manualmente comparando con bcrypt
        for (const oldPassword of user.passwordHistory || []) {
            if (bcrypt.compareSync(newPassword, oldPassword)) {
                throw new Error('No puedes usar una contraseña que ya has utilizado anteriormente.');
            }
        }

        // Restablecer la contraseña
        await this.userRepository.resetPassword(token, hashedNewPassword);
        
        return true;
    }
}

export default UserService;