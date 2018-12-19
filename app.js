/* Requerimientos */
const express = require('express');
const ejs = require('ejs');
var bodyParser = require('body-parser');
var firebase = require('firebase');
var admin = require('firebase-admin');
var cookieParser = require('cookie-parser');
var session = require('express-session');





/* FireBase Configuration */
var serviceAccount = require('./credenciales.json');
var testfire = admin.initializeApp({
  authDomain: "granaroutesaplicacion.firebaseapp.com",
  credential: admin.credential.cert(serviceAccount),
  apiKey: "AIzaSyDSQLVtFMbLE7REo5uFSVOxxfcnM4Q7MUI",
  databaseURL: 'https://granaroutesaplicacion.firebaseio.com',
  projectId: "granaroutesaplicacion",
    storageBucket: "granaroutesaplicacion.appspot.com",
    messagingSenderId: "576250634726"
});

/*firebase.initializeApp({
    apiKey: 'AIzaSyDSQLVtFMbLE7REo5uFSVOxxfcnM4Q7MUI',
    authDomain: 'granaroutesaplicacion.firebaseapp.com'
  });*/

console.log('[*]Base de Datos '+testfire.name+' inicializada.');
// Acceso data - Ejemplo
// var db = admin.database();
// var ref = db.ref("/");
// ref.once("value", function(snapshot) {
// 	console.log(snapshot.val());
// });

/* Create the APP */
const app = express();

/* APP configuration */
app.use(express.static(__dirname + '/public')); // If it doesn't find resoruces, GOTO public
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser()); //To be able to parse cookies
app.use(session({secret: "Shh, its a secret!"})); //To maintain open sessions
app.set('view engine', 'ejs');

/* Render pages */
// indice
app.get('/', (req, res) => res.render('index'));
app.get('/index', (req, res) => res.render('index'));

// login
app.get('/login', (req, res) => res.render('login'));

// register
app.get('/register', (req, res) => res.render('registrarse'));

//Consulta a la BD para caragar todas las rutas
app.get('/listaRutas', function (req, res, next) {
  var db = admin.database();
  var ref = db.ref("rutas");
  //Se cargan las rutas
  res.render('listaRutas', {ref: ref});

});

// proponerRutas
app.get('/newRoute', (req, res) => res.render('proponerRuta'));

// vista Ruta
app.get('/ruta', function(req, res){
	var nombre = req.query.nombreruta || " ";
	var db = admin.database();
	var ref = db.ref("rutas/"+nombre);
	var lugares = db.ref("lugares/");

	res.render('ruta', {ref :ref, lugares:lugares});
});

//iniciar sesion del Usuario

app.all('/pruebalogin', (req, res) => {
  // Get the ID token passed and the CSRF token.
  const idToken = req.body.cookie;
  //const csrfToken = req.body.csrfToken.toString();

  console.log ("EL ID TOKEN ES: "+ idToken);
  //console.log ("EL CSRF TOKEN ES: "+ csrfToken);

  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  // Create the session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  // To only allow session cookie setting on recent sign-in, auth_time in ID token
  // can be checked to ensure user was recently signed in before creating a session cookie.
  admin.auth().createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
    // Set cookie policy for session cookie.
    console.log("LA SESSION COOKIE ES: " + sessionCookie);
    const options = {maxAge: expiresIn, httpOnly: true, secure: true, resave:true};
    //res.cookie('session', sessionCookie, options);
    req.session.usuario = sessionCookie;
    res.render('prueba_login');
    res.end(JSON.stringify({status: 'success'}));

    console.log ("Hasta luego Maricarmen");
  }, error => {
    res.status(401).send('UNAUTHORIZED REQUEST!');
  });
});




app.get('/profile', (req, res) => {
  var sessionCookie = req.session.usuario || '';
  console.log("LA COOKIE: "+sessionCookie);
  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  var uid;
  admin.auth().verifySessionCookie(sessionCookie).then(function(decodedToken) {
    uid = decodedToken.uid;
    console.log ("EL uid es: " + uid);
    //res.render('profile') ;
    serverContentForUser('profile', req, res, uid);
  }).catch(error => {
    // Session cookie is unavailable or invalid. Force user to login.
    res.redirect('/login');
  });

});


