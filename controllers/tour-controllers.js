const multer = require("multer");
const sharp = require("sharp");

const Tour = require("./../models/Tour");

const APIFeatures = require("./../utilities/api-features");
const AppError = require("./../utilities/app-error");
const catchAsync = require("./../utilities/catch-async");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) cb(null, true);
    else cb(new AppError("Not of an image file format! Please upload images only!", 422));
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadTourImages = upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 3 },
]);

const resizeTourImages = catchAsync(async (req, res, next) => {
    const { files } = req;
    if (!files.imageCover || !files.images) return next();
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);
    req.body.images = [];
    await Promise.all(files.image.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename);
    }));
});

const getAllTours = catchAsync(async (req, res) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;
    res.status(200).json({ status: "success", results: tours.length, data: { tours }});
});

const getOneTour = catchAsync(async (req, res) => {
    const { id } = req.params;
    const tour = await Tour.findById(id).populate("reviews");
    if (!tour) return next(new AppError("No tour with the provided ID!", 404));
    res.status(200).json({ status: "success", data: { tour }});
});

const createTour = catchAsync(async (req, res) => {
    const tour = await Tour.create(req.body);
    res.status(201).json({ status: "success", data: { tour } });
});

const updateTour = catchAsync(async (req, res) => {
    const { id } = req.params;
    const tour = await Tour.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!tour) return next(new AppError("No tour with the provided ID!", 404));
    res.status(200).json({ status: "success", data: { tour } });
});

const deleteTour = catchAsync(async (req, res) => {
    const { id } = req.params;
    const tour = await Tour.findByIdAndDelete(id); 
    if (!tour) return next(new AppError("No tour with the provided ID!", 404));
    res.status(204).json({ status: "success", data: null });
});

const getTourStatistics = catchAsync(async (req, res, next) => {
    const statistics = await Tour.aggregate([
        { $match: { ratingsAverage: { $gte: 4.5 } } },
        {
            $group: {
                _id: { $toUpper: "$difficulty" },
                numberOfTours: { $sum: 1 },
                numberOfRatings: { $sum: "$ratingsQuantity" },
                averageRating: { $avg: "$price" },
                minimumPrice: { $min: "$price" },
                maximumPrice: { $max: "$price" },
            },
        },
        { $sort: { averagePrice: 1 }, },
    ]);
    res.status(200).json({ status: "success", data: { statistics } });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        { $unwind: "$startDates" },
        {
            $match: {
                startDates: { 
                    $gte: new Date(`${year}-01-01`), 
                    $lte: new Date(`${year}-12-31`) 
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numberOfTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            },
        },
        { $addFields: { month: '$_id' } },
        { $project: { _id: 0 } },
        { $sort: { numberOfTourStarts: -1 } },
        { $limit: 12 },
    ]);
    res.status(200).json({ status: "success", data: { plan } });
});

const getToursWithinCertainDistance = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [latitude, longitude] = latlng.split(","); 
    const radius = unit === "mi" ? distance / 3968.2 : distance / 6378.1;
    if (!latitude, !longitude) return next(new AppError("Please provide latitude and longitude in the format 'lat,lng'."), 400);
    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } } });
    res.status(200).json({ status: "success", results: tours.length, data: { tours } });
});

module.exports = {
    uploadTourImages,
    resizeTourImages,
    getAllTours,
    getOneTour,
    createTour,
    updateTour,
    deleteTour,
    getTourStatistics,
    getMonthlyPlan,
    getToursWithinCertainDistance,
};