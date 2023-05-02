const { logger } = require("../loggers/loggers");

class ContenedorProductos {
    constructor( productsModel ) {
        this.coleccion = productsModel;
    }

    async listar( id ) {
        const itemListado = await this.coleccion.find( { _id: id } );
        const itemListadoObj = itemListado[0];
        return itemListadoObj;
    }

    async listarAll() {
        const listado = await this.coleccion.find({})
        return listado;
    }

    async guardar( nuevoElem ){
        const elementoNuevo = new this.coleccion( nuevoElem );
        const savedNewElement = await elementoNuevo.save();
        return savedNewElement;
    }


    async actualizar( id ,  nuevoElem ) {
        const { nombre , descripcion , precio , stock , thumbnail ,codigoDeProducto } = nuevoElem;
        const elementUpdate = await this.coleccion.updateOne( { _id: id } , { $set: { nombre: nombre , descripcion:descripcion , precio: precio , stock:stock , thumbnail:thumbnail , codigoDeProducto: codigoDeProducto } } )
        return elementUpdate;
    }

    async borrar( id ) {
        const itemListado = await this.coleccion.find( { _id: id } );
        const itemListadoObj = itemListado[0];
        logger.info(`Chequeo: ${ itemListadoObj }`);
        if (itemListadoObj == undefined ) {
            return null
        }else {
            const userDeleted = await this.coleccion.deleteOne( { _id: id } )
            return itemListadoObj;
        }
        
    }
}

module.exports = ContenedorProductos;