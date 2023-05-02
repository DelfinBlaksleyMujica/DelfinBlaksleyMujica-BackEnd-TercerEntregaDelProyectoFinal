//NodeMailer
const nodemailer = require("nodemailer");

//Dotenv

const dotenv = require("dotenv");
dotenv.config();

//Credenciales del correo

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassEmail = process.env.ADMIN_PASS_EMAIL;

//Configurl el canal para realizar el envio de mensajes
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: adminEmail,
        pass: adminPassEmail
    },
    secure:false,
    tls:{
        rejectUnauthorized: false
    }
});

module.exports = { transporter , adminEmail }