const functions = require('firebase-functions');
const admin = require('firebase-admin');
const uuid = require('uuid');
admin.initializeApp(functions.config().firebase);

const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

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

exports.thumbnailTest = functions.storage.object().onChange(event => {
  const object = event.data;
  const fileBucket = object.bucket;
  const filePath = object.name;
  const contentType = object.contentType;
  const resourceState = object.resourceState;
  const metageneration = object.metageneration;

  if (!contentType.startsWith('image/')){
    console.log('This is not an image');
    return;
  }
  const fileName = path.basename(filePath);
  if (fileName.startsWith('thumb_')){
    console.log('Already a test');
    return;
  }

  if (resourceState === 'not_exists') {
    console.log('This is a deletion event.');
    return;
  }

  if (resourceState === 'exists' && metageneration > 1) {
      console.log('This is a metadata chagne event');
      return;
  }

  const bucket = gcs.bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const metadata = { contentType : contentType};
  return bucket.file(filePath).download({
    destination : tempFilePath
  }).then(() => {
    console.log('downloaded locally to', tempFilePath);
    return spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath]);
  }).then(() => {
    console.log('thumbnail created at ', tempFilePath);
    const thumbFileName = `thumb_${fileName}`;
    const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
    return bucket.upload(tempFilePath, {destination: thumbFilePath, metadata : metadata});
  }).then(()=>fs.unlinkSync(tempFilePath));
});

exports.changedFileTest = functions.storage.object().onChange(event => {
  const object = event.data;
  const fileBucket = object.bucket;
  const filePath = object.name;
  const contentType = object.contentType;
  const resourceState = object.resourceState;
  const metageneration = object.metageneration;


  if (!contentType.startsWith('text/')){
        console.log('This is not an text');
        return;
    }

  if (contentType.startsWith('text/html')) {
    if (resourceState === 'not_exists') {
      console.log('This is a deletion event.');
      return;
    }

    if (resourceState === 'exists' && metageneration > 1) {
      console.log('This is a metadata chagne event');
      return;
    }
        
    const bucket = gcs.bucket(fileBucket);

    const fileName= path.basename(filePath);
    console.log('fileName : ', fileName);

    var pathReference = bucket.ref(filePath+"/"+fileName);
    console.log('pathReference : ', pathReference);

    return admin.database().ref("/app_splash/changed").set(fileName, function(error){
      if (error) {
        console.log("Data could not be saved." + error);
      } else {
        console.log("Data saved successfully.");
      }
    });
  }
});
