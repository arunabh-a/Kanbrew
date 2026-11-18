import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Centralized API response envelope.
 *
 * Success:
 * {
 *   "success": true,
 *   "status": 200,
 *   "message": "Resource retrieved successfully.",
 *   "data": { ... },
 *   "meta": { "timestamp": "2026-08-05T00:17:00Z" }
 * }
 *
 * Error:
 * {
 *   "success": false,
 *   "status": 400,
 *   "message": "Bad request.",
 *   "data": null,
 *   "meta": { "timestamp": "..." },
 *   "errors"?: ...
 * }
 */

export type ApiMeta = {
    timestamp: string;
    [key: string]: unknown;
};

export type ApiSuccessResponse<T = unknown> = {
    success: true;
    status: number;
    message: string;
    data: T;
    meta: ApiMeta;
};

export type ApiErrorResponse = {
    success: false;
    status: number;
    message: string;
    data: null;
    meta: ApiMeta;
    errors?: unknown;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

const DEFAULT_SUCCESS_MESSAGES: Partial<Record<number, string>> = {
    200: "Resource retrieved successfully.",
    201: "Resource created successfully.",
    202: "Request accepted.",
};

const DEFAULT_ERROR_MESSAGES: Partial<Record<number, string>> = {
    400: "Bad request.",
    401: "Unauthorized.",
    403: "Forbidden.",
    404: "Resource not found.",
    409: "Conflict.",
    422: "Validation failed.",
    500: "Internal server error.",
};

export function buildMeta(extra?: Record<string, unknown>): ApiMeta {
    return {
        timestamp: new Date().toISOString(),
        ...extra,
    };
}

type OkOptions = {
    status?: ContentfulStatusCode;
    message?: string;
    meta?: Record<string, unknown>;
};

type FailOptions = {
    status?: ContentfulStatusCode;
    errors?: unknown;
    meta?: Record<string, unknown>;
};

/** Send a standardized success response. */
export function ok<T>(c: Context, data: T, options: OkOptions = {}) {
    const status = (options.status ?? 200) as ContentfulStatusCode;
    const body: ApiSuccessResponse<T> = {
        success: true,
        status,
        message:
            options.message ??
            DEFAULT_SUCCESS_MESSAGES[status] ??
            "Success.",
        data,
        meta: buildMeta(options.meta),
    };
    return c.json(body, status);
}

/** Send a standardized error response. */
export function fail(c: Context, message: string, options: FailOptions = {}) {
    const status = (options.status ?? 400) as ContentfulStatusCode;
    const body: ApiErrorResponse = {
        success: false,
        status,
        message:
            message ||
            DEFAULT_ERROR_MESSAGES[status] ||
            "Request failed.",
        data: null,
        meta: buildMeta(options.meta),
        ...(options.errors !== undefined ? { errors: options.errors } : {}),
    };
    return c.json(body, status);
}