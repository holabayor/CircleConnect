import { StatusCodes } from "http-status-codes";
import CustomError from "../../middlewares/CustomError";
import { Req } from "../../types";
import { Response } from "express";
import prisma from "../../model/db";
import { Prisma } from "@prisma/client";
import { findUser } from "../../model/auth";
import {
	ACCESS_TOKEN_VALIDITY_TIME,
	DEFAULT_MEMBER_ROLE_ID,
	hash,
	tokenGenerator,
	verifyHash,
} from "../../utils";

const argon = require("argon2");
const jwt = require("jsonwebtoken");

export const loginJWT = async (req: Req, res: Response) => {
	const { email, password } = req.body;

	if (!email || !password) {
		throw new CustomError(
			"Email, and password must be provided.",
			StatusCodes.BAD_REQUEST
		);
	}
	const User = await prisma.user.findUnique({
		where: { email },
	});

	if (!User) {
		throw new CustomError("User not found.", StatusCodes.NOT_FOUND);
	}

	if (!User.password)
		throw new CustomError(
			"Try using google or github to sign into this account.",
			StatusCodes.BAD_REQUEST
		);

	let passwordIsValid = await verifyHash(User.password, password);
	console.log(passwordIsValid);
	// TODO: fix the verifyHash function, and replace it with the function above.
	// passwordIsValid = await argon.verify(User.password, password);

	if (passwordIsValid) {
		const token = await tokenGenerator(
			{ id: User.id },
			ACCESS_TOKEN_VALIDITY_TIME
		);
		console.log(`TOKEN: ${token}`);
		return res
			.cookie("jwtToken", token, { httpOnly: true })
			.status(StatusCodes.OK)
			.json({
				success: true,
				message: "Successfully logged in.",
				data: {
					...User,
					password: null,
				},
			});
	} else {
		throw new CustomError(
			"Invalid password provided.",
			StatusCodes.BAD_REQUEST
		);
	}
};

export const registerJWT = async (req: Req, res: Response) => {
	const { email, password, first_name, last_name } = req.body as {
		email: string;
		password: string;
		first_name: string;
		last_name: string;
	};

	try {
		const hashedPassword = await hash(password);

		const User = await prisma.user.create({
			data: {
				email,
				first_name,
				last_name,
				password: hashedPassword,
				roleId: DEFAULT_MEMBER_ROLE_ID,
			},
		});

		const token = await tokenGenerator({ id: User.id }, "1h");

		return res
			.cookie("jwtToken", token, { httpOnly: true })
			.status(StatusCodes.CREATED)
			.json({
				success: true,
				message: "Successfully registered user.",
				data: {
					...User,
					password: undefined,
					token: token,
				},
			});
	} catch (e: any) {
		if (e instanceof Prisma.PrismaClientKnownRequestError) {
			// IF the error is coming from prisma, and that it's a unique field error...
			if (e.code === "P2002") {
				throw new CustomError(
					"A user with this email already exists!",
					StatusCodes.BAD_REQUEST
				);
			}
		} else {
			throw new CustomError(e.message, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
};
