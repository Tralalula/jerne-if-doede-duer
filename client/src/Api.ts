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
  /** @format guid */
  id: string;
  email: string;
  fullName: string;
}

/** @example {"email":"børge@example.com","firstName":"Børge","lastName":"Steensen","phoneNumber":"12345678"} */
export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
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
  transactionReviewedByUsers?: Transaction[];
  transactionUsers?: Transaction[];
  userDevices?: UserDevice[];
  userHistoryAffectedUsers?: UserHistory[];
  userHistoryChangeMadeByUsers?: UserHistory[];
  fullName?: string;
  /**
   * @minLength 0
   * @maxLength 50
   */
  firstName?: string;
  /**
   * @minLength 0
   * @maxLength 50
   */
  lastName?: string;
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
  active: boolean;
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
  mobilepayTransactionNumber: string;
  /**
   * @minLength 0
   * @maxLength 20
   */
  status: string;
  /** @format guid */
  reviewedByUserId: string | null;
  /** @format date-time */
  reviewedAt: string | null;
  reviewedByUser: User | null;
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
  phoneNumber?: string;
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
  phoneNumber?: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  /** @format date-time */
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  /** @format int32 */
  accessFailedCount: number;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
  password: string;
}

export interface PagedBalanceHistoryResponse {
  items: BalanceHistoryEntryResponse[];
  pagingInfo: PagingInfo;
}

export interface BalanceHistoryEntryResponse {
  /** @format guid */
  id: string;
  /** @format date-time */
  timestamp: string;
  /** @format guid */
  userId: string;
  /** @format int32 */
  amount: number;
  action: BalanceAction;
}

export enum BalanceAction {
  UserBought = "UserBought",
  UserUsed = "UserUsed",
  AdminAssigned = "AdminAssigned",
  AdminRevoked = "AdminRevoked",
  WonPrize = "WonPrize",
}

export interface PagingInfo {
  /** @format int32 */
  totalItems: number;
  /** @format int32 */
  itemsPerPage: number;
  /** @format int32 */
  currentPage: number;
  /** @format int32 */
  totalPages: number;
}

export enum SortOrder {
  Asc = "Asc",
  Desc = "Desc",
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

export interface BoardWinningSequenceConfirmedResponse {
  /**
   * @format guid
   * @minLength 1
   */
  gameId: string;
  /** @format int32 */
  gameWeek: number;
  /** @format int32 */
  totalWinners: number;
  boards: BoardResponse[];
}

export interface BoardResponse {
  /**
   * @format guid
   * @minLength 1
   */
  boardId: string;
  configuration: number[] | null;
  /** @format int32 */
  price: number;
  /**
   * @format date-time
   * @minLength 1
   */
  placedOn: string;
  user: UserResponse | null;
}

export interface UserResponse {
  /** @format guid */
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface BoardWinningSequenceRequest {
  selectedNumbers: number[];
}

export interface BoardWinningSequenceResponse {
  /** @format int32 */
  winnerAmounts: number;
  /**
   * @format guid
   * @minLength 1
   */
  gameId: string;
  /** @format int32 */
  currentGameField: number;
  selectedNumbers: number[];
}

export interface BoardPagedHistoryResponse {
  boards: BoardHistoryResponse[];
  pagingInfo: PagingInfo;
}

export type BoardHistoryResponse = BoardResponse & {
  /** @format guid */
  gameId?: string;
  /** @format int32 */
  gameWeek?: number;
  wasWin?: boolean;
  isActiveGame?: boolean;
};

export interface GameHistoryPagedResponse {
  games: GameResponse[];
  pagingInfo: PagingInfo;
}

export interface GameResponse {
  /** @format guid */
  id: string;
  /** @format date-time */
  startTime: string;
  /** @format date-time */
  endTime: string;
  /** @format int32 */
  week: number;
  active: boolean;
  /** @format int32 */
  entries: number;
  /** @format int32 */
  totalPool: number;
}

export type GameHistoryResponse = GameResponse & {
  /** @format int32 */
  totalWinAmount?: number;
  winningSequence?: number[];
  boards?: BoardHistoryPagedResponse | null;
};

export interface BoardHistoryPagedResponse {
  boards: BoardGameHistoryResponse[];
  pagingInfo: PagingInfo;
}

export type BoardGameHistoryResponse = BoardResponse & {
  wasWin?: boolean;
};

export interface BalanceResponse {
  /** @format int32 */
  currentBalance: number;
  /** @format int32 */
  pendingCredits: number;
}

export interface TransactionResponse {
  /** @format guid */
  id: string;
  /** @format date-time */
  timestamp: string;
  /** @format int32 */
  credits: number;
  mobilePayTransactionNumber: string;
  status: TransactionStatus;
}

export enum TransactionStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Denied = "Denied",
}

export interface CreateTransactionRequest {
  /** @format int32 */
  credits: number;
  mobilePayTransactionNumber: string;
}

export interface PagedTransactionResponse {
  items: TransactionDetailsResponse[];
  pagingInfo: PagingInfo;
}

export interface TransactionDetailsResponse {
  /** @format guid */
  id: string;
  /** @format date-time */
  timestamp: string;
  /** @format int32 */
  credits: number;
  mobilePayTransactionNumber: string;
  status: TransactionStatus;
  /** @format guid */
  reviewedByUserId: string | null;
  /** @format date-time */
  reviewedAt: string | null;
}

export enum TransactionOrderBy {
  Timestamp = "Timestamp",
  Credits = "Credits",
  Status = "Status",
}

export interface UserDetailsResponse {
  /** @format guid */
  id: string;
  email: string;
  phoneNumber?: string;
  status: UserStatus;
  /** @format int32 */
  credits: number;
  /** @format date-time */
  timestamp: string;
  roles: string[];
}

export interface PagedUserResponse {
  items: UserDetailsResponse[];
  pagingInfo: PagingInfo;
}

export enum RoleType {
  Admin = "Admin",
  Player = "Player",
}

export enum UserOrderBy {
  Timestamp = "Timestamp",
  Email = "Email",
  Credits = "Credits",
  Status = "Status",
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email: string | null;
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

