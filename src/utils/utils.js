import jwt from "jsonwebtoken"

export function createToken(tokenPayload, duration, secret) {
    const token = jwt.sign(
        tokenPayload,
        secret,
        { expiresIn: duration }
    );
    return token
}

export function createWhereClauseForBookList(filters) {
    const where = {}

    if (filters.categoryId) {
        where.categoryId = Number(filters.categoryId)
    }

    if (filters.authorId) {
        where.authorId = Number(filters.authorId)
    }

    if (filters.availability) {
        where.availableCopies = {
            gt: 0
        }
    }

    if (filters.yearFrom || filters.yearTo) {
        where.publishedYear = {}
        if (filters.yearFrom) {
            where.publishedYear.gte = Number(filters.yearFrom)
        }
        if (filters.yearTo) {
            where.publishedYear.lte = Number(filters.yearTo)
        }
    }

    if (filters.search) {
        where.title = {
            contains: filters.search,
            mode: "insensitive"
        }
    }

    return where
}