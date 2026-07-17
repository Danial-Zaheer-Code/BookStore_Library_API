const FINE_PER_DAY = 10

export function calculateFine(borrowRecord) {

    if (borrowRecord.status == "OVERDUE") {
        return calculateLiveFineEstimate(borrowRecord.dueDate)
    }

    return 0
}

export function calculateLiveFineEstimate(dueDate) {
    const overdueDays = Math.max(
        0,
        Math.ceil((new Date() - dueDate) / (1000 * 60 * 60 * 24))
    )

    return overdueDays * FINE_PER_DAY
}