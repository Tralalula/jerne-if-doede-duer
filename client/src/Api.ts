/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface LoginResponse {
  accessToken: string;
}

/** @example {"email":"admin@example.com","password":"Kakao1234!"} */
export interface LoginRequest {
  email: string;
  password: string;
  deviceName: string | null;
}

export interface RegisterResponse {
  email: string;
}

/** @example {"email":"børge@example.com","password":"SecurePass123!"} */
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface UserInfoResponse {
  email: string;
  isAdmin: boolean;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ProblemDetails {
  type: string | null;
  title: string | null;
  /** @format int32 */
  status: number | null;
  detail: string | null;
  instance: string | null;
  extensions: Record<string, any>;
  [key: string]: any;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface CompletePasswordResetRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface UserDevice {
  /** @format guid */
  id: string;
  /** @format guid */
  userId: string;
  deviceId: string;
  deviceName: string;
  /** @format date-time */
  lastUsedAt: string;
  /** @format date-time */
  createdAt: string;
  createdByIp: string | null;
  userAgent: string | null;
  refreshTokens: RefreshToken[];
  user: User;
}

export interface RefreshToken {
  /** @format guid */
  id: string;
  /** @format guid */
  userId: string;
  /** @format guid */
  deviceId: string | null;
  /** @format guid */
  replacedByTokenId: string | null;
  token: string;
  /** @format date-time */
  createdAt: string | null;
  /** @format date-time */
  expiresAt: string;
  /** @format date-time */
  revokedAt: string | null;
  revokedByIp: string | null;
  createdByIp: string | null;
  device: UserDevice | null;
  inverseReplacedByToken: RefreshToken[];
  replacedByToken: RefreshToken | null;
  user: User;
}

export type User = IdentityUserOfGuid & {
  autoplayBoards?: AutoplayBoard[];
  balanceHistories?: BalanceHistory[];
  boards?: Board[];
  refreshTokens?: RefreshToken[];
  transactions?: Transaction[];
  userDevices?: UserDevice[];
  userHistoryAffectedUsers?: UserHistory[];
  userHistoryChangeMadeByUsers?: UserHistory[];
  /** @format int32 */
  credits?: number;
  status?: UserStatus;
  /** @format date-time */
  timestamp?: string;
};

export interface AutoplayBoard {
  /** @format guid */
  id: string;
  /** @format date-time */
  timestamp: string;
  /** @format guid */
  userId: string;
  configuration: number[];
  /** @format guid */
  purchaseId: string;
  purchase: Purchase;
  user: User;
}

export interface Purchase {
  /** @format guid */
  id: string;
  /** @format date-time */
  timestamp: string;
  /** @format int32 */
  price: number;
  autoplayBoards: AutoplayBoard[];
  boards: Board[];
}

export interface Board {
  /** @format guid */
  id: string;
  /** @format date-time */
  timestamp: string;
  /** @format guid */
  userId: string;
  /** @format guid */
  gameId: string;
  configuration: number[];
  /** @format guid */
  purchaseId: string;
  game: Game;
  purchase: Purchase;
  user: User;
}

export interface Game {
  /** @format guid */
  id: string;
  /** @format date-time */
  timestamp: string;
  /** @format date-time */
  startTime: string;
  /** @format date-time */
  endTime: string;
  /** @format int32 */
  fieldCount: number;
  boards: Board[];
  winnerSequences: WinnerSequence[];
}

export interface WinnerSequence {
  /** @format guid */
  id: string;
  /** @format date-time */
  timestamp: string;
  /** @format guid */
  gameId: string;
  sequence: number[];
  game: Game;
}

export interface BalanceHistory {
  /** @format guid */
  id: string;
  /** @format date-time */
  timestamp: string;
  /** @format guid */
  userId: string;
  /** @format int32 */
  amount: number;
  /** @format guid */
  additionalId: string | null;
  /**
   * @minLength 0
   * @maxLength 50
   */
  action: string;
  user: User;
}

export interface Transaction {
  /** @format guid */
  id: string;
  /** @format date-time */
  timestamp: string;
  /** @format guid */
  userId: string;
  /** @format int32 */
  credits: number;
  /**
   * @minLength 0
   * @maxLength 50
   */
  mobilepayTransactionNumber: string | null;
  user: User;
}

export interface UserHistory {
  /** @format guid */
  id: string;
  /** @format date-time */
  timestamp: string;
  /** @format guid */
  affectedUserId: string;
  /** @format guid */
  changeMadeByUserId: string;
  /**
   * @minLength 0
   * @maxLength 256
   */
  email: string;
  passwordHash: string;
  phoneNumber: string;
  /**
   * @minLength 0
   * @maxLength 50
   */
  status: string;
  affectedUser: User;
  changeMadeByUser: User;
}

export enum UserStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export interface IdentityUserOfGuid {
  /** @format guid */
  id: string;
  userName: string | null;
  normalizedUserName: string | null;
  email: string | null;
  normalizedEmail: string | null;
  emailConfirmed: boolean;
  passwordHash: string | null;
  securityStamp: string | null;
  concurrencyStamp: string | null;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  /** @format date-time */
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  /** @format int32 */
  accessFailedCount: number;
}

export interface BoardPickResponse {
  /**
   * @format guid
   * @minLength 1
   */
  purchaseId: string;
  selectedNumbers: number[];
  /** @format int32 */
  amount: number;
  /** @format int32 */
  total: number;
}

/** @example {"amount":1,"selectedNumbers":[1,2,3,4,5]} */
export interface BoardPickRequest {
  /** @format int32 */
  amount: number;
  selectedNumbers: number[];
}

export interface GameStatusResponse {
  /** @format int32 */
  gameWeek: number;
  isGameActive: boolean;
  /** @format int64 */
  startTime: number | null;
  /** @format int64 */
  endTime: number | null;
  /** @format int32 */
  timeLeft: number;
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "http://localhost:5009" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Jerne IF API
 * @version v1
 * @baseUrl http://localhost:5009
 *
 * API til Jerne IF døde duer
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * No description
     *
     * @tags Auth
     * @name Login
     * @request POST:/api/auth/login
     * @secure
     */
    login: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<LoginResponse, any>({
        path: `/api/auth/login`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name Register
     * @request POST:/api/auth/register
     * @secure
     */
    register: (data: RegisterRequest, params: RequestParams = {}) =>
      this.request<RegisterResponse, any>({
        path: `/api/auth/register`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name Logout
     * @request POST:/api/auth/logout
     * @secure
     */
    logout: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/auth/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name UserInfo
     * @request GET:/api/auth/me
     * @secure
     */
    userInfo: (params: RequestParams = {}) =>
      this.request<UserInfoResponse, any>({
        path: `/api/auth/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name Refresh
     * @request POST:/api/auth/refresh
     * @secure
     */
    refresh: (params: RequestParams = {}) =>
      this.request<RefreshResponse, any>({
        path: `/api/auth/refresh`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name VerifyEmail
     * @request GET:/api/auth/verify-email
     * @secure
     */
    verifyEmail: (
      query?: {
        Token?: string;
        Email?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<File, any>({
        path: `/api/auth/verify-email`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name InitiatePasswordReset
     * @request POST:/api/auth/forgot-password
     * @secure
     */
    initiatePasswordReset: (data: ForgotPasswordRequest, params: RequestParams = {}) =>
      this.request<any, ProblemDetails>({
        path: `/api/auth/forgot-password`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name VerifyResetCode
     * @request POST:/api/auth/verify-reset-code
     * @secure
     */
    verifyResetCode: (data: VerifyResetCodeRequest, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/auth/verify-reset-code`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name CompletePasswordReset
     * @request POST:/api/auth/complete-password-reset
     * @secure
     */
    completePasswordReset: (data: CompletePasswordResetRequest, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/auth/complete-password-reset`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name GetDevices
     * @request GET:/api/auth/devices
     * @secure
     */
    getDevices: (params: RequestParams = {}) =>
      this.request<UserDevice[], any>({
        path: `/api/auth/devices`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name RevokeDevice
     * @request DELETE:/api/auth/devices/{deviceId}
     * @secure
     */
    revokeDevice: (deviceId: string, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/auth/devices/${deviceId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  board = {
    /**
     * No description
     *
     * @tags Board
     * @name PickBoard
     * @request POST:/api/board/pick
     * @secure
     */
    pickBoard: (data: BoardPickRequest, params: RequestParams = {}) =>
      this.request<BoardPickResponse, any>({
        path: `/api/board/pick`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Board
     * @name GetStatus
     * @request GET:/api/board/status
     * @secure
     */
    getStatus: (params: RequestParams = {}) =>
      this.request<GameStatusResponse, any>({
        path: `/api/board/status`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
