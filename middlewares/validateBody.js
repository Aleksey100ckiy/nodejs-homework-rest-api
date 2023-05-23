const { HttpError } = require("../helpers");

const validateBody = schema => {
    const func = (req, res, next) => {
        const { error } = schema.validate(req.body);
    if (!Object.keys(req.body).length) {
      throw HttpError(400, "missing fields");
    }
    if (error) {
       next(HttpError(400, `missing ${ error.message } field`));
    }
        next();
        
    }
    return func;
}

module.exports = validateBody;