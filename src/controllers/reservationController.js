import * as reservationServices from "../services/reservationServices.js"

export async function reserveBook(req, res) {
    const {bookId} = req.body

    const result = await reservationServices.reserveBook(req.userId, bookId)
    return res.status(result.status).json(result.responseBody)
}

export async function cancelReservation(req, res){
    const {reservationId} = req.body

    const result =  await reservationServices.cancelReservation(req.userId, reservationId)
    return res.status(result.status).json(result.responseBody)
}