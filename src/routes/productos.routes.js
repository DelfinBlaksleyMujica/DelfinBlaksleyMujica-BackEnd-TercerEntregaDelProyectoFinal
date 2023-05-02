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

const { ProductosModel } = require("../models/products.models.js");

//Contenedor

const ContenedorProductos = require("../contenedores/ContenedorProductos.js");
const productosApi = new ContenedorProductos( ProductosModel );

//Router

const router = Router();

//Endpoints

router.get('/', async (req, res) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        let productos = await productosApi.listarAll()
        if ( productos.length == 0 ) {
            logger.warn("No hay productos cargados en la base de datos");
            return res.status(404).send({ message: "No hay productos cargados en la base de datos"})
        }else{
            logger.info("Se muestran todos los productos correctamente");
            return res.status(200).send({ productos: productos });
        }
    } catch (error) {
        logger.error(`Error en el servidor para acceder a la ruta ${ method } ${ url } para traer productos`)
        res.status(500).send({ message: error.message });
    }  
})

router.get('/:id', async (req, res) => {
    const { url , method } = req;
    try{
        logger.info(`Ruta ${ method } ${ url } visitada`);
        if (req.params) {
            const { id } = req.params;
            const producto = await productosApi.listar( id )
            if ( producto == null ) {
                logger.warn("No existe producto con tal id en la base de datos");
                return res.status(404).send({ message: "No se encontro producto con tal id en la base de datos"});
            }else{
                logger.info(`Se trajo correctamente el producto con id: ${ id }`);
                return res.status(200).send({ producto : { producto }}) 
            }
        }
    }catch ( error ) {
        logger.error(`Error en el servidor para acceder a la ruta ${ method } ${ url } no se pudo traer producto por id`)
        res.status(500).send({ message : error.message })
    }
})

router.post('/', async (req, res) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        if (req.body.nombre &&  req.body.descripcion && req.body.codigoDeProducto && req.body.precio && req.body.thumbnail && req.body.stock) {
            const prodBody = req.body;
            const nuevoProd = await productosApi.guardar( prodBody );
            logger.info(`Producto nuevo agregado a la base de datos: ${ nuevoProd }`);
            return res.status(200).send( { productoNuevo: nuevoProd } )
        }else{
            logger.warn("No se completo toda la informacion del producto para poder cargarlo");
            res.status(200).send({ message:"Debe completar toda la informacion del producto para poder cargarlo" })
        }
    }catch ( error ) {
        logger.error(`Error en el servidor para acceder a la ruta ${ method } ${ url }, no se pudo agregar el producto a la base de datos`)
        res.status(500).send({ message : error.message })
    }  
})

router.put('/:id' , async (req, res) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        if (req.params) {
            const { id } = req.params;
            const { nombre , descripcion , codigoDeProducto , precio , thumbnail , stock } = req.body;
            const infoUpdatedProduct = {
                nombre: nombre,
                descripcion: descripcion, 
                codigoDeProducto: codigoDeProducto,
                precio: precio,
                thumbnail: thumbnail,
                stock: stock
            }
            const productUpdated = await productosApi.actualizar( id , infoUpdatedProduct )
            logger.info("Producto actualizado");
            res.send( { productUpdated: productUpdated } )
        }
    } catch (error) {
        logger.error(`Error en el servidor para acceder a la ruta ${ method } ${ url }, no se actualizo el producto`)
        res.status(500).send( { message: error.message } )
    }
})

router.delete('/:id' , async (req, res) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        if (req.params) {
            const { id } = req.params;
            const deletedProduct = await productosApi.borrar( id )
            if (deletedProduct == null) {
                logger.warn("No hay producto con dicho id en la base de datos");
                return res.status(404).send({ message: "No se elimino el producto ya que no se encontro en la base de datos" })
            } else {
                logger.info(`Producto correctamente eliminado de la base de datos: "${deletedProduct}"`);
                return res.status(200).send({ deletedProduct: deletedProduct })
            }
            
        }
    } catch (error) {
        logger.error(`Error en el servidor para acceder a la ruta ${ method } ${ url }, no se elimino el producto`)
        res.status(500).send( { message: error.message } )
    }
})

module.exports = { ProductsRouter: router  };