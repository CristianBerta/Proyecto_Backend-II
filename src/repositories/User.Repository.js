import userModel from "../dao/models/user.model.js";
import crypto from "crypto";
import config from "../config/config.js";

class UserRepository {        
    async createUser(userData) {
        try {
            const userdateToSave = { ...userData };
            if (userData.password) {
                userdateToSave.passwordHistory = [userData.password];
            }

            //Hash del password
            const newUser = await userModel.create(userdateToSave);
            return newUser.toObject();

        } catch (error) {
            if (error.code === 11000){
                throw new Error(`Error al crear usuario en el repositorio: El email '${userDataWithHashedPassword.email}' ya existe.`);
            }
            throw new Error(`Error al crear usuario: ${error.message}`);
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

    async getUserByResetToken(token) {
        try {
            return await userModel.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            }).lean();
        } catch (error) {
            throw new Error(`Error al obtener el usuario por token: ${error.message}`);
        }
    }

    async createPasswordResetToken(email) {
        try {
            const token = crypto.randomBytes(20).toString('hex');
            const expireTime = Date.now() + config.resetPasswordExpireTime;
            
            const updatedUser = await userModel.findOneAndUpdate(
                { email },
                { 
                    resetPasswordToken: token, 
                    resetPasswordExpires: expireTime 
                },
                { new: true }
            ).lean();
            
            if (!updatedUser) {
                throw new Error('Usuario no encontrado');
            }
            
            return { token, expireTime };
        } catch (error) {
            throw new Error(`Error al crear token de recuperación: ${error.message}`);
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const user = await userModel.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });
            
            if (!user) {
                throw new Error('Token inválido o expirado');
            }
            
            // Guardar la contraseña anterior en el historial (máximo 5)
            user.passwordHistory = user.passwordHistory || [];
            user.passwordHistory.push(user.password);
            if (user.passwordHistory.length > 5) {
                user.passwordHistory.shift(); // Eliminar la más antigua si hay más de 5
            }
            
            // Actualizar contraseña y limpiar token
            user.password = newPassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            
            await user.save();
            return true;
        } catch (error) {
            throw new Error(`Error al restablecer contraseña: ${error.message}`);
        }
    }

    async checkPasswordHistory(userId, newHashedPassword) {
        try {
            const user = await userModel.findById(userId);
            if (!user) throw new Error('Usuario no encontrado');
            
            return user.passwordHistory && user.passwordHistory.includes(newHashedPassword);
        } catch (error) {
            throw new Error(`Error al verificar historial de contraseñas: ${error.message}`);
        }
    }
}

export default UserRepository;