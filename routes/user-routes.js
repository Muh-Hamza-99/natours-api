const express = require("express");
const router = express.Router();

const { 
    updateMe,
    deleteMe,
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser,
} = require("./../controllers/user-controllers");

const {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
} = require("./../controllers/auth-controllers");

const protect = require("./../middleware/protect");
const restrictTo = require("./../middleware/restrict-to");
const uploadUserPhoto = require("./../middleware/upload-user-photo");
const resizeUserPhoto = require("./../middleware/resize-user-photo");
const getMe = require("./../middleware/get-me");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

router.use(protect);

router.get("/me", getMe, getOneUser);
router.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);
router.patch("/updateMyPassword", updatePassword);
router.delete("/deleteMe", deleteMe);

router.use(restrictTo("admin"));

router
    .route("/")
    .get(getAllUsers);

router
    .route("/:id")
    .get(getOneUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;