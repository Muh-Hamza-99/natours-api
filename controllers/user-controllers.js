// const fs = require("fs");
// const util = require("util");

const User = require("./../models/User");

const APIFeatures = require("./../utilities/api-features");
const AppError = require("./../utilities/app-error");
const catchAsync = require("./../utilities/catch-async");
// const { uploadFile, deleteFile } = require("./../utilities/S3");

// const unlinkFile = util.promisify(fs.unlink);

const filterObject = (object, ...allowedFields) => {
    const newObject = {};
    Object.keys(object).forEach(key => {
        if (allowedFields.includes(key)) newObject[key] = object[key];
    });
};

// const checkFileTypes = file => {
//     const fileTypes = ["png", "jpeg", "jpg"];
//     const imageType = file.mimetype.split("/")[1];
//     for (let fileType of fileTypes) if (fileType === imageType) return true;
//     return false;
// };

const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

const updateMe = catchAsync(async (req, res, next) => {
    const { id } = req.user;
    if (req.body.password || req.body.passwordConfirm) return next(new AppError("This route is not for password updates. Please use /updateMyPassword.", 400));
    const filteredBody = filterObject(req.body, "name", "email");
    if (req.file) filteredBody.photo = req.file.filename;
    // const { file } = req;
    // if (!file) return next(new AppError("No file found!", 404));
    // if (!(checkFileTypes(file))) {
    //     await unlinkFile(file.path);
    //     return next(new AppError("Invalid file type!", 422));
    // };
    // const result = await uploadFile(file);
    // if (result) await unlinkFile(file.path);
    const user = await User.findByIdAndUpdate(id, filteredBody, { runValidators: true, new: true });
    res.status(200).json({ status: "success", data: { user } });
});

const deleteMe = catchAsync(async (req, res, next) => {
    const { id } = req.user;
    await User.findByIdAndUpdate(id, { active: false });
     // await deleteFile(user.photo);
    res.status(204).json({ status: "success", data: null });
});

const getAllUsers = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const users = await features.query;
    res.status(200).json({ status: "success", results: users.length, data: { users } });
});

const getOneUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return next(new AppError("No user with the provided ID!", 404));
    res.status(200).json({ status: "success", data: { user }});
});

const updateUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, filteredBody, { runValidators: true, new: true });
    if (!user) return next(new AppError("No user with the provided ID!", 404));
    res.status(200).json({ status: "success", data: { user } });
});

const deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return next(new AppError("No user with the provided ID!", 404));
    res.status(204).json({ status: "success", data: null });
});

module.exports = {
    updateMe,
    deleteMe,
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser,
};