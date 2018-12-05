/* Requeriments */
const express = require('express');
const ejs = require('ejs');

/* firebase */
var firebase = require('firebase');
var admin = require('firebase-admin');
var serviceAccount = require('./credenciales.json');


/* Configuration */
var testfire = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://granaroutesaplicacion.firebaseio.com'
});

console.log(testfire.name);
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
app.set('view engine', 'ejs');

/* Render pages */
// indice
app.get('/', (req, res) => res.render('index'));
app.get('/index', (req, res) => res.render('index'));

// login
app.get('/login', (req, res) => res.render('login'));

// register
app.get('/register', (req, res) => res.render('registrarse'));

// listado Rutas
//app.get('/list', (req, res) => res.render('listaRutas'));

//Consulta a la BD para caragar todas las rutas
app.get('/listaRutas', function (req, res, next) {
  var db = admin.database();
  var ref = db.ref("rutas");
  //Se cargan las rutas
  res.render('listaRutas', { ref: ref});

});

// proponerRutas
app.get('/newRoute', (req, res) => res.render('proponerRuta'));

// vista Ruta
app.get('/ruta', function(req, res){
  var nombre = req.query.nombreruta || " ";
  var db = admin.database();
  var ref = db.ref("rutas/"+nombre);
  res.render('ruta', {ref :ref});
});

/* GESTOR */
// Menu
app.get('/gestor', (req, res) => res.render('gestor'));

// Sugerencias
app.get('/listaProposiciones', (req, res) => res.render('listaProposiciones'));

// Crear Ruta
app.get('/crearRuta', (req, res) => res.render('crearRuta'));


/* USUARIOS */
// Modificar Usuario
app.get('/modificarUsuario', (req, res) => res.render('modificarUsuario'));

/* 404 Not found */
app.use(function(req, res, next) {
    // Even if it doesn't find the page, show index
    res.status(404).render('index');
});

/* Start the server */
app.listen(8008);
console.log('Express server listening on port 8008.');
