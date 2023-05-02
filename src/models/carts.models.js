//Conexion a Mongoose para poder armar los esquemas

const mongoose = require("mongoose");


//Coleccion creada dentro de la DB de Mongo Atlas

const carritosCollection = "carritos";

const carritosSchema = new mongoose.Schema({
    productos: { 
        type: [] , 
        required: true 
    }
})

const CarritosModel = mongoose.model( carritosCollection , carritosSchema  )

module.exports = { CarritosModel };