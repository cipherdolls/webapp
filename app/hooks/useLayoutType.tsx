import { useMatches, type RouteObject } from "react-router";

export type LayoutVariant = "default" | "chat";

const useLayoutType = (): LayoutVariant => {
  const matches: RouteObject[] = useMatches();
  const routeWithLayout = matches.reverse().find(match => match.handle?.layout);
  return routeWithLayout?.handle?.layout || 'default';
}

export default useLayoutType;