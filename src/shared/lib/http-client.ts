type RequestLikeInit = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit | Record<string, string>;
};

type HttpClientOptions = {
  fetchImpl?: typeof fetch;
  getAccessToken: () => Promise<string | null>;
  refreshAccessToken: () => Promise<string | null>;
  clearSession: () => Promise<void> | void;
};

type AuthorizedRequest = (url: string, init?: RequestLikeInit) => Promise<Response>;

const toRecordHeaders = (headers?: HeadersInit | Record<string, string>) => {
  if (headers == null) {
    return {} as Record<string, string>;
  }
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...headers };
};

const withAuthorizationHeader = (
  init: RequestLikeInit | undefined,
  accessToken: string | null
) => {
  const headers = toRecordHeaders(init?.headers);
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else {
    delete headers.Authorization;
  }

  return {
    ...(init ?? {}),
    headers,
  };
};

export const createHttpClient = (options: HttpClientOptions): { request: AuthorizedRequest } => {
  const fetchImpl = options.fetchImpl ?? fetch;

  const request: AuthorizedRequest = async (url, init) => {
    const accessToken = await options.getAccessToken();
    const firstInit = withAuthorizationHeader(init, accessToken);
    const firstResponse = await fetchImpl(url, firstInit);
    if (firstResponse.status !== 401) {
      return firstResponse;
    }

    const refreshedToken = await options.refreshAccessToken();
    if (!refreshedToken) {
      await options.clearSession();
      return firstResponse;
    }

    const retryInit = withAuthorizationHeader(init, refreshedToken);
    const retryResponse = await fetchImpl(url, retryInit);
    if (retryResponse.status === 401) {
      await options.clearSession();
    }
    return retryResponse;
  };

  return { request };
};
