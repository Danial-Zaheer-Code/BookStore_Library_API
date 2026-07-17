const FINE_PER_DAY = 10

export function calculateFine(dueDate) {
    const overdueDays = Math.max(
        0,
        Math.ceil((new Date() - dueDate) / (1000 * 60 * 60 * 24))
    )

    return overdueDays * FINE_PER_DAY
}