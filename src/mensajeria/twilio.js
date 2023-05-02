//Twilio
const twilio = require("twilio");

//Dotenv
const dotenv = require("dotenv");
dotenv.config();

//Credenciales para conectarme a los servicios de Twilio
const accountId=process.env.TWILIO_ACCOUNT_ID;
const accountToken = process.env.TWILIO_ACCESS_TOKEN;

//Cliente de Node 
const twilioClient = twilio( accountId , accountToken );

/*Whats App*/
const twilioWapp = process.env.TWILIO_WAPP_NUM;
const adminWapp = process.env.TWILIO_ADMINWAPP_NUM;

/*Mensaje de Texto*/
const twilioPhone=process.env.TWILIO_NUM;



module.exports = { twilioWapp , twilioPhone , adminWapp  , twilioClient }