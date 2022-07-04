const express = require("express");
const router = express.Router();

const {
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
} = require("./../controllers/tour-controllers");

const protect = require("./../middleware/protect");
const restrictTo = require("./../middleware/restrict-to");

const reviewRouter = require("./../routes/review-routes");

router.use("/:tourID/reviews", reviewRouter);

router.get("/tour-statistics", getTourStatistics);
router.get("/monthly-plan/:year", getMonthlyPlan);
router.get("/tours-within-certain-distance/:distance/center/:latlng/unit/:unit", protect, restrictTo("admin", "lead-guide", "guide"), getToursWithinCertainDistance);

router
    .route("/")
    .get(getAllTours)
    .post(protect, restrictTo("admin", "lead-guide"), createTour);

router
    .route("/:id")
    .get(getOneTour)
    .patch(protect, restrictTo("admin", "lead-guide"), uploadTourImages, resizeTourImages, updateTour)
    .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;