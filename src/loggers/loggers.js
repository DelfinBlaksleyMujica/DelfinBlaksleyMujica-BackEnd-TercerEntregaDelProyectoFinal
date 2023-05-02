const winston = require("winston");
require("dotenv").config();

//Configuracion de Winston

const loggerDev = winston.createLogger({
    transports:[
        new winston.transports.Console( { level:"info" } ),
    ]
});

const loggerProd = winston.createLogger({
    transports:[
        new winston.transports.Console( { level:"info"} ),
        new winston.transports.File( { filename:"./src/loggers/logs/warn.log" , level:"warn" } ),
        new winston.transports.File( { filename:"./src/loggers/logs/error.log" , level:"error" } )
    ]
});

let logger = null;

if ( process.env.NODE_ENV === "prod") {
    logger = loggerProd;
}else {
    logger = loggerDev;
}

module.exports = { logger };