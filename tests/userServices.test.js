import { jest } from "@jest/globals";
import { userRepositoryMock } from "./mocks/userRepositoryMock.js";

jest.unstable_mockModule(
    "../src/repository/userRepository.js",
    () => userRepositoryMock
);

const userService = await import("../src/services/userServices.js");

import { describe, test, expect } from "@jest/globals";
import * as statusCodes from "../src/utils/statusCodes.js"
describe("User Registration Tests", () => {
    test("Should return statusCode.CONFLICT if user already exists", async () => {
        userRepositoryMock.isEmailTaken.mockResolvedValue(true);

        const result = await userService.register({
            email: "abc"
        })

        expect(result.status).toEqual(statusCodes.CONFLICT);

        expect(userRepositoryMock.isEmailTaken).toHaveBeenCalledWith("abc");
    });
});