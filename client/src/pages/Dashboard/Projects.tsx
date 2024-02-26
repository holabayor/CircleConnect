import { useEffect, useRef, useState } from "react";
import UseFetch from "../../Components/Fetch";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Avatar } from "@chakra-ui/react";
import { Rating } from "primereact/rating";

type projectData = {
	id: string;
	name: string;
	description: string;
	circle: {
		id: number;
		description: string;
		rating: number;
		createdAt: Date;
	};
	createdAt: Date;
	createdBy: {
		email: string;
		id: string;
		profile_picture?: string;
		first_name: string;
		last_name: string;
		projects: {
			id: string;
			circleId: number;
			name: string;
		}[];
		role: {
			id: string;
			name: string;
		};
		track: string;
		school: string;
		coleadOf?: {
			id: number;
			description: string;
			rating: number;
			createdAt: Date;
		};
		leadOf?: {
			id: number;
			description: string;
			rating: number;
			createdAt: Date;
		};
		memberOf?: {
			id: number;
			description: string;
			rating: number;
			createdAt: Date;
		};
		joined: Date;
		createdAt: Date;
	};
	rating: [];
	liveLink?: string;
	github?: string;
	tags: string[];
};
const Projects = () => {
	const [data, setData] = useState<projectData[]>([]);
	const [search, setSearch] = useState("");
	const toast = useRef();

	const fetchProjects = async () => {
		const { data, response } = await UseFetch({
			url: "project",
			options: {
				method: "GET",
				useServerUrl: true,
				returnResponse: true,
			},
		});

		if (!response.ok)
			throw new Error(
				data ? data.message : "Error trying to communicate with server."
			);

		setData(data.data);
	};

	useEffect(() => {
		(async () => await fetchProjects())();
	}, []);
	return (
		<div className="flex-1 w-full px-6 bg-gray-100">
			<Toast ref={toast} />
			<ConfirmDialog />

			<div className="w-full flex justify-center gap-2 mt-5">
				<span className="p-input-icon-left max-w-[400px] w-full">
					<i className="pi pi-search" />
					<InputText
						placeholder="Search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full h-full"
					/>
				</span>
				{/* <Dropdown
					value={search.mode}
					style={{ width: "150px" }}
					onChange={(e) =>
						setSearch((prev) => {
							return {
								...prev,
								mode: e.target.value,
							};
						})
					}
					options={ModeList}
					optionLabel="name"
					placeholder="Select a Search Mode"
					className="w-full md:w-14rem"
					id="user-track"
				/> */}
			</div>

			<div className="flex flex-row text-center mt-10 gap-8 w-full justify-between">
				<section className="flex flex-row items-center gap-8">
					<h1 className="text-4xl font-bold">
						Projects ({data.length})
					</h1>
					<i
						// onClick={() => setCreateUserDialog(true)}
						title="Create a new role."
						className="pi pi-plus cursor-pointer shadow-lg hover:scale-105 duration-200 bg-yellow-400 text-white px-2 py-2 rounded-full"
					></i>
				</section>
				{/* <section>
					<CascadeSelect
						value={sortedMethod}
						onChange={(e) => setSortedMethod(e.value)}
						options={SortOptions}
						optionLabel="cname"
						optionGroupLabel="name"
						optionGroupChildren={["options"]}
						className="w-full md:w-14rem"
						breakpoint="767px"
						placeholder="Select a Sort method"
						style={{ width: "fit-content" }}
					/>
					{sortedMethod && (
						<p
							className="text-xs text-neutral-400 text-right mt-1 cursor-pointer"
							onClick={() => setSortedMethod(() => undefined)}
						>
							clear sort filtering
						</p>
					)}
				</section> */}
			</div>

			<div className="mt-4 border-t-2 w-full">
				<DataTable
					value={data}
					tableStyle={{ minWidth: "50rem" }}
					showGridlines
					stripedRows
				>
					<Column
						body={(project: projectData) => {
							return (
								<>
									{project.createdBy.profile_picture && (
										<Avatar
											image={
												project.createdBy
													.profile_picture
											}
											shape="circle"
											style={{ objectFit: "cover" }}
										/>
									)}
									{!project.createdBy.profile_picture && (
										<Avatar
											label={
												project.createdBy.first_name[0]
											}
											style={{
												backgroundColor: "#9c27b0",
												color: "#ffffff",
											}}
											shape="circle"
										/>
									)}
								</>
							);
						}}
						header=""
					/>
					<Column field="name" header="Name" />
					<Column
						body={(project) => {
							let totalRating = 0;
							project.rating.forEach(
								(rating) => (totalRating += rating.rating)
							);

							const averageRating =
								totalRating / project.rating.length;

							return (
								<Rating
									value={averageRating}
									readOnly
									cancel={false}
								/>
							);
						}}
						header="Rating"
					/>
					<Column field="tags" header="Tags" />
				</DataTable>
			</div>
		</div>
	);
};

export default Projects;
