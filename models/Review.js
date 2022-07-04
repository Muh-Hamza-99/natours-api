const mongoose = require("mongoose");

const Tour = require("./Tour");

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, "Review cannot be empty!"],
        },
        rating: {
            type: Number,
            min: 1, 
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: "Tour",
            required: [true, "A review must belong to a tour, right?!"],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "A review must be written by a user, right?!"],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
    this.populate({ path: "user", select: "name" });
    next()
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.review = await this.findOne();
    next();
});

reviewSchema.statics.calculateAverageRatings = async function(tourID) {
    const statistics = await this.aggergate([
        { $match: { tour: tourID } },
        { 
            $group: {
                _id: "$tour",
                numberOfRatings: { $sum: 1 },
                averageRating: { $avg: "$rating" },
            },
        },
    ]);
    if (statistics.length > 0) {
        await Tour.findByIdAndUpdate(tourID, { ratingsQuantity: statistics[0].numberOfRatings, ratingsAverage: statistics[0].averageRating });
    } else {
        await Tour.findByIdAndUpdate(tourID, { ratingsQuantity: 0, ratingsAverage: 4.5 });
    };
};

reviewSchema.post("save", function() {
    this.constructor.calculateAverageRatings(this.tour);
});

reviewSchema.post(/^findOneAnd/, async function() {
    this.review.constructor.calculateAverageRatings(this.review.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;