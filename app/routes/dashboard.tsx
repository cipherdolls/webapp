import { Outlet, useLoaderData } from "react-router";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
  ];
}

 

export default function Dashboard() {
  const { dataA, dataB } = useLoaderData();

  return (
    <div className="">
        Dashboard
        <div>
        </div>
    </div>
  );
}