    /**
     * No description
     *
     * @tags Auth
     * @name UpdateProfile
     * @request PUT:/api/auth/profile
     * @secure
     */
    updateProfile: (data: UpdateProfileRequest, params: RequestParams = {}) =>
      this.request<UserInfoResponse, any>({
        path: `/api/auth/profile`,
        method: "PUT",
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
     * @name ChangePassword
     * @request POST:/api/auth/change-password
     * @secure
     */
    changePassword: (data: ChangePasswordRequest, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/auth/change-password`,
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
     * @name InitiateEmailChange
     * @request POST:/api/auth/change-email
     * @secure
     */
    initiateEmailChange: (data: ChangeEmailRequest, params: RequestParams = {}) =>
      this.request<any, ProblemDetails>({
        path: `/api/auth/change-email`,
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
     * @name VerifyEmailChange
     * @request GET:/api/auth/verify-email-change
     * @secure
     */
    verifyEmailChange: (
      query?: {
        OldEmail?: string;
        NewEmail?: string;
        Token?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<File, any>({
        path: `/api/auth/verify-email-change`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  balancehistory = {
    /**
     * No description
     *
     * @tags BalanceHistory
     * @name GetMyBalanceHistory
     * @request GET:/api/balancehistory/my
     * @secure
     */
    getMyBalanceHistory: (
      query?: {
        /** @format int32 */
        Page?: number;
        /** @format int32 */
        PageSize?: number;
        Action?: BalanceAction | null;
        /** @format date */
        FromDate?: string | null;
        /** @format date */
        ToDate?: string | null;
        Sort?: SortOrder;
      },
      params: RequestParams = {},
    ) =>
      this.request<PagedBalanceHistoryResponse, any>({
        path: `/api/balancehistory/my`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BalanceHistory
     * @name GetUserBalanceHistory
     * @request GET:/api/balancehistory/users/{userId}
     * @secure
     */
    getUserBalanceHistory: (
      userId: string,
      query?: {
        /** @format int32 */
        Page?: number;
        /** @format int32 */
        PageSize?: number;
        Action?: BalanceAction | null;
        /** @format date */
        FromDate?: string | null;
        /** @format date */
        ToDate?: string | null;
        Sort?: SortOrder;
      },
      params: RequestParams = {},
    ) =>
      this.request<PagedBalanceHistoryResponse, any>({
        path: `/api/balancehistory/users/${userId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BalanceHistory
     * @name GetAllBalanceHistory
     * @request GET:/api/balancehistory/all
     * @secure
     */
    getAllBalanceHistory: (
      query?: {
        /** @format int32 */
        Page?: number;
        /** @format int32 */
        PageSize?: number;
        Action?: BalanceAction | null;
        /** @format date */
        FromDate?: string | null;
        /** @format date */
        ToDate?: string | null;
        Sort?: SortOrder;
      },
      params: RequestParams = {},
    ) =>
      this.request<PagedBalanceHistoryResponse, any>({
        path: `/api/balancehistory/all`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
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

    /**
     * No description
     *
     * @tags Board
     * @name ConfirmWinningSequence
     * @request POST:/api/board/winner-sequence/confirm
     * @secure
     */
    confirmWinningSequence: (data: BoardWinningSequenceRequest, params: RequestParams = {}) =>
      this.request<BoardWinningSequenceConfirmedResponse, any>({
        path: `/api/board/winner-sequence/confirm`,
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
     * @name PickWinningSequence
     * @request GET:/api/board/winner-sequence
     * @secure
     */
    pickWinningSequence: (
      query?: {
        numbers?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<BoardWinningSequenceResponse, any>({
        path: `/api/board/winner-sequence`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Board
     * @name GetBoardHistory
     * @request GET:/api/board/history
     * @secure
     */
    getBoardHistory: (
      query?: {
        /** @format int32 */
        Page?: number;
        /** @format int32 */
        PageSize?: number;
        /** @format date */
        FromDate?: string | null;
        /** @format date */
        ToDate?: string | null;
        Sort?: SortOrder;
      },
      params: RequestParams = {},
    ) =>
      this.request<BoardPagedHistoryResponse, any>({
        path: `/api/board/history`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  game = {
    /**
     * No description
     *
     * @tags Game
     * @name GetHistory
     * @request GET:/api/game/history
     * @secure
     */
    getHistory: (
      query?: {
        /** @format int32 */
        Page?: number;
        /** @format int32 */
        PageSize?: number;
        /** @format date */
        FromDate?: string | null;
        /** @format date */
        ToDate?: string | null;
        Sort?: SortOrder;
      },
      params: RequestParams = {},
    ) =>
      this.request<GameHistoryPagedResponse, any>({
        path: `/api/game/history`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Game
     * @name GetGameBoardHistory
     * @request GET:/api/game/history/{gameId}
     * @secure
     */
    getGameBoardHistory: (
      gameId: string,
      query?: {
        /** @format int32 */
        Page?: number;
        /** @format int32 */
        PageSize?: number;
        /** @format date */
        FromDate?: string | null;
        /** @format date */
        ToDate?: string | null;
        Sort?: SortOrder;
      },
      params: RequestParams = {},
    ) =>
      this.request<GameHistoryResponse, any>({
        path: `/api/game/history/${gameId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  transaction = {
    /**
     * No description
     *
     * @tags Transaction
     * @name GetBalance
     * @request GET:/api/transaction/balance
     * @secure
     */
    getBalance: (params: RequestParams = {}) =>
      this.request<BalanceResponse, any>({
        path: `/api/transaction/balance`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Transaction
     * @name CreateTransaction
     * @request POST:/api/transaction
     * @secure
     */
    createTransaction: (data: CreateTransactionRequest, params: RequestParams = {}) =>
      this.request<TransactionResponse, any>({
        path: `/api/transaction`,
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
     * @tags Transaction
     * @name GetMyTransactions
     * @request GET:/api/transaction/my
     * @secure
     */
    getMyTransactions: (
      query?: {
        /** @format int32 */
        Page?: number;
        /** @format int32 */
        PageSize?: number;
        Status?: TransactionStatus | null;
        OrderBy?: TransactionOrderBy;
        Sort?: SortOrder;
        /** @format date */
        FromDate?: string | null;
        /** @format date */
        ToDate?: string | null;
        /** @format int32 */
        MinCredits?: number | null;
        /** @format int32 */
        MaxCredits?: number | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<PagedTransactionResponse, any>({
        path: `/api/transaction/my`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Transaction
     * @name GetAllTransactions
     * @request GET:/api/transaction/all
     * @secure
     */
    getAllTransactions: (
      query?: {
        /** @format int32 */
        Page?: number;
        /** @format int32 */
        PageSize?: number;
        Status?: TransactionStatus | null;
        OrderBy?: TransactionOrderBy;
        Sort?: SortOrder;
        /** @format date */
        FromDate?: string | null;
        /** @format date */
        ToDate?: string | null;
        /** @format int32 */
        MinCredits?: number | null;
        /** @format int32 */
        MaxCredits?: number | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<PagedTransactionResponse, any>({
        path: `/api/transaction/all`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Transaction
     * @name AcceptTransaction
     * @request POST:/api/transaction/{id}/accept
     * @secure
     */
    acceptTransaction: (id: string, params: RequestParams = {}) =>
      this.request<TransactionDetailsResponse, any>({
        path: `/api/transaction/${id}/accept`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Transaction
     * @name DenyTransaction
     * @request POST:/api/transaction/{id}/deny
     * @secure
     */
    denyTransaction: (id: string, params: RequestParams = {}) =>
      this.request<any, ProblemDetails>({
        path: `/api/transaction/${id}/deny`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  user = {
    /**
     * No description
     *
     * @tags User
     * @name GetUser
     * @request GET:/api/user/{id}
     * @secure
     */
    getUser: (id: string, params: RequestParams = {}) =>
      this.request<UserDetailsResponse, any>({
        path: `/api/user/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UpdateUser
     * @request PUT:/api/user/{id}
     * @secure
     */
    updateUser: (id: string, data: UpdateUserRequest, params: RequestParams = {}) =>
      this.request<UserDetailsResponse, any>({
        path: `/api/user/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name GetUsers
     * @request GET:/api/user
     * @secure
     */
    getUsers: (
      query?: {
        /** @format int32 */
        Page?: number;
        /** @format int32 */
        PageSize?: number;
        Status?: UserStatus | null;
        Search?: string | null;
        Role?: RoleType | null;
        OrderBy?: UserOrderBy;
        Sort?: SortOrder;
      },
      params: RequestParams = {},
    ) =>
      this.request<PagedUserResponse, any>({
        path: `/api/user`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name ActivateUser
     * @request POST:/api/user/{id}/activate
     * @secure
     */
    activateUser: (id: string, params: RequestParams = {}) =>
      this.request<UserDetailsResponse, any>({
        path: `/api/user/${id}/activate`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name DeactivateUser
     * @request POST:/api/user/{id}/deactivate
     * @secure
     */
    deactivateUser: (id: string, params: RequestParams = {}) =>
      this.request<UserDetailsResponse, any>({
        path: `/api/user/${id}/deactivate`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
