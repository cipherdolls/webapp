import { Outlet, useLoaderData } from "react-router";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
  ];
}

 

export default function Dashboard() {

  return (
    <div className="">
        Dashboard
        <div>
        </div>
    </div>
  );
}
