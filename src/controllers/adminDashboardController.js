import * as adminDashboardServices from "../services/adminDashboardServices.js"

export async function retrieveStats(req, res) {
	const result = await adminDashboardServices.retrieveStats()
	return res.status(result.status).json(result.responseBody)
}