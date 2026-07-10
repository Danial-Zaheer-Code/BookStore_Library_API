import { jest } from "@jest/globals";

export const userRepositoryMock = {
    isEmailTaken: jest.fn(),
    isUserExists: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    retrieveUser: jest.fn(),
    retrieveUserById: jest.fn(),
    listUsers: jest.fn()
};