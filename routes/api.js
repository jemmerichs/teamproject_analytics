var express = require('express');
var router = express.Router();
var client = require('twilio')('ACc4221e14d1d0540a89ec756b685ae93b', '1b5bbdebb51c9059ef3dd8ddb5db2a1b');
var nodemailer = require('nodemailer');
var oauth = require('xoauth2');
var gcloud = require('gcloud');
var axios = require('axios');
var smtpTransport = require('nodemailer-smtp-transport');
var smtpTransport = nodemailer.createTransport(smtpTransport({
  service: "Gmail",
  auth: {
    user: "lidlsmartshopping@gmail.com",
    pass: "lidlsmartshopping123",
  }
}));

//FIREBASE
var admin = require("firebase-admin");
var serviceAccount = require("./firebasekey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lidl-smart.firebaseio.com"
});

router.get("/send", function(req, res) {
  client.sendMessage({
    to: '+4915787295695',
    from: '+4915735984837',
    body: 'Hello World'
  }, function(err, data) {
    if (err) {
      console.log("error:", err);
    } else {
      console.log("start");
      console.log(data);
    }
  });
  res.status(200).send("Success");
});

router.post("/test", function(req, res) {
  console.log("test")
  res.status(200).send("Success!");
});



// Subscribe to the App
router.post("/subscribe", function(req, res) {
  /* Read POST Request */
  var mode = 0;
  var user = req.body;
  var number = req.body.phonenumber;
  console.log("body: %j", user);

  // Generate Random setting_key
  var settingkey1 = Math.random() * (90000 - 10000) + 10000;
  var settingkey2 = Math.floor(settingkey1);

  //Connection to Database
  var db = admin.database();
  var ref = db.ref("user");

  if (number == null) {
    mode = 1; //mail mode
    var inputmail = req.body.email_address;
    // Send Notification Email with Setting Key and Voucher //
    // Check if email address already exists

    ref.orderByChild("email_address").equalTo(inputmail).once("value", function(snapshot) {
        var userData = snapshot.val();
        if (userData) // Email already exists
        {
          console.log("Email already exists");
        } else // Email does not exist
        {
          console.log("New Email");
          WriteUserToDB();
          var mailOptions = {
            from: "lidlsmartshopping@gmail.com",
            to: req.body.email_address,
            subject: "Willkommen bei LIDL Smart Shopping!",
            generateTextFromHTML: true,
            html: "<b>Hallo!</b> Dein Verification Key lautet " + settingkey2
          };

          smtpTransport.sendMail(mailOptions, function(error, response) {
            if (error) {
              // console.log(error);
              console.log("Email not sent");
            } else {
              // console.log(response);
              console.log("Email Sent");
            }
            smtpTransport.close();
          });
        }
      },
      function(error) {
        // The Promise was rejected.
        console.error(error);
      })
  } else {
    /*
        mode = 2;
        // Send Notification SMS with Settingkey and Voucher
        // Check if email address already exists

        ref.orderByChild("phonenumber").equalTo(inputmail).once("value", function(snapshot) {
          var userData = snapshot.val();
          if (userData) // Phonenumber already exists
          {
            console.log("Email already exists");
          } else // Phonenumber does not exist
          {
            WriteUserToDB();
            client.sendMessage({
              to: user.phonenumber,
              from: '+4915735984837',
              body: "Willkommen bei LIDL Smart Shopping!!! Dein Setting Key lautet... " + settingkey2 + " Viel Erfolg "
            }, function(err, data) {
              if (err) {
                console.log(err);
                res.status(500).send("Failure");
              } else {
                console.log(data);
                res.status(200).send("Success");
              }
            });
*/
  }

  function WriteUserToDB() {
    // Write User into Firebase

    var newRef;
    switch (mode) {
      case 1:
        newRef = ref.push({
          phonenumber: "",
          id: "",
          email_address: user.email_address,
          email: user.email,
          sms: user.sms,
          whatsapp: user.whatsapp,
          setting_key: settingkey2,
        });
        res.status(201).send(user);
        break;
      case 2:
        newRef = ref.push({
          phonenumber: user.phonenumber,
          id: "",
          email_address: "",
          email: 0,
          sms: user.sms,
          whatsapp: user.whatsapp,
          setting_key: settingkey2,
        });
        res.status(201).send(user);
        break;
    }

    // Add Key to Entry
    var newID = newRef.key;
    newRef.update({
      id: newID
    })
  }
});


