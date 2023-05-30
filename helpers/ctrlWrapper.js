const ctrlWrapper = ctrl => {
    const func = async(req, res, next) => {
        try {
            await ctrl(req, res, next); 
        }
        catch (error) {
            next(error);
            // const { status = 500, message = "ServerError" } = error;
            // res.status(status).json({message,})
        }
    }

    return func;
}

module.exports = ctrlWrapper;