"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerJWT = exports.loginJWT = void 0;
const http_status_codes_1 = require("http-status-codes");
const CustomError_1 = __importDefault(require("../../middlewear/CustomError"));
const client_1 = require("@prisma/client");
const argon = require("argon2");
const jwt = require("jsonwebtoken");
const prisma = new client_1.PrismaClient();
const tokenGenerator = (payload, expiresIn) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};
const loginJWT = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new CustomError_1.default("Email, and password must be provided.", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    const User = yield prisma.user.findUnique({
        where: { email },
    });
    if (!User) {
        throw new CustomError_1.default("User not found.", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    if (!User.password)
        throw new CustomError_1.default("Try using google or github to sign into this account.", http_status_codes_1.StatusCodes.BAD_REQUEST);
    let passwordIsValid = yield argon.verify(User.password, password);
    if (passwordIsValid) {
        const token = tokenGenerator({ id: User.id }, "1h");
        console.log(`TOKEN: ${token}`);
        return res
            .cookie("jwtToken", token, { httpOnly: true })
            .status(http_status_codes_1.StatusCodes.ACCEPTED)
            .json({
            success: true,
            message: "Successfully logged in.",
            data: Object.assign(Object.assign({}, User), { password: null }),
        });
    }
    else {
        throw new CustomError_1.default("Invalid password provided.", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
});
exports.loginJWT = loginJWT;
const registerJWT = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, first_name, last_name } = req.body;
    if (!email || !password || !first_name || !last_name) {
        throw new CustomError_1.default("Email, password, last name, and first name must be provided.", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    try {
        // Todo: Make sure password is strong.
        const hashedPassword = yield argon.hash(password);
        const User = yield prisma.user.create({
            data: {
                email,
                first_name,
                last_name,
                password: hashedPassword,
            },
        });
        const token = tokenGenerator({ id: User.id }, "1h");
        return res
            .cookie("jwtToken", token, { httpOnly: true })
            .status(http_status_codes_1.StatusCodes.ACCEPTED)
            .json({
            success: true,
            message: "Successfully registered user.",
            data: Object.assign(Object.assign({}, User), { password: undefined, token: token }),
        });
    }
    catch (e) {
        if (e instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            // IF the error is coming from prisma, and that it's a unique field error...
            if (e.code === "P2002") {
                throw new CustomError_1.default("A user with this email already exists!", http_status_codes_1.StatusCodes.BAD_REQUEST);
            }
        }
        else {
            throw new CustomError_1.default(e.message, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
});
exports.registerJWT = registerJWT;
