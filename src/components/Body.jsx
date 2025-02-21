import { Outlet } from "react-router";
import Footer from "./Footer";

const Body = () => {
  return (
    <div>
      <div className="max-w-screen-xl  mx-auto px-1 m-2 py-4">
        <Outlet></Outlet>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Body;
