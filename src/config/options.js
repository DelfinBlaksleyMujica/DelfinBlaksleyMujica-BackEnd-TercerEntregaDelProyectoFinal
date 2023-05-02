const dotenv = require("dotenv").config();

//Yargs

const argumentos = process.argv.slice(2);
const Yargs = require("yargs/yargs")(argumentos);

const args = Yargs
    .default({
        m: "FORK",

    })
    .alias({
        m:"modo"
    })
    .argv;


const options = {
    server: {
        MODO: args.modo
    },
    mongoDB: {
        url:process.env.MONGO_URL,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    }
    
}

module.exports = { options }