const Review = require("./../models/Review");

const APIFeatures = require("./../utilities/api-features");
const AppError = require("./../utilities/app-error");
const catchAsync = require("./../utilities/catch-async");

const setIDs = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourID;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

const getAllReviews = catchAsync(async (req, res, next) => {
    const { tourID } = req.params;
    const features = new APIFeatures(Review.find({ tour: tourID }), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const reviews = await features.query;
    if (!reviews) return next(new AppError("No review with the provided ID!", 404));
    res.status(200).json({ status: "success", results: reviews.length, data: { reviews }});
});

const getOneReview = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return next(new AppError("No review with the provided ID!", 404));
    res.status(200).json({ status: "success", data: { review }});
});

const createReview = catchAsync(async (req, res, next) => {
    const review = await Review.create(req.body);
    res.status(201).json({ status: "success", data: { review } });
});

const updateReview = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!review) return next(new AppError("No review with the provided ID!", 404));
    res.status(200).json({ status: "success", data: { review } });
});

const deleteReview = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return next(new AppError("No review with the provided ID!", 404));
    res.status(204).json({ status: "success", data: null });
});

module.exports = {
    setIDs,
    getAllReviews,
    getOneReview,
    createReview,
    updateReview,
    deleteReview,
};