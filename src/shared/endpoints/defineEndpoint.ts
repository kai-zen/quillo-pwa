import type { EndpointDef } from "./types";

/** Preserve endpoint generics so `request(endpoint)` can infer response/body types. */
export const defineEndpoint = <
  TResponse = unknown,
  TBody = never,
  TQuery = never,
  TParams = never,
>(
  endpoint: EndpointDef<TResponse, TBody, TQuery, TParams>,
): EndpointDef<TResponse, TBody, TQuery, TParams> => endpoint;
