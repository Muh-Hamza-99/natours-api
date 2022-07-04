const express = require("express");
const app = express();

const morgan = require("morgan");

const expressRateLimit = require("express-rate-limit");
const expressMongoSanitise = require("express-mongo-sanitize");
const XSS = require("xss-clean");
const helmet = require("helmet");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const CORS = require("cors");

const tourRouter = require("./routes/tour-routes");
const userRouter = require("./routes/user-routes");
const reviewRouter = require("./routes/review-routes");
const bookingRouter = require("./routes/booking-routes");

/* No frontend has been created, so apologies in advance if the webhookCheckout controller has any 
errors, as I haven't tested it! */
const { webhookCheckout } = require("./controllers/booking-controllers");

const AppError = require("./utilities/app-error");
const errorHandler = require("./utilities/error-handler");

const limiter = expressRateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this device! Please try again after an hour!",
});

app.options("*", CORS());

app.use(compression());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(expressMongoSanitise());
app.use(XSS());
app.use(helmet());

app.use("/api", limiter);

/* No frontend has been created, so apologies in advance if the webhookCheckout controller has any 
errors, as I haven't tested it! */
app.post("/webhook-checkout", bodyParser.raw({ type: "application/json"}), webhookCheckout);

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

app.all("*", (req, res, next) => {
    res.status(404).json({ status: "fail", message: `Can't find ${req.originalUrl} on this server!` });
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;