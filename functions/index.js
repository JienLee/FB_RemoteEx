const functions = require('firebase-functions');
const admin = require('firebase-admin');
const uuid = require('uuid');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
 });

exports.splash = functions.https.onRequest((request, response) => {
   const original = request.query.type;
   // admin.database().ref("/app_splash").push({original: original}).then(snapshot => {
   //     response.redirect(303, snapshot.ref);
   // });
   if (!original) {
       return reseponse.status(503).send("original error");
   }

   const dbRef = admin.database().ref("/app_splash");
   if (original.toString() == 'android') {
       const andRef = dbRef.child("ad_splash");
       andRef.once("value").then(function(snapshot) {
           let json = JSON.stringify(snapshot.val().ad_splash);
           return response.status(200).send(json);
       });
   } else {
       const iosRef = dbRef.child("ios_splash");
       iosRef.once("value").then(function(snapshot) {
           let json = JSON.stringify(snapshot);
           return  response.status(200).send(json);
       });
   }
});

exports.makeUppercase = functions.database.ref("/app_splash/ad_splash").
    onWrite(event => {
        const original = event.data.val();
        console.log('Uppercasing', event.params.ad_splash, original);
        const uppercase = original.toUpperCase();
        return event.data.ref.child('ad_splash').set(uppercase);
    });

exports.monitorSplash = functions.storage.object().onChange(event => {
  const object = event.data;
  const fileBucket = object.bucket;
  const filePath = object.name;
  const contentType = object.contentType;
  const resourceState = object.resourceState;
  const metageneration = object.metageneration;

  if (contentType.startsWith('text/html')){
    if (resourceState === 'exists' && metageneration > 1) {
      console.log('This is a metadata chagne event');
      console.log('storage chage bucket : '+fileBucket+', path : '+filePath);
      return;
    }
  }
});