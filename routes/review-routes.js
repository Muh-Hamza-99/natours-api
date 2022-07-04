const express = require("express");
const router = express.Router({ mergeParams: true });

const { 
    setIDs,
    getAllReviews,
    getOneReview,
    createReview,
    updateReview,
    deleteReview,
} = require("./../controllers/review-controllers");

const protect = require("./../middleware/protect");
const restrictTo = require("./../middleware/restrict-to");

router.use(protect);

router
    .route("/")
    .get(getAllReviews)
    .post(restrictTo("user"), setIDs, createReview);

router
    .route("/:id")
    .get(getOneReview)
    .patch(restrictTo("user", "admin"), updateReview)
    .delete(restrictTo("user", "admin"), deleteReview);

module.exports = router;