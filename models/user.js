const { Schema, model } = require('mongoose');
const argon2 = require('argon2');
const { createToken, verifyToken } = require('../services/authentication');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImg: {
        type: String,
        default: "/images/army.png",
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

    try {
        const hash = await argon2.hash(user.password);
        console.log(hash);
        user.password = hash;
        next();
    } catch (err) {
        console.log(err);
        next(err);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        const isMatch = await argon2.verify(this.password, candidatePassword);
        return isMatch;
    } catch (err) {
        console.error('Error comparing passwords:', err);
        return false;
    }
};

const User = model("Blog Users", userSchema);
module.exports = User;