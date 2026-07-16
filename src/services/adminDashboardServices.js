import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"

function toNumber(value) {
	return Number(value ?? 0)
}



export async function retrieveStats() {
	try {
		const now = new Date()

		const [totalBooks, totalUsers, activeBorrows, overdueBorrows, fineCollected, outstandingFines] = await Promise.all([
			prisma.book.count(),
			prisma.user.count(),
			prisma.borrowRecord.count({
				where: {
					status: "BORROWED"
				}
			}),
			prisma.borrowRecord.count({
				where: {
					OR: [
						{
							status: "OVERDUE"
						},
						{
							status: "BORROWED",
							dueDate: {
								lt: now
							}
						}
					]
				}
			}),
			prisma.borrowRecord.aggregate({
				where: {
					finePaid: true
				},
				_sum: {
					fineAmount: true
				}
			}),
			prisma.borrowRecord.aggregate({
				where: {
					finePaid: false
				},
				_sum: {
					fineAmount: true
				}
			})
		])

		return success(stausCode.OK, "Stats retrieved successfully", {
			totalBooks,
			totalUsers,
			totalActiveBorrows: activeBorrows,
			totalOverdueBorrows: overdueBorrows,
			totalFinesCollected: toNumber(fineCollected._sum.fineAmount),
			totalOutstandingFines: toNumber(outstandingFines._sum.fineAmount)
		})
	} catch (error) {
		console.log(error)
		return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
	}
}

export async function retrieveTopBooks(from, to) {
	try {
		const { fromDate, toDate } = buildDateRange(from, to)
		const validationResult = validateDateRange(fromDate, toDate)

		if (validationResult) {
			return validationResult
		}

		const topBorrowedBooks = await getTopBorrowedBooks(fromDate, toDate)

		if (topBorrowedBooks.length === 0) {
			return success(stausCode.OK, "Top books retrieved successfully", { topBooks: [] })
		}

		const bookIds = topBorrowedBooks.map((record) => record.bookId)
		const books = await getBooksByIds(bookIds)
		const topBooks = buildTopBooks(topBorrowedBooks, books)

		return success(stausCode.OK, "Top books retrieved successfully", { topBooks })
	} catch (error) {
		console.log(error)
		return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
	}
}

function buildDateRange(from, to) {
	return {
		fromDate: parseBoundaryDate(from, false),
		toDate: parseBoundaryDate(to, true)
	}
}

function parseBoundaryDate(value, isEndBoundary) {
	if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return new Date(`${value}T${isEndBoundary ? "23:59:59.999" : "00:00:00.000"}`)
	}

	return new Date(value)
}

function validateDateRange(fromDate, toDate) {
	if (isInvalidDate(fromDate) || isInvalidDate(toDate)) {
		return failure(stausCode.BAD_REQUEST, "From and to must be valid dates")
	}

	if (fromDate > toDate) {
		return failure(stausCode.BAD_REQUEST, "From date must be before or equal to to date")
	}

	return null
}

function isInvalidDate(date) {
	return Number.isNaN(date.getTime())
}

async function getTopBorrowedBooks(fromDate, toDate) {
	return await prisma.borrowRecord.groupBy({
		by: ["bookId"],
		where: {
			borrowDate: {
				gte: fromDate,
				lte: toDate
			}
		},
		_count: {
			bookId: true
		},
		orderBy: {
			_count: {
				bookId: "desc"
			}
		},
		take: 5
	})
}

async function getBooksByIds(bookIds) {
	return await prisma.book.findMany({
		where: {
			id: {
				in: bookIds
			}
		},
		select: {
			id: true,
			title: true,
			isbn: true
		}
	})
}

function buildTopBooks(topBorrowedBooks, books) {
	const booksById = new Map(books.map((book) => [book.id, book]))

	return topBorrowedBooks
		.map((record, index) => ({
			rank: index + 1,
			bookId: record.bookId,
			borrowCount: record._count.bookId,
			book: booksById.get(record.bookId) ?? null
		}))
		.filter((record) => record.book !== null)
}
