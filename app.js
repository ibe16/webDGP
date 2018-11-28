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
// idice
app.get('/', (req, res) => res.render('index'));
app.get('/index', (req, res) => res.render('index'));

// login
app.get('/login', (req, res) => res.render('login'));

// register
app.get('/register', (req, res) => res.render('registrarse'));

// listado Rutas
//app.get('/list', (req, res) => res.render('listaRutas'));

app.get('/listaRutas', function (req, res, next) {
  var db = admin.database();
  var ref = db.ref("rutas");
  res.render('listaRutas', { ref: ref});
});

// proponerRutas
app.get('/newRoute', (req, res) => res.render('proponerRuta'));

// vista Ruta
app.get('/ruta', (req, res) => res.render('ruta'));

/* 404 Not found */
app.use(function(req, res, next) {
    // Even if it doesn't find the page, show index
    res.status(404).render('index');
});

/* Start the server */
app.listen(8008);
console.log('Express server listening on port 8008.');
