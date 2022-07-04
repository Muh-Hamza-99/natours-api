const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Booking = require("./../models/Booking");
const Tour = require("./../models/Tour");
const User = require("./../models/User");

const APIFeatures = require("./../utilities/api-features");
const AppError = require("./../utilities/app-error");
const catchAsync = require("./../utilities/catch-async");

const createBookingCheckout = async (session) => {
    const tour = session.client_reference_id;
    const { id: user } = await User.findOne({ email: session.customer_email });
    const price = session.display_items[0].amount / 100;
    await Booking.create({ tour, user, price });
};

const getCheckoutSession = catchAsync(async (req, res, next) => {
    const { tourID } = req.params;
    const tour = await Tour.findById(tourID);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: req.user.email,
        client_reference_id: tourID,
        line_items: [{
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
            amount: tour.price * 100,
            currency: "usd",
            quantity: 1,
        }],
    });
    res.status(200).json({ status: "success", data: { session } });
});

/* No frontend has been created, so apologies in advance if the webhookCheckout controller has any 
errors, as I haven't tested it! */

const webhookCheckout = (req, res, next) => {
    const signature = req.headers["stripe-signature"];
    let event;
    try { event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) { return res.status(400).send(`Webhook error: ${error.message}!`); };
    if (event.type === "checkout.session.completed") createBookingCheckout(event.data.object);
};

const getAllBookings = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Booking.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const bookings = await features.query;
    res.status(200).json({ status: "success", results: bookings.length, data: { bookings }});
});

const getOneBooking = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return next(new AppError("No booking with the provided ID!", 404));
    res.status(200).json({ status: "success", data: {booking }});
});

const createBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.create(req.body);
    res.status(201).json({ status: "success", data: { booking } });
});

const updateBooking = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!booking) return next(new AppError("No booking with the provided ID!", 404));
    res.status(200).json({ status: "success", data: { booking } });
});

const deleteBooking = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) return next(new AppError("No booking with the provided ID!", 404));
    res.status(204).json({ status: "success", data: null });
});

module.exports = {
    getCheckoutSession,
    webhookCheckout,
    getAllBookings,
    getOneBooking,
    createBooking,
    updateBooking,
    deleteBooking,
};