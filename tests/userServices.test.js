import { beforeEach, jest } from "@jest/globals";
import { userRepositoryMock } from "./mocks/userRepositoryMock.js";

jest.unstable_mockModule(
    "../src/repository/userRepository.js",
    () => userRepositoryMock
);

const userService = await import("../src/services/userServices.js");

import { describe, test, expect } from "@jest/globals";
import * as statusCodes from "../src/utils/statusCodes.js"
describe("User Registration Tests", () => {
    beforeEach(() => {
        const user = {
            email: "abc",
            passsword: "123"
        }
    })
    test("Should return statusCode.CONFLICT if user already exists", async () => {
        userRepositoryMock.isEmailTaken.mockResolvedValue(true);

        const result = await userService.register(user)

        expect(result.status).toEqual(statusCodes.CONFLICT);

        expect(userRepositoryMock.isEmailTaken).toHaveBeenCalledWith("abc");
    });

    test("Should return statusCode.INTERNAL_SERVER_ERROR if an exception is thrown", async () => {
        userRepositoryMock.isEmailTaken.mockRejectedValue(
            new Error("Database error")
        );

        const result = await userService.register({
            email:"abc"
        })

        expect(result.status).toEqual(statusCodes.INTERNAL_SERVER_ERROR);
    });

    test("Should return statusCode.OK on successful user creation", async () => {
        userRepositoryMock.isEmailTaken.mockResolvedValue(true);
        userRepositoryMock.createUser.mockResolvedValue(true)

        const result = await userService.register(user)

        expect(result.status).toEqual(statusCodes.OK);

        expect(userRepositoryMock.createUser).toHaveBeen(user);
    })
});