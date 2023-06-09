const handleMongooseError = (error, data, next) => {
    const {name, code} = error;
    const status = (name === "MongoServerError" && code === 11000) ? 409 : 400;
    error.status = status;
    next()
};

module.exports = handleMongooseError;

// const bcrypt = require('bcrypt');

// const createHashPassword = async (password) => {
//     const result = await bcrypt.hash(password, 10);
//     console.log(result);
// const compareResult = await bcrypt.compare(password, result);
// }

// createHashPassword("a12345");