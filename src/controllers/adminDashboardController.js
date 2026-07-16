import * as adminDashboardServices from "../services/adminDashboardServices.js"

export async function retrieveStats(req, res) {
	const result = await adminDashboardServices.retrieveStats()
	return res.status(result.status).json(result.responseBody)
}

export async function retrieveTopBooks(req, res) {
	const { from, to } = req.query
	const result = await adminDashboardServices.retrieveTopBooks(from, to)
	return res.status(result.status).json(result.responseBody)
}