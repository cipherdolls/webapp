import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { RouteHandle } from '@remix-run/react';

export declare namespace Route {
  export interface MetaArgs extends Parameters<MetaFunction>[0] {}
  export type LoaderArgs = LoaderFunctionArgs;
  export type ClientActionArgs = ActionFunctionArgs;
  export type ComponentProps = {
    loaderData: any;
  };
  export type Handle = RouteHandle;
}