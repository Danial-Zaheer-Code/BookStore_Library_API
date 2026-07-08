import * as statusCode from "./statusCodes.js"

export function success(status, message, data = null) {
    return {
        status,
        responseBody: {
            success: true,
            message,
            data

        }
    }
}

export function failure(status, message) {
    return {
        status,
        responseBody: {
            success: false,
            message,
            data: null
        }
    }
}