const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        price: {
            type: Number,
            required:  [true, "A booking must have a price!"],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        hasPaid: {
            type: Boolean,
            default: true,
        },
    },
);

bookingSchema.pre(/^find/, function(next) {
    this.populate("user").populate({ path: "tour", select: "name" });
    next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;