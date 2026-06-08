const Review = require("../models/Review");

exports.addReview = async (req, res) => {
  try {
    const { packageId, userId, userName, rating, comment } = req.body;

    if (!userName) {
      return res.status(400).json({ message: "User name is required to post a review" });
    }

    const review = new Review({
      packageId,
      userId,
      userName,
      rating,
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getPackageReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ packageId: req.params.packageId })
      .populate('userId', 'name username')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.handleReaction = async (req, res) => {
  const { reviewId, userId, type } = req.body; 
  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const oppositeType = type === 'likes' ? 'dislikes' : 'likes';

    review[oppositeType] = review[oppositeType].filter(id => id.toString() !== userId);

    if (review[type].includes(userId)) {
      review[type] = review[type].filter(id => id.toString() !== userId);
    } else {
      review[type].push(userId);
    }

    await review.save();
    await review.populate('userId', 'name username');
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── DELETE /api/reviews/:id ──────────────────────────────────
   Only the author of the review can delete it.
   The requesting userId is passed as a query param: ?userId=xxx
   ──────────────────────────────────────────────────────────── */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Ownership check — compare stored userId with the requester
    const authorId  = review.userId?.toString();
    const requesterId = req.query.userId || req.body.userId;

    if (authorId !== requesterId) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};