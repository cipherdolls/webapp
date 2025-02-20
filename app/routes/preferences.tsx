import { NavLink, Outlet } from "react-router";
import type { Route } from "./+types/chatsIndex";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Preferences" },
  ];
}

export default function Preferences() {
  return (
    <div className="">
        preferences
    
        <nav>
            <NavLink to="ai"> AI </NavLink>
            <NavLink to="tts"> TTS </NavLink>
            <NavLink to="stt"> STT </NavLink>
        </nav>

        <div>
            <Outlet />
        </ div>
    </div>
    
  );
}
