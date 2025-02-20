import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    route('/dashboard', "routes/dashboard.tsx", [
        route("chats",              "routes/chatsIndex.tsx"),
    ]),
    

    route("avatars",            "routes/avatarsIndex.tsx"),
    route("avatars/:avatarId",  "routes/avatarsDetails.tsx"),


] satisfies RouteConfig;
