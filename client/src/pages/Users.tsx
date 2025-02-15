import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Button } from "@chakra-ui/react";
// import { AiOutlineHome } from "react-icons/ai";
// import { TbCircleRectangle } from "react-icons/tb";
// import { FaRegCircleUser } from "react-icons/fa6";
// import { TfiLocationArrow } from "react-icons/tfi";
// import { AiOutlineProject } from "react-icons/ai";
import image from "../assets/Image-32.png";
import { useEffect, useState } from "react";
import DashboardBlackBg from "../Components/dashboard-black-bg";
// import { Link } from "react-router-dom";

interface createData {
	Photo: string;
	Name: string;
	Email: string;
	Login: string;
	OPERATION: string;
  }
export default function Users() {
	
  const [data, setData] = useState<createData[]>([]);

  useEffect(() => {
    const Data = async () => {
      try {
        const response = await fetch('http://localhost:8000/circle', {
          method: 'GET',
        });
       
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const apiData = await response.json();
        console.log(apiData)
       setData(apiData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

  Data();
  }, []);
  return (
    <div className="flex flex-row bg-gray-100">
   <div className=" w-80">
	<DashboardBlackBg image={image}/>
   </div>
      {/* table */}
      <div className="flex-1 w-full px-6">
        <div className="w-full grid place-content-center mt-5">
          <input
            placeholder="Search..."
            className="border-2 lg:w-[500px] w-[400px] px-2 py-2 outline-[#F1C644] font-light"
          ></input>
        </div>

        <div className="flex flex-row text-center mt-10 gap-8 w-full justify-between">
          <section className="flex flex-row items-center gap-8">
            <h1 className="text-4xl font-bold">Members</h1>
            <Button colorScheme="yellow" color="white" className="shadow-sm">
              Add New
            </Button>
          </section>
          <Button colorScheme="yellow" color="white" className="shadow-sm">
            Filter
          </Button>
        </div>

        <div className="mt-4 border-t-2 w-full">
          <TableContainer component={Paper}>
		  <Table
            sx={{
              "& tr > *:not(:first-child)": {
                textAlign: "center",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Full-Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Last login</TableCell>
                <TableCell>Operation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.Photo}>
                  <TableCell>{row.Photo}</TableCell>
                  <TableCell>{row.Name}</TableCell>
                  <TableCell>{row.Email}</TableCell>
                  <TableCell>{row.Login}</TableCell>
                  <TableCell>{row.OPERATION}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
		  </TableContainer>
        </div>
      </div>
    </div>
  );
}
