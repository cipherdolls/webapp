import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [

    index("routes/dashboard.tsx"),
    route("chats",            "routes/chatsIndex.tsx"),
    route("avatars",            "routes/avatarsIndex.tsx"),
    route("avatars/:avatarId",  "routes/avatarsDetails.tsx"),

    route("preferences", "routes/preferences.tsx", [
        route("ai",   "routes/aiProvidersIndex.tsx"),
        route("tts",  "routes/ttsProvidersIndex.tsx"),
        route("stt",  "routes/sttProvidersIndex.tsx"),
        route("scenarios",  "routes/scenariosIndex.tsx"),
    ]),
    
    route("account",           "routes/account.tsx"),
    route("signin",            "routes/signIn.tsx"),

] satisfies RouteConfig;
