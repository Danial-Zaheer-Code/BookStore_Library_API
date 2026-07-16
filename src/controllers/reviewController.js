import * as reviewServices from '../services/reviewServices.js';

export async function createReview(req, res) {
    const { bookId, rating, comment } = req.body;

    const data = {
        userId: req.userId,
        bookId,
        rating,
        comment
    };

    const result = await reviewServices.createReview(data);
    return res.status(result.status).json(result.responseBody)
}

export async function retrieveBookReviews(req, res) {
    const { bookId } = req.body;
    const result = await reviewServices.retrieveBookReviews(bookId);
    return res.status(result.status).json(result.responseBody)
}