/* Checks if phonenumber is already subscribed */
router.get("/user/phone/:phonenumber", function(req, res) {
  /* Read POST Request */
  var phonenumber = req.params.phonenumber;
  console.log("Get User, number: " + phonenumber);

  /* Connect to Firebase */
  var db = admin.database();
  var ref = db.ref("user");

  ref.once('value', function(snapshot) {
    let found = false;
    let user;

    snapshot.forEach(function(snapshot2) {
      var obj = snapshot2.val();

      if (obj.phonenumber == phonenumber) {
        found = true;
        console.log("User found");
        user = obj;
      }
    })
    if (found == true) {
      res.status(200).json(user);
    } else {
      res.status(500).send("Failure");
      console.log("Phonenumber not subscribed");
    }

  });
});

/* Checks if email is already subscribed */
router.get("/user/mail/:email_address", function(req, res) {
  /* Read POST Request */
  var email_address = req.params.email_address;

  console.log("Get User, mail: " + email_address);

  /* Connect to Firebase */
  var db = admin.database();
  var ref = db.ref("user");

  ref.once('value', function(snapshot) {
    let found = false;
    let user;

    snapshot.forEach(function(snapshot2) {
      var obj = snapshot2.val();

      if (obj.email_address == email_address) {
        found = true;
        console.log("User found");
        user = obj;
      }
    })
    if (found == true) {
      res.status(200).json(user);
    } else {
      res.status(500).send("Failure");
      console.log("Email not subscribed");
    }

  });
});

/* Checks if phonenumber & verification combination is valid */

router.post("/checkveritel", function(req, res) {
  // Read POST Request
  var user = req.body;
  console.log("Check Verification")
  var phonenumber = user.phonenumber;
  var vericode = user.vericode;

  // Connect to Firebase //
  var db = admin.database();
  var ref = db.ref("user");

  ref.once('value', function(snapshot) {
    let found = false;
    let user;

    snapshot.forEach(function(snapshot2) {
      var obj = snapshot2.val();

      if (obj.phonenumber == phonenumber) {
        found = true;
        console.log("user found");
        user = obj;
      }
    })
    if (found == true) {
      res.status(200).json(user);
    } else {
      res.status(500).send("Failure");
      console.log("Phonenumber not subscribed");
    }

  });


  var ref = $http.get('/api/user/phone' + phonenumber)
    .map(res => res.json());

  console.log("neue ref:" + ref);
  //   var ref = db.ref('user/' + phonenumber);

  console.log(phonenumber);
  ref.once("value", function(snap) {
    if (snap.val().setting_key.toString() == vericode.toString()) {
      var body = snap.val();
      res.status(200).send(body);
      console.log("Valid Combination");
    } else {
      res.status(500).send("Failure");
      console.log("Wrong Combination");
    }
  });
});


/* Update User Settings in Firebase */
router.post("/updatesettings", function(req, res) {
  console.log("Update User");
  /* Read POST Request */
  let user = req.body;
  console.log(user);

  /* Connect to Firebase */
  var db = admin.database();
  var ref = db.ref('user/' + user.id);
  console.log("Ref: ", ref);

  ref.update({
    'phonenumber': user.phonenumber,
    'email_address': user.email_address,
    'email': user.email,
    'sms': user.sms,
    'whatsapp': user.whatsapp
  });

});

/* Create Event */
router.post("/createevent", function(req, res) {
  console.log("Create Event");
  /* Read POST Request */
  let event = req.body;
  console.log(event);

  /* Connect to Firebase */
  var db = admin.database();
  var ref = db.ref('events/current');
  console.log("Ref: ", ref);

  ref.update({
    'eventtitle': event.title,
    'timerangestart': event.start,
    'timerangeend': event.end
  });
});

/* Update Event */
router.post("/updateevent", function(req, res) {
  console.log("Update Event");
  /* Read POST Request */
  let event = req.body;
  console.log(event);

  /* Connect to Firebase */
  var db = admin.database();
  var ref = db.ref('events/current');
  console.log("Ref: ", ref);

  ref.update({
    'eventtitle': event.title,
    'timerangestart': event.start,
    'timerangeend': event.end
  });
});

/* Create Bundle1 */
router.post("/createbundle/:num", function(req, res) {
  console.log("Create Bundle");
  /* Read POST Request */
  let bundle = req.body;
  console.log(event);

  /* Connect to Firebase */
  var db = admin.database();
  var ref = db.ref('events/current/bundles/bundle1');
  console.log("Ref: ", ref);

  ref.update({
    'bundletitle': bundle.title,
    'bundledescription': bundle.description,
    'bundlepicture': bundle.picture,
    'bundlediscount': bundle.discount
  });
});


// Get all Events
router.get("/getevents", function(req, res) {
  console.log("Get Events");

  // Connect Firebase
  var db = admin.database();
  var ref = db.ref('admin/events');

  ref.once('value', function(snapshot) {
    var obj = snapshot.val();
    delete obj["bundles"];
    res.status(200).send(Object.keys(obj).map(name => obj[name]));
  });
});





module.exports = router;