function serverContentForUser(url, req, res, uid){
  admin.auth().getUser(uid)
  .then(function(userRecord) {
    // See the UserRecord reference doc for the contents of userRecord.
    res.send('El nombre del usuario es ' + userRecord.email);
    res.render(url) ;
    console.log("Successfully fetched user data:", userRecord.toJSON());
  })
  .catch(function(error) {
    console.log("Error fetching user data:", error);
  });
}






app.get('/prueba_login', (req, res) => res.render('prueba_login'));

/* GESTOR */
// Menu
app.get('/gestor', (req, res) => res.render('gestor'));

// Sugerencias
app.get('/listaProposiciones', (req, res) => res.render('listaProposiciones'));

// Crear Ruta - Formulario
app.get('/crearRuta', function(req, res, next){
  var db = admin.database();
  var ref = db.ref("lugares");
  res.render('crearRuta', { ref : ref });
});

// Crear Ruta - Procesamiento y Update BaseDatos
app.post('/crearRuta', (req, res) => {
  /* Variables Auxiliares */
  var f_para = req.body;
  var f_valida = true;
  var nueva_ruta = {}

  /* Comprueba que estan todos los parametros || TODO : Comprobar formato INPUT */
  // Titulo
  if(!f_para.hasOwnProperty('titulo') || f_para.titulo.length <= 0) {
    f_valida = false;
  }
  // Descripcion
  if(!f_para.hasOwnProperty('descripcion') || f_para.titulo.length <= 0) {
    f_valida = false;
  }
  // Descripcion
  if (!f_para.hasOwnProperty('imagen') || f_para.imagen.length <= 0) {
    f_valida = false;
  }
  // Url's
  if(!f_para.hasOwnProperty('mapaAndroid') ||
     !f_para.hasOwnProperty('mapaWEB') ||
     f_para.mapaAndroid.length <= 0 ||
     f_para.mapaWEB.length <= 0) {
    f_valida = false;
  }
  // Lugares
  if(!f_para.hasOwnProperty('lugares') || !Array.isArray(f_para.lugares)) {
    f_valida = false;
  }
  // Grupos
  if(!f_para.hasOwnProperty('grupos')){
    f_valida = false;
  }

  if(!f_valida) {
    // Si el formato no es valido saca mensaje
    // TODO : Render pagina anterior con campos erroneos resaltados en rojo
    res.send('Por favor vuelva a rellenar el formulario y \
    no deje ningún campo en blanco. Ten en cuenta que las rutas deben estar formadas por al menos dos lugares. <a href="/crearRuta">Atrás</a>');
  }

  /* Genera el Obj para subirlo a FireBase */
  // Objeto básico
  nueva_ruta[f_para.titulo] = {
    descripcion : f_para.descripcion,
    map : f_para.mapaAndroid,
    mapWeb : f_para.mapaWEB,
    nombre : f_para.titulo,
    img : f_para.imagen
  }
  // Añadir los grupos || Razón -> Añadir booleano al value de la key
  nueva_ruta[f_para.titulo].grupos = {};
  for (const key in f_para.grupos) {
    if (f_para.grupos.hasOwnProperty(key)) {
      nueva_ruta[f_para.titulo].grupos[key] = true;
    }
  }
  // Añadir los lugares || Razón -> Pasar de Array a Objeto y añadir booleano
  nueva_ruta[f_para.titulo].lugares = {};
  f_para.lugares.forEach(element => {
    nueva_ruta[f_para.titulo].lugares[element] = true;
  });

  /* Subir la nueva ruta a FireBase */
  // Coje instancia de FireBase y colocate en rutas
  var rutasRef = admin.database().ref('rutas');

  // Sube la nueva Ruta
  rutasRef.update(nueva_ruta);

  // Mensaje todo ha salido bien
  res.send('Ruta añadida correctamente! Siga el <a href="/gestor">enlace</a> para volver al menu.');

});

// Crear Lugar - Formulario
app.get('/crearLugar', (req, res) => res.render('crearLugar'));

