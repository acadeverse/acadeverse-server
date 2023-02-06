import admin from 'firebase-admin';

var serviceAccount = require("../../../firebase-service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;