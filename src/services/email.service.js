import nodemailer from 'nodemailer';
import config from '../config/config.js';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: config.emailConfig.service,
            auth: {
                user: config.emailConfig.user,
                pass: config.emailConfig.password
            }
        });
    }

    async sendPasswordResetEmail(email, token) {
        const resetUrl = `${config.emailConfig.baseUrl}/reset-password/${token}`;
        
        const mailOptions = {
            from: config.emailConfig.user,
            to: email,
            subject: 'Recuperación de contraseña',
            html: `
                <h1>Recuperación de contraseña</h1>
                <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
                <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste restablecer tu contraseña, ignora este correo.</p>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            return info;
        } catch (error) {
            throw new Error(`Error al enviar el correo: ${error.message}`);
        }
    }
}

export default EmailService;