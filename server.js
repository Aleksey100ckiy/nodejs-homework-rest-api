const mongoose = require('mongoose');

const app = require('./app')

const DB_HOST = 'mongodb+srv://OleksiiStotskiy:e95Y%40LgF3Gnf6Hm@cluster0.av1koc0.mongodb.net/db_contacts';

mongoose.set('strictQuery', true);
  

mongoose.connect(DB_HOST)
  .then(() => {
    app.listen(3000);
    console.log("Server running. Use our API on port: 3000");
    console.log("Database connection successful");
  })
  .catch(error => {
    console.log(error.message);
    process.exit(1);
  });

// app.listen(3000, () => {
//   console.log("Server running. Use our API on port: 3000")
// })
