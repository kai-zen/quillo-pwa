export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type IfNever<T, Then, Else> = [T] extends [never] ? Then : Else;

/**
 * Static definition of an API endpoint.
 *
 * Generic order: Response, Body, Query, Params
 *
 * Use `never` for dimensions the route does not use.
 */
export type EndpointDef<
  TResponse = unknown,
  TBody = never,
  TQuery = never,
  TParams = never,
> = {
  method: HttpMethod;
  path: IfNever<
    TParams,
    string,
    string | ((params: TParams) => string)
  >;
  auth: boolean;
};

export type EndpointOptions<
  TBody = never,
  TQuery = never,
  TParams = never,
> = {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
};
