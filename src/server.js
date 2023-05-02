//Dotenv 

const dotenv = require("dotenv");
dotenv.config();
const sessionSecret = process.env.SECRET_SESSION;

//Conexion de Servidor 

const express = require("express");
const app = express();
const httpServer = require("http").Server(app);
const io = require("socket.io")(httpServer);
const PORT = process.env.PORT || 8080;

const { options } = require("./config/options");

//Compresion GZIP

const compression = require("compression");
app.use(compression());

//Loggers

const { logger } = require("./loggers/loggers");

//Cluster

const cluster = require("cluster");
const os = require("os");
const numCores = os.cpus().length;

//Conexion con routers

const { AuthRouter } = require("./routes/auth.routes");
const { ProductsRouter } = require("./routes/productos.routes");
const { CarritosRouter } = require("./routes/carritos.routes");

//Conexion de Sessions

const session = require("express-session");
const cookieParser = require("cookie-parser");

//Conexion con Middleware de Autenticacion Passport

const passport = require("passport");

//Conexion con Base de datos

const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");

//Conexion con mongoose 

mongoose.connect( options.mongoDB.url , options.mongoDB.options )
.then( () => {
    logger.info("Base de datos conectada exitosamente!!");
});


//Configuracion de la session

app.use(cookieParser());

//Modo Cluster o Fork

if ( options.server.MODO === "CLUSTER" && cluster.isPrimary ) {
    
    for (let i = 0; i < numCores; i++) {
        cluster.fork();
    }

    cluster.on( "exit", ( worker ) => {
        console.log(`Proceso ${ worker.process.pid } murio`);
        cluster.fork();
    });
    
} else {

    //Conexion del servidor
    const server = httpServer.listen( PORT , () => {
        logger.info( `Server listening on port ${ server.address().port } on process ${ process.pid }` );
    });
    server.on( "error" , error => logger.info(`Error en el servidor: ${error}` ) );

    //Interpretacion de formatos

    app.use( express.json() );
    app.use( express.urlencoded( { extended: true } ) );

    //Sessions

    app.use(session({
        store: MongoStore.create({
            mongoUrl: options.mongoDB.url,
            ttl:600
        }),
        secret: sessionSecret,
        resave: true,
        saveUninitialized: true
    }));

    //Configuracion de Passport

    app.use( passport.initialize() );
    app.use( passport.session() );
    
    //Routes

    app.use( AuthRouter );
    app.use( "/api/productos" , ProductsRouter );
    app.use( "/api/carritos" , CarritosRouter );

    app.get('*', (req, res) => {
        const { url, method } = req
        logger.warn(`Ruta ${method} ${url} no implementada`);
        res.send(`Ruta ${method} ${url} no está implementada`);
    });
    
}


