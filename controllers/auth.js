const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs/promises');
const jimp = require('jimp');
const { nanoid } = require('nanoid');

const { User } = require("../models/user");

const { HttpError, ctrlWrapper, sendEmail } = require("../helpers/index");

const { SECRET_KEY, PROJECT_URL} = process.env;

const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

const register = async (req, res) => {
    const { email, password, subscription = "starter" } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const verificationToken = nanoid();
    const avatarURL = gravatar.url(email);

    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL, verificationToken });

    const verifyEmail = {
        To: email,
        Subject: "Verify Email",
        HTMLPart: `<a target="_blank href ="${PROJECT_URL}/users/verify/:${verificationToken}  ">Click to verify email</a>`
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
        "user": {
            "email": newUser.email,
            "subscription": subscription,
        }
        
        
    })
}

const verify = async (req, res) => {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
        throw HttpError(404, "User not found")
    }
    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: "" });

    res.status(200).json({
        message: "Verification successful"
    })
}

const resendVerifyEmail = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(404, "User not found")
    }
    if (user.verify) {
        throw HttpError(400, "Verification has already been passed")
    }

    const verifyEmail = {
        To: email,
        Subject: "Verify Email",
        HTMLPart: `<a target="_blank href ="${PROJECT_URL}/users/verify/:${user.verificationToken}  ">Click to verify email</a>`
    };

    await sendEmail(verifyEmail);
    
    res.status(200).json({
        message: "Verification email sent"
    })
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, 'Email or password is wrong');
    }
    if (!user.verify) {
        throw HttpError(404, "User not found")
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, 'Email or password is wrong');
    }

    const payload = {
        id: user._id,
    }

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
        "token": token,
        "user": {
        "email": email,
        "subscription": user.subscription,
        },
    })
}

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.status(204).json({
        message: 'No Content'
    })
}

const getCurrent = async (req, res) => {
    const { email, subscription } = req.user;
    res.status(200).json({
        "email": email,
        "subscription": subscription,
    },
    )
}


const updateAvatar = async (req, res) => {
    const { _id } = req.user;
    const { path: tmpUpload, originalname } = req.file;
    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);
    const tmpPath = req.file.path;
    const img = await jimp.read(tmpPath);
    await img.resize(250, 250).write(tmpPath);
    await fs.rename(tmpUpload, resultUpload);
    const avatarURL = path.join('avatars', filename);
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.json({
        avatarURL,
    })
}

module.exports = {
    register: ctrlWrapper(register),
    verify: ctrlWrapper(verify),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar:ctrlWrapper(updateAvatar),
}