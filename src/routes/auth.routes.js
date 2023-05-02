//Conexion con express y Router

const Router = require("express").Router;

//Loggers

const { logger } = require("../loggers/loggers");

//Middlewares Locales

const { checkUserLogged, userNotLogged , isValidToken } = require("../middlewares/auth.middlewares");

//Conexion con Passport

const passport = require("passport");

//Conexion con Estrategias de Passport

const LocalStrategy = require("passport-local").Strategy;

//Conexion con JWT

const jwt = require("jsonwebtoken");

//Dotenv

const dotenv = require("dotenv");
dotenv.config();

//Conexion con bycrypt

const bcrypt = require("bcrypt");


//Models

const { UserModel } = require("../models/user.models");

//Router

const router = Router();

//Mensajeria
/*Nuevo Registro por Gmail*/
const { transporter , adminEmail } = require("../mensajeria/gmail");


//Serializacion

passport.serializeUser( ( user , done ) => {
    return done( null , user.id)
});

//Deserialializacion

passport.deserializeUser( ( id , done ) => {
    UserModel.findById( id , ( err , userDB) => {
        return done( err , userDB );
    })
});

//Estrategia para registrar usuarios

passport.use( "signupStrategy" , new LocalStrategy(
    {
        passReqToCallback: true,
        usernameField:"email"
    },
    ( req , username , password , done ) => {
        console.log( "body" , req.body );
        //Verifico si el usuario ya existe en la DB
        UserModel.findOne({ username: username} , async ( err , userDB ) => {
            if(err) return done(err , false , { message: `Hubo un error al buscar el usuario ${err}`});
            if(userDB) return done( null , false , { message: "El usuario ya existe" } );
            //Si el usuario no existe lo creo en la DB
            const salt = Number(process.env.SALT);
            const hashPassword = await bcrypt.hash( password , salt  );
            const newUser = {
                name: req.body.name,
                username: username,
                password: hashPassword,
                domicilio: req.body.domicilio,
                edad: req.body.edad,
                telefono: req.body.telefono,
                avatar: req.body.avatar
            };
            const newUserRegisteredEmail = `
                <div>
                    <h1>¡Nuevo Registro!</h1>
                    <h2>Se registro un nuevo usuario en la aplicación</h2>
                    <h3>Los datos del usuario son los siguientes:</h3>
                    <ul>
                        <li>Name:${ req.body.name }</li>
                        <li>Username:${ username }</li>
                        <li>Address:${ req.body.domicilio }</li>
                        <li>Age:${ req.body.edad }</li>
                        <li>Tel:${ req.body.telefono }</li>
                    </ul>
                </div>`
            /*Estructura del correo*/
            const mailOptions = {
                from:"Activá E-Commerce",
                to: adminEmail,
                subject: "Nuevo Registro",
                html: newUserRegisteredEmail
            }
            await transporter.sendMail( mailOptions );
            UserModel.create( newUser , ( err , userCreated ) => {
                if(err) return done( err , false , { message: "Hubo un error al crear el usuario" } )
                return done( null , false, { message: "Usuario creado" } );
            })
        })
    } 
));


passport.use("loginStrategy" , new LocalStrategy(
    {
        passReqToCallback: true,
        usernameField: "username"
    },
    ( req ,username , password , done ) => {
        UserModel.findOne( { username: username } , async ( err , userDB ) => {
            if( err ) return done( err , false , { message: `Hubo un error al buscar el usuario ${err}`});
            if( !userDB ) return done( null , false , { message: "El usuario no esta registrado" } );
            const validPassword = await bcrypt.compare( password , userDB.password );
            if ( validPassword === false ) return done( err , false , { message: "El usuario y la contraseña no coinciden con un usuario registrado"} );
            return done( null , userDB , { message: "El usuario esta ok"})
        })
    }
));



//Endpoints

/*GET*/

router.get("/registro" , userNotLogged , ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        const errorMsg = req.session.messages ? req.session.messages[0] : "";
        /*res.render( "signup" , { error: errorMsg } );*/
        res.send({ message: errorMsg } )
        req.session.messages = [];
    } catch (error) {
        logger.error("Error en el get de registro");
        res.status(500).send({ message: error.message });
    }
    
});

router.get("/inicio-de-sesion"  , userNotLogged , ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        /*res.render("login");*/
        res.send("Get de inicio de sesion");
    } catch (error) {
        logger.error("Error en el get de inicio de sesion");
        res.status(500).send({ message: error.message });
    }
    
});

router.get("/login" , userNotLogged , ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        const errorMsg = req.session.messages ? req.session.messages[0] : "";
        /*res.render( "login" , { error: errorMsg } );*/
        res.send({ message: errorMsg })
        req.session.messages = [];
    } catch (error) {
        logger.error("Error en el get de login");
        res.status(500).send({ message: error.message });
    } 
});

router.get("/logout" , ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`)
        req.session.destroy((error) => {
        if (error) {
            logger.error(error);
            /*res.redirect("/")*/
            res.send( { messsage: "No se cerro la sesión correctamente" } )
        } else {
            logger.info("Se cerro la sesion correctamente");
            /*res.render("logout")*/
            res.send( { message: "Se cerro la sesíon correctamente"})
        }
    })
    } catch (error) {
        logger.error(`Error en el servidor en la ruta ${method} ${url}`);
        res.send(`Error para acceder a la ruta ${ method } ${ url }`)
    }
    
});

/*POST*/

router.post("/signup" , passport.authenticate("signupStrategy" , {
    failureRedirect: "/registro",
    failureMessage: true
}), async ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);        
        res.send("Usuario registrado")
    } catch (error) {
        logger.error("Error en el post del signup");
        res.status(500).send({ message: error.message });
    }
    
});

router.post("/login" , passport.authenticate("loginStrategy" , {
    failureRedirect: "/login",
    failureMessage: true
}) , async ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        const { username  } = req.body;
        req.session.username = username;
        const usuarioArr = await UserModel.find( { username : username });
        const usuarioObj = usuarioArr[0];
        const usuarioName = usuarioObj.name;
        const usuarioTel = usuarioObj.telefono;
        req.session.userName = usuarioName;
        req.session.telefono = usuarioTel;
        console.log( "Telefono usuario:" , usuarioTel )
        jwt.sign({ username: username } , "claveToken" , { expiresIn:"7d"} , ( error , token ) => {
            req.session.acces_token = token;
            logger.info(`Token de la session: ${ req.session.acces_token }` )
        });
        res.send({message:`Usuario autorizado: ${ username }`})
    } catch (error) {
        logger.error("Error en la autorizacion de ingreso de usuario");
        res.status(500).send({ message: error.message });
    }
});



module.exports = { AuthRouter: router };