const bcrypt = require('bcryptjs');

// Require mongoose to interact with MongoDB
const mongoose = require('mongoose');

// Create a new Schema for the User model
const Schema = mongoose.Schema;

// Define the userSchema according to the given specification
const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true // Ensure this value is unique
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    loginHistory: [{
        dateTime: {
            type: Date,
            default: Date.now
        },
        userAgent: {
            type: String
        }
    }]
});

// Declare User variable to be defined during the database connection initialization
let User; // To be defined on new connection

// Create a model for the User using the defined schema (this will be done in the initialize function)
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        // Use the connection string you have for MongoDB Atlas
        let db = mongoose.createConnection("mongodb+srv://jrbozar:G9f40oO3dvaUT7Hz@seneca.lgpil.mongodb.net/?retryWrites=true&w=majority");

        // Handling connection errors
        db.on('error', (err) => {
            reject(err); // Reject the promise with the provided error
        });

        // Once the connection is open, define the User model
        db.once('open', () => {
            User = db.model("users", userSchema); // Use the userSchema defined earlier
            resolve(); // Resolve the promise once the model is created
        });
    });
};

// Register user
module.exports.registerUser = function (userData) {
  return new Promise(function (resolve, reject) {
      // Validate if the passwords match
      if (userData.password !== userData.password2) {
          reject("Passwords do not match");
          return; // Stop execution here if passwords don't match
      }

      // Hash the password before saving
      bcrypt.hash(userData.password, 10)
          .then(hash => {
              userData.password = hash; // Set the hashed password

              // Create a new user from the userData object
              let newUser = new User(userData);

              // Save the new user to the database using promises
              newUser.save() // No callback, now using promise
                  .then(() => resolve())
                  .catch((err) => {
                      // Handle duplicate key error (userName already exists)
                      if (err.code === 11000) {
                          reject("User Name already taken");
                      } else {
                          // Handle other types of errors
                          reject("There was an error creating the user: " + err);
                      }
                  });
          })
          .catch(err => {
              reject("There was an error encrypting the password: " + err);
          });
  });
};

// Check user credentials
module.exports.checkUser = function (userData) {
  return new Promise(function (resolve, reject) {
      // Find the user by userName
      User.find({ userName: userData.userName })
          .then(function (users) {
              // If no user is found
              if (users.length === 0) {
                  reject("Unable to find user: " + userData.userName);
                  return; // Stop execution if no user is found
              }

              // Compare the hashed password stored in the database with the entered password
              bcrypt.compare(userData.password, users[0].password).then((result) => {
                  if (!result) {
                      reject("Incorrect Password for user: " + userData.userName);
                      return; // Stop execution if the password doesn't match
                  }

                  // If the password matches, record the loginHistory
                  let user = users[0]; // Assuming there's only one user
                  user.loginHistory.push({
                      dateTime: (new Date()).toString(),
                      userAgent: userData.userAgent
                  });

                  // Use save() instead of update()
                  user.save() // Save the updated user document
                      .then(function () {
                          resolve(user); // Return the user object upon success
                      })
                      .catch(function (err) {
                          reject("There was an error verifying the user: " + err); // Handle save errors
                      });
              }).catch((err) => {
                  reject("Error comparing password: " + err); // Handle bcrypt comparison errors
              });
          })
          .catch(function () {
              reject("Unable to find user: " + userData.userName); // Handle query errors
          });
  });
};
