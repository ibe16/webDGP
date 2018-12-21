// Gestion Usuarios
// ================
module.exports = {

  /* Crear Usuario en la base de datos */
  crearUsuario: function(firebase, admin, parametros) {
    var user_data = {};
    // Crear Usuario modo correo - passwd en Firebase
    firebase.auth().createUserWithEmailAndPassword(parametros.email, parametros.passwd).catch(function (error) {
      console.log(error.message);
      return false;
    }).then(() => {
        // Crea entrada en la base de datos para los datos del usuario
        admin.auth().getUserByEmail(parametros.email).then((usuario) => {
  
          var user = usuario.toJSON();
  
          user_data[user.uid] = {
            appellidos: parametros.apellidos,
            email: user.email,
            nombre: parametros.nombre
          };

          var db = admin.database().ref('usuarios');
          db.update(user_data);
        }).catch((error) => {
          console.log(error);
        });

        return true;
      }
    );
  },

}