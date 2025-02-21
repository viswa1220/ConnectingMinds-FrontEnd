import { Outlet } from "react-router";
import NavBar from "./NavBar";
import Footer from "./Footer";

const Body = () => {
  return (
    <div>
        <NavBar></NavBar>
        <div className="max-w-screen-xl bg-base-300 mx-auto px-1 m-2 py-4">
        <Outlet></Outlet>
        </div>
        <Footer></Footer>
      
    </div>
  );
};

export default Body;
