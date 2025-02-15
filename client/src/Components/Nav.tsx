import {
	Avatar,
	Button,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverHeader,
	PopoverTrigger,
	useDisclosure,
} from "@chakra-ui/react";
import Logo from "./Logo";
import { Link, NavLink } from "react-router-dom";
import UseFetch from "./Fetch";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../slices/userSlice";
import {
	Drawer,
	DrawerBody,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { NotificationType } from "../types";
import { format } from "timeago.js";
import { UseSocketContext } from "../contexts/SocketContext";
import Notify from "./Notify";
import { Socket } from "socket.io-client";

type Props = {
	className?: string;
	type?: "dark" | "light";
	useBackground?: boolean;
};

const activeStyles = {
	color: "#E53E3E",
	fontWeight: "normal",
};

type Notification = {
	read: NotificationType[];
	unread: NotificationType[];
};

const Nav = (props: Props) => {
	const dispatch = useDispatch();
	const socket: Socket = UseSocketContext();
	const { className, type = "dark", useBackground = true } = props;
	const user = useSelector((state) => state.user);
	// const { io, connected: socketConnected } = useSelector((state) => state.io);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [notifications, setNotifications] = useState<Notification>({
		unread: [],
		read: [],
	});
	const btnRef = useRef();

	const fetchNotifications = async () => {
		const { data, response } = await UseFetch({
			url: `notification`,
			options: {
				method: "GET",
				useServerUrl: true,
				returnResponse: true,
			},
		});

		if (!response.ok)
			throw new Error("Error trying to fetch notifications");
		setNotifications(() => {
			// Filters the notification by the read status.
			return {
				read: data.data.filter(
					(notification: NotificationType) => notification.is_read
				),
				unread: data.data.filter(
					(notification: NotificationType) => !notification.is_read
				),
			};
		});
	};

	useEffect(() => {
		socket.on("notification", (notification) => {
			setNotifications((prev) => ({
				unread: [notification, ...prev.unread],
				read: prev.read,
			}));
			Notify(notification.content);
		});
	}, [socket]);

	useEffect(() => {
		fetchNotifications();
	}, []);

	const logoutHandler = async () => {
		dispatch(logoutUser());
		onClose();
		await UseFetch({
			url: "logout",
			options: {
				method: "GET",
				useServerUrl: true,
				returnResponse: true,
			},
		})
			.then(({ response }) => {
				if (!response.ok) throw new Error();
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const updateNotification = async (id: string, status: boolean) => {
		const { data, response } = await UseFetch({
			url: `notification/${id}/${status ? "markAsUnread" : "markAsRead"}`,
			options: {
				method: "PATCH",
				useServerUrl: true,
				returnResponse: true,
			},
		});

		if (!response.ok) console.log(response);
		fetchNotifications();
	};

	const markAllAsRead = async () => {
		const { data, response } = await UseFetch({
			url: `notification/markAll`,
			options: {
				method: "PATCH",
				useServerUrl: true,
				returnResponse: true,
			},
		});

		if (!response.ok) console.log(response);
		fetchNotifications();
	};

	const DisplayNotifications = () => {
		// Puts all notifications into an array, and sorts them by their timestamp
		const allNotifications = [
			...notifications.unread,
			...notifications.read,
		].sort((a, b) => {
			if (a.createdAt < b.createdAt) return 1;
			else if (a.createdAt > b.createdAt) return -1;
			else return 0;
		});

		return allNotifications.map((notification) => {
			const { id, content, is_read, url, user, createdAt } = notification;
			return (
				<div
					key={id}
					className={`px-2 py-3 flex flex-row gap-3 items-center border-b border-b-slate-200 border-1 hover:bg-slate-100 duration-300 cursor-pointer bg-white ${
						!is_read ? "bg-red-50" : ""
					}`}>
					<Avatar
						name={`${user.first_name}`}
						src={user.profile_picture}
						width="32px"
						height="32px"
						className="cursor-pointer"
						colorScheme="teal"
					/>
					<div className="flex flex-col gap-0">
						<a href={url} className="font-light">
							{content}
						</a>
						<div className="flex flex-row justify-between font-light text-xs text-gray-400">
							<p className=" ">{format(createdAt)}</p>
							<button
								className="hover:underline"
								onClick={() => updateNotification(id, is_read)}>
								{is_read ? "Unread" : "Mark as read"}
							</button>
						</div>
					</div>
				</div>
			);
		});
	};

	return (
		<>
			<header
				className={`flex flex-row justify-between py-4 px-8 md:px-8 items-center ${className} ${
					useBackground && "nav_background"
				}`}>
				<div className="flex-1 sm:flex hidden justify-between mx-auto items-center">
					<Logo type={type} />
					<ul
						className={`flex flex-row gap-6 font-light ${
							type === "dark" ? "text-black" : "text-white"
						}`}>
						<li className="cursor-pointer text-lg">
							<NavLink
								to="/"
								style={({ isActive }) => {
									return isActive ? activeStyles : {};
								}}>
								Home
							</NavLink>
						</li>
						<li className="cursor-pointer text-lg">
							<NavLink
								to="/discover"
								style={({ isActive }) => {
									return isActive ? activeStyles : {};
								}}>
								Discover
							</NavLink>
						</li>
					</ul>

					<div>
						{user.isLoggedIn && (
							<section
								className={`flex flex-row gap-4 items-center text-black`}>
								<div>
									<Popover>
										<PopoverTrigger>
											<Button
												variant="unstyled"
												className="relative">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth={1.25}
													stroke="currentColor"
													className={`w-6 h-6 cursor-pointer duration-300 active:text-red-300
													${type === "dark" ? "text-black" : "text-white"}`}>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
													/>
												</svg>
												{notifications.unread.length >
													0 && (
													<div className="bg-red-500 rounded-full text-xs py-1 px-1 absolute bottom-3 right-4"></div>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="mx-2">
											<PopoverArrow />
											<PopoverCloseButton />
											<PopoverHeader>
												<div className="flex flex-col gap-0 items-center">
													<h4 className="font-light text-base text-center">
														Notifications (
														<span className="text-red-500">
															{notifications
																.unread.length +
																notifications
																	.read
																	.length}
														</span>
														)
													</h4>
													<button
														onClick={markAllAsRead}
														className="font-light self-end text-xs text-gray-500">
														Mark all as read
													</button>
												</div>
											</PopoverHeader>
											<PopoverBody>
												<div className="flex flex-col max-h-[350px] overflow-y-auto">
													{notifications.unread
														.length === 0 &&
														notifications.read
															.length === 0 && (
															<p>
																You currently
																have no
																notifications!
															</p>
														)}
													{(notifications.read
														.length > 0 ||
														notifications.unread
															.length > 0) && (
														<DisplayNotifications />
													)}
												</div>
											</PopoverBody>
										</PopoverContent>
									</Popover>
								</div>

								<a>
									<Avatar
										name={`${user.info.first_name}`}
										src={user.info.profile_picture}
										width="32px"
										height="32px"
										className="cursor-pointer"
										onClick={onOpen}
										colorScheme="teal"
										ref={btnRef}
									/>
								</a>
							</section>
						)}
						{!user.isLoggedIn && (
							<Link to={"/login"}>
								<Button colorScheme="red" variant="outline">
									Login
								</Button>
							</Link>
						)}
					</div>

					<Drawer
						isOpen={isOpen}
						placement="right"
						onClose={onClose}
						finalFocusRef={btnRef}>
						<DrawerOverlay />
						<DrawerContent>
							<DrawerCloseButton />
							<DrawerHeader className="flex flex-row gap-2">
								<Avatar
									name={`${user.info.first_name}`}
									src={user.info.profile_picture}
									width="32px"
									height="32px"
									className="cursor-pointer outline outline-slate-600 outline-1"
									onClick={onOpen}
									colorScheme="red"
									ref={btnRef}
								/>
								<div className="flex flex-col gap-0">
									<h4 className="font-medium text-sm leading-tight">
										{user.info.first_name}
									</h4>
									<p className="font-light text-xs leading-tight">
										Benedict
									</p>
								</div>
							</DrawerHeader>

							<DrawerBody>
								<button className="px-2 py-1 text-left hover:outline outline-1 rounded-sm outline-slate-300 w-full mt-1">
									Your Profile
								</button>
								<div className="w-full h-[1px] rounded-md bg-gray-200 my-1"></div>
								<section className="flex flex-col gap-2 mt-2">
									<button className="px-2 py-1 text-left hover:outline outline-1 rounded-sm outline-slate-300">
										Projects
									</button>
									<button className="px-2 py-1 text-left hover:outline outline-1 rounded-sm outline-slate-300">
										Reviews
									</button>
									<button className="px-2 py-1 text-left hover:outline outline-1 rounded-sm outline-slate-300">
										Stars
									</button>
									<button className="px-2 py-1 text-left hover:outline outline-1 rounded-sm outline-slate-300">
										Circle
									</button>
									 <Link to={"/dashboard"}>
								  <button className="px-2 py-1 text-left hover:outline outline-1 rounded-sm outline-slate-300">
									Dashboard
								  </button>
							       </Link>
								</section>
								<div className="w-full h-[1px] rounded-md bg-gray-200 my-1"></div>

								<button
									onClick={logoutHandler}
									className="mt-2 px-2 font-light">
									Logout
								</button>
							</DrawerBody>
						</DrawerContent>
					</Drawer>
				</div>

				{/* Mobile Screens */}
				<div className="flex flex-row justify-between items-center w-full sm:hidden">
					<Logo type={type} />
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className={`w-6 h-6 ${
							type === "dark" ? "text-black" : "text-white"
						}`}>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
						/>
					</svg>
				</div>
			</header>
		</>
	);
};

export default Nav;
