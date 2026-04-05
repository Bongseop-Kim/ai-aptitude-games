import type { AuthIdentity, AuthTokens } from "../model/auth-types";

type AuthorizedRequest = (url: string, init?: RequestInit) => Promise<Response>;

type AuthApiOptions = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  authorizedRequest: AuthorizedRequest;
};

type SignInResponse = AuthTokens & {
  displayName: string;
};

const jsonHeaders = {
  "Content-Type": "application/json",
};

const parseJson = async <T>(response: Response): Promise<T> => {
  return (await response.json()) as T;
};

export const createAuthApi = (options: AuthApiOptions) => {
  const fetchImpl = options.fetchImpl ?? fetch;
  const authPrefix = `${options.baseUrl}/api/v1/auth`;

  const signIn = async (displayName: string): Promise<SignInResponse> => {
    const response = await fetchImpl(`${authPrefix}/sign-in`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ displayName }),
    });
    return parseJson<SignInResponse>(response);
  };

  const refresh = async (refreshToken: string): Promise<AuthTokens> => {
    const response = await fetchImpl(`${authPrefix}/refresh`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ refreshToken }),
    });
    return parseJson<AuthTokens>(response);
  };

  const getMe = async (): Promise<AuthIdentity> => {
    const response = await options.authorizedRequest(`${authPrefix}/me`, {
      method: "GET",
    });
    return parseJson<AuthIdentity>(response);
  };

  const signOut = async (): Promise<void> => {
    await options.authorizedRequest(`${authPrefix}/sign-out`, {
      method: "POST",
      headers: jsonHeaders,
    });
  };

  return {
    signIn,
    refresh,
    getMe,
    signOut,
  };
};
