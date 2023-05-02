//Conexion con express y Router

const Router = require("express").Router;

//Loggers

const { logger } = require("../loggers/loggers");


//Middlewares Locales

const { checkUserLogged, userNotLogged , isValidToken , soloAdmins  } = require("../middlewares/auth.middlewares");

//Dotenv

const dotenv = require("dotenv");
dotenv.config();

//Models

const { CarritosModel } = require("../models/carts.models");
const { ProductosModel } = require("../models/products.models.js");

//Contenedor

const ContenedorCarritos = require("../contenedores/ContenedorCarritos.js");
const carritosApi = new ContenedorCarritos( CarritosModel );

const ContenedorProductos = require("../contenedores/ContenedorProductos.js");
const productosApi = new ContenedorProductos( ProductosModel );

//Mensajeria

const { transporter , adminEmail } = require("../mensajeria/gmail");
const { adminWapp  , twilioClient , twilioWapp , twilioPhone } = require("../mensajeria/twilio");

//Router

const router = Router();

//Endpoints

router.get('/', async (req, res) => {
        try {
            const carritos = await carritosApi.listarAll();
            if ( carritos.length == 0) {
                console.log("No hay carritos para mostrar");
                return res.status(400).send({ message: "No hay carritos para mostrar"})
            } else {
                console.log("Se muestran todos los carritos correctamente");
                return res.status(200).send({ carritos: carritos });
            }
            
        } catch (error) {
            console.log("Error en el get de productos");
            res.status(500).send({ message: error.message });
        }  
})

router.post('/', async (req, res) => {
    try {
        const nuevoCarrito = await carritosApi.guardar();
        req.session.carrito = nuevoCarrito;
        console.log(`Carrito nuevo agregado a la base de datos: ${ nuevoCarrito }`);
        return res.status(200).send( { carritoNuevo: nuevoCarrito } )
    } catch (error) {
        console.log("No se pudo agregar el carrito a la base de datos");
        res.status(500).send({ message : error.message })
    }
});


router.delete('/:id', async (req, res) => {
    try {
        if (req.params) {
            const { id } = req.params;
            const carrito = await carritosApi.listar( id )
            const deletedCart = await carritosApi.borrar( id )
            console.log(`Se elimino correctamente el carrito "${carrito.id}" de la base de datos`);
            res.status(200).send({ deletedProduct: deletedCart })
        }
    } catch (error) {
        console.log("No se elimino el carrito, error en el DELETE");
        res.status(500).send( { message: error.message } )
    }
})

//--------------------------------------------------
// router de productos en carrito

router.get('/:id/productos', async (req, res) => {
    try {
        if (req.params) {
            const { id } = req.params;
            const carrito = await carritosApi.listar( id );
            console.log(carrito.productos);
            res.status(200).send( { productos: carrito.productos } )
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send( { message: error.message } )
    }
})

router.post('/:id/productos', async (req, res) => {
    try {
        if (req.params) {
            const { id } = req.params;
            const producto = await productosApi.listar( id );
            req.session.carrito.productos.push(producto);
            console.log( producto );
            const newProduct = await carritosApi.addProduct( producto )
            const newProductObj = JSON.stringify( newProduct)
            res.send({ producto: `Se agrego el producto ${ newProductObj } al carrito` })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send( { error: error.message } )
    }    
});

router.post("/checkout" , async ( req , res ) => {
    try {
        if (req.params) {
            const productosEnCarrito = JSON.stringify(req.session.carrito.productos);
            //Envio de Mail
            const nuevoPedido = `
                <div>
                    <h1>¡Nuevo Pedido!</h1>
                    <h2>Se realizo un nuevo pedido</h2>
                    <h3>Los datos del pedido son los siguientes:</h3>
                    ${ productosEnCarrito }
                </div>`
            /*Estructura del correo*/
            const mailOptions = {
                from:"Activá E-Commerce",
                to: adminEmail,
                subject: `Nuevo Pedido de: ${ req.session.username } + ${ req.session.userName } `,
                html: nuevoPedido
            }
            await transporter.sendMail( mailOptions );
            //Envio de Whats App
            const infoWapp = await twilioClient.messages.create({
                from: twilioWapp,
                to: adminWapp,
                body: `Nuevo pedido de: ${ req.session.username } + ${ req.session.userName }. Se incluyen los siguientes productos: ${ productosEnCarrito } `
            });
            //Envio de mensaje al cliente
            const infoMensaje = await twilioClient.messages.create({
                from: twilioPhone,
                to: req.session.telefono,
                body:"El pedido fue recibido correctamente y se encuentra en proceso."
            })
            res.status(200).send( { productos: req.session.carrito.productos } )
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send( { message: error.message } )
    }
})

router.delete('/:id/productos/:idProd', async (req, res) => {
    try {
        if (req.params) {
            const { id , idProd } = req.params;
            const prueba = await carritosApi.deleteProdFromCart( id , idProd );
            console.log(prueba);
            return res.status(200).send( { message: prueba } )
            /*if ( prueba == null || prueba == undefined ) {
                console.log("No se encontro el id del cart o del producto por lo tanto no se pudo borrar el producto del carrito solicitado");
                return res.status(404).send({ message:"No se encontro el id del cart o del producto por lo tanto no se pudo borrar el producto del carrito solicitado"})
            } else {
                console.log("Se elimino el producto del carrito");
                return res.send( { message: `Se elimino el producto con id: ${ idProd } del carrito con id: ${ id }` })
            }*/
        }
    } catch (error) {
        console.log(error);
        res.status(500).send( error.message );
    }
})


module.exports = { CarritosRouter: router  };