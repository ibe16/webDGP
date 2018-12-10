/* Requerimientos */
const express = require('express');
const ejs = require('ejs');
var bodyParser = require('body-parser');
var firebase = require('firebase');
var admin = require('firebase-admin');




/* FireBase Configuration */
var serviceAccount = require('./credenciales.json');
var testfire = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://granaroutesaplicacion.firebaseio.com'
});
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
app.get('/modificarUsuario', (req, res) => res.render('modificarUsuario'));

/* 404 Not found */
app.use(function(req, res, next) {
    // Even if it doesn't find the page, show index
    res.status(404).render('index');
});

/* Start the server */
app.listen(8080);
console.log('Express server listening on port 8080.');
