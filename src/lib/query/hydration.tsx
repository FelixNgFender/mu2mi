import {
  dehydrate,
  HydrationBoundary,
  type QueryClient,
} from "@tanstack/react-query";
import { cache } from "react";
import { createQueryClient } from "./client";

export const getQueryClient = cache(createQueryClient);

export function HydrateClient(props: {
  children: React.ReactNode;
  client: QueryClient;
}) {
  return (
    <HydrationBoundary state={dehydrate(props.client)}>
      {props.children}
    </HydrationBoundary>
  );
}
