//Conexion a Mongoose para poder armar los esquemas

const mongoose = require("mongoose");


//Coleccion creada dentro de la DB de Mongo Atlas

const productosCollection = "productos";

const productsSchema = new mongoose.Schema({
    nombre:{ 
        type: String , 
        required: true 
    },
    descripcion:{ 
        type:String , 
        required: true 
    },
    codigoDeProducto:{ 
        type: Number , 
        required: true 
    },
    precio: { 
        type: Number , 
        required: true 
    },
    thumbnail: { 
        type: String , 
        required: true 
    },
    stock:{ 
        type: Number , 
        required: true 
    }
})

const ProductosModel = mongoose.model( productosCollection , productsSchema  )

module.exports = { ProductosModel };