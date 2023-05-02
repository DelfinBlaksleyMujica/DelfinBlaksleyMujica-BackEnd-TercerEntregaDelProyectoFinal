//Me traigo JWT

const jwt = require("jsonwebtoken");

//Middlewares

const checkUserLogged = ( req, res , next ) => {
    //Si el usuario esta autenticado
    if( req.isAuthenticated()){
        next();
    }else {
        res.send(`<div>Debes iniciar sesion <a href="/inicio-de-sesion">Inicia Sesión</a></div>`)
    }
};

const userNotLogged = ( req , res , next ) => {
    if (req.isAuthenticated()) {
        res.redirect("/");
    }else {
        next()
    }
};

const isValidToken = ( req , res , next ) => {

    const userToken = req.session.acces_token;
    
    if (!userToken) {
        return res.send(`<div>Debes iniciar sesion <a href="/inicio-de-sesion">Inicia Sesión</a></div>`);
    }

    jwt.verify( userToken , "claveToken" , ( error , decodeToken ) => {
        if(error) return res.json( { message: error.message } );
        req.user = decodeToken;
        next();
    } );
};

// permisos de administrador

const esAdmin = true

function crearErrorNoEsAdmin(ruta, metodo) {
    const error = {
        error: -1,
    }
    if (ruta && metodo) {
        error.descripcion = `ruta '${ruta}' metodo '${metodo}' no autorizado`
    } else {
        error.descripcion = 'no autorizado'
    }
    return error
}

function soloAdmins(req, res, next) {
    if (!esAdmin) {
        res.json(crearErrorNoEsAdmin())
    } else {
        next()
    }
}


module.exports = { checkUserLogged , userNotLogged , isValidToken , soloAdmins };