function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function postIdTokenToSessionLogin(url, idToken, csrfToken){
  return $.ajax({
        type: 'POST',
        url: url,
        data: {
            idToken: idToken,
            csrfToken: csrfToken
        },
        contentType: 'application/x-www-form-urlencoded'
    });
}

function inicializarFirebase(){
  firebase.initializeApp({
    apiKey: 'AIzaSyDSQLVtFMbLE7REo5uFSVOxxfcnM4Q7MUI',
    authDomain: 'granaroutesaplicacion.firebasepp.com'
  });

  alert("Ha leido el fichero");
}

function signIn(){
  alert("Iniciando sesión");

  var email_usuario = document.getElementById('email_usuario').value;
  alert ("El email es: "+ email_usuario);
  var pass_usuario = document.getElementById('pass_usuario').value;

  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

//   alert("Vamos a iniciar sesión");
//   firebase.auth().signInWithEmailAndPassword(email_usuario, pass_usuario).then(user => {
//   // Get the user's ID token as it is needed to exchange for a session cookie.
//   alert("Amos a ver");
//   return user.getIdToken(true).then(idToken => {
//     // Session login endpoint is queried and the session cookie is set.
//     // CSRF protection should be taken into account.
//     // ...
//     alert("Correcto");
//     const csrfToken = getCookie('csrfToken')
//     return postIdTokenToSessionLogin('/sessionLogin', idToken, csrfToken);
//   });
// }).then(() => {
//   alert("A tomar viento");
//   // A page redirect would suffice as the persistence is set to NONE.
//   return firebase.auth().signOut();
// }).then(() => {
//   alert("Al perfil");
//   window.location.assign('/profile');
// });
firebase.auth().signInWithEmailAndPassword(email_usuario, pass_usuario);

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    return user.getIdToken(true).then(idToken => {
        // Session login endpoint is queried and the session cookie is set.
        // CSRF protection should be taken into account.
        // ...
        alert("Correcto");
        var csrfToken = getCookie('csrfToken')
        return postIdTokenToSessionLogin('/pruebalogin', idToken, csrfToken);
      });
  } else {
    // No user is signed in.
  }
});

}

inicializarFirebase();
