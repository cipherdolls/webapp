import type { Route } from "./+types/scenariosIndex";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Scenarios" },
  ];
}

export default function ScenariosIndex() {
  return (
    <div className="">
        Scenarios
    </div>
  );
}