// Crear Lugar - Procesamiento y Update BaseDatos
app.post('/crearLugar', (req, res) => {

  // Variables Auxiliares
  var f_para = req.body;
  var f_valida = true;
  var nuevo_lugar = {};

  /* Comprueba que estan todos los parametros || TODO : Comprobar formato INPUT */
  // Nombre
  if(!f_para.hasOwnProperty('nombre') || f_para.nombre.length <= 0) {
    f_valida = false;
  }
  // Descripción
  if(!f_para.hasOwnProperty('descripcion') || f_para.descripcion.length <= 0) {
    f_valida = false;
  }

  if(!f_valida) {
    console.log('cagada');
    // Si el formato no es valido saca mensaje
    // TODO : Render pagina anterior con campos erroneos resaltados en rojo
    res.send('Por favor vuelva a rellenar el formulario y \
    no deje ningún campo en blanco. <a href="/crearLugar">Atrás</a>');
  }

  /* Genera el Obj para subirlo a FireBase */
  nuevo_lugar[f_para.nombre] = {
    descripcion : f_para.descripcion
  };

  /* Subir el nuevo lugar a FireBase */
  // Coje instancia de FireBase y colocate en lugares
  var lugaresRef = admin.database().ref('lugares');

  // Sube el nuevo lugar
  lugaresRef.update(nuevo_lugar);

  // Mensaje todo ha salido bien
  res.send('Lugar añadida correctamente! Ahora tendira que verlo en el \
  <a href="/crearRuta">formulario</a> de creación de Rutas.');
});

/* USUARIOS */
// Modificar Usuario
app.get('/modificarUsuario', function(req, res){
    var user; //= admin.auth().currentUser;    <------- FALTARIA QUE ESTO FUNCIONARA

    admin.auth().getUserByEmail('juliorodri8@hotmail.com').then( function(usuario){
        //console.log("Successfully fetched user data:", usuario.toJSON());
        user= usuario.toJSON();
        var db = admin.database();
	    var ref = db.ref("usuarios/"+user.uid);
        //console.log("Usuario "+ user.uid);

	    res.render('modificarUsuario', {ref :ref});
    });


    //var user = firebase.auth().currentUser;

});

app.post('/modificarUsuario', (req, res) => {

  // Variables Auxiliares
  var f_para = req.body;
  var f_valida = true;
  var password = false;

  /* Comprueba que estan todos los parametros || TODO : Comprobar formato INPUT */
  // Nombre
  if(!f_para.hasOwnProperty('nombre') || f_para.nombre.length <= 0) {
    f_valida = false;
  }
  // apellidos
  if(!f_para.hasOwnProperty('apellidos') || f_para.apellidos.length <= 0) {
    f_valida = false;
  }
  // email
  if(!f_para.hasOwnProperty('email') || f_para.email.length <= 0) {
    f_valida = false;
  }
    // email
  if(f_para.passwordnueva1.length > 0 && (f_para.passwordnueva1 == f_para.passwordnueva2)) {
    //f_valida = false;
    password=true;
  }


  if(!f_valida) {
    console.log('cagada');
    // Si el formato no es valido saca mensaje
    // TODO : Render pagina anterior con campos erroneos resaltados en rojo
    res.send('Por favor vuelva a rellenar el formulario y \
    no deje ningún campo en blanco. <a href="/modificarUsuario">Atrás</a>');
  }else{

      var user;

      admin.auth().getUserByEmail('juliorodri8@hotmail.com').then( function(usuario){

            user= usuario.toJSON();
            var db = admin.database();
	        var ref = db.ref("usuarios/"+user.uid);

            //Lo de abajo esta metido aquí
            var usuarioRef = admin.database().ref('usuarios/'+user.uid);

              usuarioRef.set({
                nombre: f_para.nombre ,
                apellidos: f_para.apellidos,
                email: f_para.email
              });

              admin.auth().updateUser( user.uid, {
                  displayName: f_para.nombre,
                  email: f_para.email,
                }).then(function() {
                  // Update successful.
                  console.log("Usuario modificado correctamente");
                }).catch(function(error) {
                  // An error happened.
                });



            if(password){

                admin.auth().updateUser( user.uid, {
                  password: f_para.passwordnueva1
                }).then(function() {
                  // Update successful.
                  console.log("Contraseña modificada correctamente");
                }).catch(function(error) {
                  // An error happened.
                });

            }



              // Mensaje todo ha salido bien
              res.send('Datos modificados correctamente \
              <a href="/modificarUsuario">Visualizar usuario</a>');
            });

     }
});

/* 404 Not found */
app.use(function(req, res, next) {
    // Even if it doesn't find the page, show index
    res.status(404).render('index');
});

/* Start the server */
app.listen(8008);
console.log('Express server listening on port 8080.');
