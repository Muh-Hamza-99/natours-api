const multer = require("multer");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) cb(null, true);
    else cb(new AppError("Not of an image file format! Please upload images only!", 422));
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

module.exports = upload;