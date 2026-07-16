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
