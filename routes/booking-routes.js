const express = require("express");
const router = express.Router();

const {
    getCheckoutSession,
    getAllBookings,
    getOneBooking,
    createBooking,
    updateBooking,
    deleteBooking,
} = require("./../controllers/booking-controllers");

const protect = require("./../middleware/protect");
const restrictTo = require("./../middleware/restrict-to");

router.use(protect);

router.get("/checkout-session/:tourID", getCheckoutSession);

router.use(restrictTo("admin", "lead-guide"));

router
    .route("/")
    .get(getAllBookings)
    .post(createBooking);

router 
    .route("/:id")
    .get(getOneBooking)
    .patch(updateBooking)
    .delete(deleteBooking);

module.exports = router;