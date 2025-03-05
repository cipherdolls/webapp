import { redirect, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/_main._general.account";
import type { User } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Account" },
  ];
}


export default function Account({ loaderData }: Route.ComponentProps) {
  const me = useRouteLoaderData('routes/_main') as User;

  return (
    <div className="">
        Account {me.name}
    </div>
  );
}
