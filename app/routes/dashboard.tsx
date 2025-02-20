import { Outlet, useLoaderData } from "react-router";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
  ];
}


export async function loader() {
  const [responseA, responseB] = await Promise.all([
    fetch("https://jsonplaceholder.typicode.com/todos"),
    fetch("https://jsonplaceholder.typicode.com/users"),
  ]);
  const [dataA, dataB] = await Promise.all([responseA.json(), responseB.json()]);
  return {
    dataA,
    dataB,
  }
}





export default function Dashboard() {
  const { dataA, dataB } = useLoaderData();

  return (
    <div className="">
        Dashboard
        <div>
          <h1>Two API Calls in One Loader</h1>
          <p>Data A: {JSON.stringify(dataA)}</p>
          <p>Data B: {JSON.stringify(dataB)}</p>
        </div>
    </div>
  );
}
