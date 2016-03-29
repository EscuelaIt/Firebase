angular
  .module("angularFireApp", ['firebase'])
  .controller("AngularFireController", function($firebaseObject, $firebaseArray, $firebaseAuth, $scope){
    var ref = new Firebase("https://yep.firebaseio.com/usuarios/0owH4289-3123-4064-887f-b7ce62cdkwjw");

    var vm = this;
    vm.perfil = $firebaseObject(ref);
    vm.perfil.$bindTo($scope, "perfil2");
    vm.objCursoEditar = false;
    vm.mensajeAutenticado = "";
    vm.registrousuario = {};
    vm.autenticado = false;
    vm.loginusuario = {};

    this.perfil.$loaded(function(){
      //alert(vm.perfil.nombre);
      vm.perfil.nombre = 'pepito';
      vm.perfil.$save();
    });

    vm.guardar = function() {
      vm.perfil.$save()
        .then(function(){
          alert('todo correcto');
        }) ;
    }


    var refCursos = new Firebase("https://yep.firebaseio.com/cursos");
    vm.cursos = $firebaseArray(refCursos);

    vm.altaCurso = function() {
      vm.cursos.$add(vm.cursoAlta);
    }

    vm.cursoEditar = function(curso){
      vm.objCursoEditar = curso;
    }
    vm.guardarCursoEditado = function(){
      vm.cursos.$save(vm.objCursoEditar);
    }
    vm.cursoBorrar = function(curso) {
      vm.cursos.$remove(curso);
    }


    function msg(txt, clase){
      vm.mensajeAutenticado = txt;
      vm.mensajeClass = clase;
    }

    var objAuth = $firebaseAuth(ref);

    vm.registrarUsuario = function() {
      if(!vm.registrousuario.nombre || vm.registrousuario.nombre.length <= 2){
        msg("Error: No he recibido el nombre", "msgerror");
        return false;
      }
      objAuth.$createUser(vm.registrousuario)
        .then(function(userData) {
          msg("todo correcto " + userData.uid, "msgcorrecto");
          objAuth.$authWithPassword(vm.registrousuario)
            .then(function(userData) {
              msg("Usuario logueado " + userData.uid, "msgcorrecto");
              crearDatosUsuario(userData.uid);
            });
        })
        .catch(function(error) {
          msg("Error: " + error.message, "msgerror");
        })
    }

    function crearDatosUsuario(uid){
      var refNuevoUser = new Firebase("https://yep.firebaseio.com/users/" + uid);
      var objPerfil = {
        nombre: vm.registrousuario.nombre,
        apellidos: vm.registrousuario.apellidos,
        email: vm.registrousuario.email,
        provider: "password",
      }
      refNuevoUser.set(objPerfil);
    }
    vm.loguearUsuario = function(){
      objAuth.$authWithPassword(vm.loginusuario)
        .then(function(userData) {
          msg("Usuario logueado " + userData.uid, "msgcorrecto");
        })
        .catch(function(error) {
          msg("Error de logueo: " + error.message, "msgerror");
        })
    }

    objAuth.$onAuth(function(authData){
      if(authData) {
        vm.autenticado = true;
      } else {
        vm.autenticado = false;
      }
    });

    vm.dologout = function(){
      objAuth.$unauth();
    }

    var refraiz = new Firebase("https://yep.firebaseio.com/");

    vm.logtwitter = function(){
      objAuth.$authWithOAuthPopup("twitter")
        .then(function(authData){
          msg("Realizado login con Twitter", "msgcorrecto");
          procesarPrimerAccesoTwitter();
        })
        .catch(function(error) {
          msg("Fallo en el login! " + error.code, "msgerror");
        })

//       function procesarPrimerAccesoTwitter(){
//         var auth = refraiz.getAuth();
//         if (auth) {
//           if (auth.provider === "twitter"){
//             var refUser = refraiz.child("usuarios/" + auth.uid);
//             refUser.on("value", function(snapUser){
//               if(! snapUser.val()) {
//                 // no tenemos ese uid, tengo que setearlo
//                 console.log("auth", auth);
//                 refUser.set({
//                   nombre: auth.twitter.displayName,
//                   apellidos: "",
//                   usuario: auth.twitter.username
//                 });
//               }
//             })
//           }
//         }
//       }

      function procesarPrimerAccesoTwitter(){
        var auth = objAuth.$getAuth();
        if (auth) {
          if (auth.provider === "twitter"){
            var refUser = refraiz.child("usuarios/" + auth.uid);
            var objUser = $firebaseObject(refUser);
            objUser.$loaded().then(function() {
              if(objUser.$value == null && typeof(objUser.$value) != 'undefined') {
                // no tenemos ese uid
                console.log("no tenemos ese usuario", objUser.$value, objUser);
                objUser.nombre = auth.twitter.displayName;
                objUser.apellidos = "";
                objUser.usuario = auth.twitter.username;
                objUser.$save();
              }
            });
          }
        }
      }
    }

    vm.logfacebook = function(){
      objAuth.$authWithOAuthPopup("facebook", {
        scope: "public_profile,email"
      })
        .then(function(authData){
          msg("Realizado login con Facebook", "msgcorrecto");
          procesarPrimerAccesoFacebook();
        })
        .catch(function(error) {
          msg("Fallo en el login! " + error.code, "msgerror");
        })

      function procesarPrimerAccesoFacebook() {
        var auth = refraiz.getAuth();
        if (auth) {
          if (auth.provider === "facebook"){
            var refUser = refraiz.child("usuarios/" + auth.uid);
            refUser.on("value", function(snapUser){
              if(! snapUser.val()) {
                // no tenemos ese uid, tengo que setearlo
                console.log("auth", auth);
                refUser.set({
                  nombre: auth.facebook.cachedUserProfile.first_name,
                  apellidos: auth.facebook.cachedUserProfile.last_name,
                  email: auth.facebook.email
                })
              }
            })
          }
        }
      }
    }

    vm.loggithub = function(){
      objAuth.$authWithOAuthPopup("github")
        .then(function(authData){
          msg("Realizado login con GitHub", "msgcorrecto");
          procesarPrimerAccesoGithub();
        })
        .catch(function(error) {
          msg("Fallo en el login! " + error.code, "msgerror");
        })

      function procesarPrimerAccesoGithub(){
        var auth = refraiz.getAuth();
        if (auth) {
          if (auth.provider === "github"){
            var refUser = refraiz.child("usuarios/" + auth.uid);
            refUser.on("value", function(snapUser){
              if(! snapUser.val()) {
                // no tenemos ese uid, tengo que setearlo
                console.log("auth", auth);
                refUser.set({
                   nombre: auth.github.displayName,
                   apellidos: "",
                   usuario: auth.github.username,
                   email: auth.github.email,
                });
              }
            })
          }
        }
      }
    }

    vm.loggoogle = function(){
      objAuth.$authWithOAuthPopup("google", { scope: "email" })
        .then(function(authData){
          msg("Realizado login con Google", "msgcorrecto");
          procesarPrimerAccesoGoogle();
        })
        .catch(function(error) {
          msg("Fallo en el login! " + error.code, "msgerror");
        })

      function procesarPrimerAccesoGoogle(){
        var auth = refraiz.getAuth();
        if (auth) {
          if (auth.provider === "google"){
            var refUser = refraiz.child("usuarios/" + auth.uid);
            refUser.on("value", function(snapUser){
              if(! snapUser.val()) {
                // no tenemos ese uid, tengo que setearlo
                console.log("auth", auth);
                 refUser.set({
                    nombre: auth.google.cachedUserProfile.given_name,
                    apellidos: auth.google.cachedUserProfile.family_name,
                    email: auth.google.email
                });
              }
            })
          }
        }
      }
    }
  });
