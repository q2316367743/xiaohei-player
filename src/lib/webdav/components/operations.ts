import type {
  CopyFileOptions,
  CreateDirectoryOptions,
  DAVCompliance,
  DiskQuota,
  FileStat,
  GetDirectoryContentsOptionsWithDetails,
  GetDirectoryContentsOptionsWithoutDetails,
  GetFileContentsOptions,
  GetQuotaOptions,
  Headers,
  LockOptions,
  LockResponse,
  MoveFileOptions,
  PutFileContentsOptions,
  RequestOptionsCustom,
  ResponseDataDetailed,
  SearchResult,
  StatOptions,
  WebDAVClientContext,
  WebDAVMethodOptions,
} from "../types";
import type { AxiosResponse } from "axios";
import { request, requestWithBody, requestWithDetails, createRequestOptions, WebDAVRequestError } from "./request";
import { createPropFindXML, createXMLParser, parseWebDAVResult, createLockXML } from "./xml";
import { parseDirectoryContents, parseQuota, parseLockResponse, parseDAVCompliance, parseSearchResult } from "./parsers";
import { generateLockToken } from "./url";

const DEFAULT_PROPS = [
  "d:displayname",
  "d:resourcetype",
  "d:getlastmodified",
  "d:getetag",
  "d:getcontentlength",
  "d:getcontenttype",
  "d:quota-available-bytes",
  "d:quota-used-bytes",
];

function isSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}

export async function getDirectoryContents(
  context: WebDAVClientContext,
  path: string,
  options: GetDirectoryContentsOptionsWithDetails
): Promise<ResponseDataDetailed<FileStat[]>>;
export async function getDirectoryContents(
  context: WebDAVClientContext,
  path: string,
  options?: GetDirectoryContentsOptionsWithoutDetails
): Promise<FileStat[]>;
export async function getDirectoryContents(
  context: WebDAVClientContext,
  path: string,
  options: GetDirectoryContentsOptionsWithDetails | GetDirectoryContentsOptionsWithoutDetails = {}
): Promise<FileStat[] | ResponseDataDetailed<FileStat[]>> {
  const { deep, includeSelf, details } = options;
  
  const depth = deep ? "infinity" : "1";
  const builder = createXMLParser({
    attributeNamePrefix: "@_",
    attributeParsers: [],
    tagParsers: [],
  });
  
  const propFindXML = createPropFindXML(DEFAULT_PROPS, builder as any);
  
  const requestOptions = createRequestOptions("PROPFIND", path, context, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      Depth: depth,
    },
    data: propFindXML,
    ...options,
  });

  if (details) {
    const response = await requestWithDetails<string>(context, requestOptions);
    const parser = createXMLParser(context.parsing);
    const result = parseWebDAVResult(response.data, parser);
    const files = parseDirectoryContents(result, { includeSelf });
    
    return {
      ...response,
      data: files,
    };
  }

  const xml = await requestWithBody<string>(context, requestOptions);
  const parser = createXMLParser(context.parsing);
  const result = parseWebDAVResult(xml, parser);
  return parseDirectoryContents(result, { includeSelf });
}

export async function createDirectory(
  context: WebDAVClientContext,
  path: string,
  options: CreateDirectoryOptions = {}
): Promise<void> {
  const { recursive } = options;

  if (recursive) {
    const segments = path.split("/").filter(Boolean);
    let currentPath = "";
    
    for (const segment of segments) {
      currentPath += `/${segment}`;
      try {
        await createDirectory(context, currentPath, { ...options, recursive: false });
      } catch (error) {
        if (error instanceof WebDAVRequestError && error.status === 405) {
          continue;
        }
        throw error;
      }
    }
    return;
  }

  const requestOptions = createRequestOptions("MKCOL", path, context, options);
  const response = await request(context, requestOptions);
  
  if (!isSuccess(response.status) && response.status !== 405) {
    throw new WebDAVRequestError(
      `Failed to create directory: ${response.statusText}`,
      response.status,
      response
    );
  }
}

export async function deleteFile(
  context: WebDAVClientContext,
  path: string,
  options: WebDAVMethodOptions = {}
): Promise<void> {
  const requestOptions = createRequestOptions("DELETE", path, context, options);
  const response = await request(context, requestOptions);
  
  if (!isSuccess(response.status) && response.status !== 204 && response.status !== 200) {
    throw new WebDAVRequestError(
      `Failed to delete: ${response.statusText}`,
      response.status,
      response
    );
  }
}

export async function moveFile(
  context: WebDAVClientContext,
  filename: string,
  destinationFilename: string,
  options: MoveFileOptions = {}
): Promise<void> {
  const { overwrite = true } = options;
  
  const destinationURL = `${context.remoteURL}${encodeURI(destinationFilename)}`;
  
  const requestOptions = createRequestOptions("MOVE", filename, context, {
    ...options,
    headers: {
      Destination: destinationURL,
      Overwrite: overwrite ? "T" : "F",
      ...options.headers,
    },
  });

  const response = await request(context, requestOptions);
  
  if (!isSuccess(response.status) && response.status !== 201 && response.status !== 204) {
    throw new WebDAVRequestError(
      `Failed to move: ${response.statusText}`,
      response.status,
      response
    );
  }
}

export async function copyFile(
  context: WebDAVClientContext,
  filename: string,
  destination: string,
  options: CopyFileOptions = {}
): Promise<void> {
  const { overwrite = true, shallow = false } = options;
  
  const destinationURL = `${context.remoteURL}${encodeURI(destination)}`;
  
  const requestOptions = createRequestOptions("COPY", filename, context, {
    ...options,
    headers: {
      Destination: destinationURL,
      Overwrite: overwrite ? "T" : "F",
      Depth: shallow ? "0" : "infinity",
      ...options.headers,
    },
  });

  const response = await request(context, requestOptions);
  
  if (!isSuccess(response.status) && response.status !== 201 && response.status !== 204) {
    throw new WebDAVRequestError(
      `Failed to copy: ${response.statusText}`,
      response.status,
      response
    );
  }
}

export async function getFileContents(
  context: WebDAVClientContext,
  filename: string,
  options: GetFileContentsOptions = {}
): Promise<ArrayBuffer | string | ResponseDataDetailed<ArrayBuffer | string>> {
  const { details, format } = options;
  
  const requestOptions = createRequestOptions("GET", filename, context, options);

  if (details) {
    const response = await requestWithDetails<ArrayBuffer | string>(context, requestOptions);
    
    if (format === "text") {
      if (typeof response.data === "string") {
        return response;
      }
      const decoder = new TextDecoder("utf-8");
      return {
        ...response,
        data: decoder.decode(response.data as ArrayBuffer),
      };
    }
    
    return response;
  }

  const response = await request(context, requestOptions);
  
  if (!isSuccess(response.status)) {
    throw new WebDAVRequestError(
      `Failed to get file contents: ${response.statusText}`,
      response.status,
      response
    );
  }

  if (format === "text") {
    return new TextDecoder("utf-8").decode(response.data);
  }
  
  return response.data;
}

export async function putFileContents(
  context: WebDAVClientContext,
  filename: string,
  data: string | ArrayBuffer | Uint8Array,
  options: PutFileContentsOptions = {}
): Promise<boolean> {
  const { overwrite = true, contentLength } = options;
  
  const headers: Headers = {
    "Content-Type": "application/octet-stream",
    ...options.headers,
  };

  if (!overwrite) {
    headers["If-None-Match"] = "*";
  }

  if (contentLength !== false) {
    const length = typeof contentLength === "number" 
      ? contentLength 
      : typeof data === "string" 
        ? new TextEncoder().encode(data).length 
        : data.byteLength;
    headers["Content-Length"] = String(length);
  }

  const requestOptions = createRequestOptions("PUT", filename, context, {
    ...options,
    headers,
    data,
  });

  const response = await request(context, requestOptions);
  
  if (!isSuccess(response.status) && response.status !== 201 && response.status !== 204) {
    throw new WebDAVRequestError(
      `Failed to put file contents: ${response.statusText}`,
      response.status,
      response
    );
  }

  return true;
}

export async function stat(
  context: WebDAVClientContext,
  path: string,
  options: StatOptions = {}
): Promise<FileStat | ResponseDataDetailed<FileStat>> {
  const { details } = options;
  
  const builder = createXMLParser({
    attributeNamePrefix: "@_",
    attributeParsers: [],
    tagParsers: [],
  });
  
  const propFindXML = createPropFindXML(DEFAULT_PROPS, builder as any);
  
  const requestOptions = createRequestOptions("PROPFIND", path, context, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      Depth: "0",
    },
    data: propFindXML,
    ...options,
  });

  if (details) {
    const response = await requestWithDetails<string>(context, requestOptions);
    const parser = createXMLParser(context.parsing);
    const result = parseWebDAVResult(response.data, parser);
    const files = parseDirectoryContents(result, { includeSelf: true });
    
    const file = files[0];
    if (!file) {
      throw new WebDAVRequestError("File not found", 404);
    }
    
    return {
      ...response,
      data: file,
    };
  }

  const xml = await requestWithBody<string>(context, requestOptions);
  const parser = createXMLParser(context.parsing);
  const result = parseWebDAVResult(xml, parser);
  const files = parseDirectoryContents(result, { includeSelf: true });
  
  const file = files[0];
  if (!file) {
    throw new WebDAVRequestError("File not found", 404);
  }
  
  return file;
}

export async function exists(
  context: WebDAVClientContext,
  path: string,
  options: WebDAVMethodOptions = {}
): Promise<boolean> {
  try {
    await stat(context, path, options);
    return true;
  } catch (error) {
    if (error instanceof WebDAVRequestError && error.status === 404) {
      return false;
    }
    throw error;
  }
}

export async function getQuota(
  context: WebDAVClientContext,
  options: GetQuotaOptions = {}
): Promise<DiskQuota | null | ResponseDataDetailed<DiskQuota | null>> {
  const { details, path: quotaPath = "/" } = options;
  
  const builder = createXMLParser({
    attributeNamePrefix: "@_",
    attributeParsers: [],
    tagParsers: [],
  });
  
  const propFindXML = createPropFindXML(
    ["d:quota-available-bytes", "d:quota-used-bytes"],
    builder as any
  );
  
  const requestOptions = createRequestOptions("PROPFIND", quotaPath, context, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      Depth: "0",
    },
    data: propFindXML,
    ...options,
  });

  if (details) {
    const response = await requestWithDetails<string>(context, requestOptions);
    const parser = createXMLParser(context.parsing);
    const result = parseWebDAVResult(response.data, parser);
    const quota = parseQuota(result);
    
    return {
      ...response,
      data: quota,
    };
  }

  const xml = await requestWithBody<string>(context, requestOptions);
  const parser = createXMLParser(context.parsing);
  const result = parseWebDAVResult(xml, parser);
  return parseQuota(result);
}

export async function lock(
  context: WebDAVClientContext,
  path: string,
  options: LockOptions = {}
): Promise<LockResponse> {
  const { timeout = "Infinite" } = options;
  
  const lockToken = generateLockToken();
  const lockXML = createLockXML(context.remoteURL, createXMLParser({
    attributeNamePrefix: "@_",
    attributeParsers: [],
    tagParsers: [],
  }) as any);
  
  const requestOptions = createRequestOptions("LOCK", path, context, {
    ...options,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      Timeout: timeout,
      ...options.headers,
    },
    data: lockXML,
  });

  const response = await request(context, requestOptions);
  
  if (!isSuccess(response.status)) {
    throw new WebDAVRequestError(
      `Failed to lock: ${response.statusText}`,
      response.status,
      response
    );
  }

  const xml = new TextDecoder().decode(response.data);
  const lockResponse = parseLockResponse(xml);
  
  if (!lockResponse) {
    return {
      token: lockToken,
      serverTimeout: timeout,
    };
  }
  
  return lockResponse;
}

export async function unlock(
  context: WebDAVClientContext,
  path: string,
  token: string,
  options: WebDAVMethodOptions = {}
): Promise<void> {
  const requestOptions = createRequestOptions("UNLOCK", path, context, {
    ...options,
    headers: {
      "Lock-Token": `<${token}>`,
      ...options.headers,
    },
  });

  const response = await request(context, requestOptions);
  
  if (!isSuccess(response.status) && response.status !== 204) {
    throw new WebDAVRequestError(
      `Failed to unlock: ${response.statusText}`,
      response.status,
      response
    );
  }
}

export async function getDAVCompliance(
  context: WebDAVClientContext,
  path: string
): Promise<DAVCompliance> {
  const requestOptions = createRequestOptions("OPTIONS", path, context);
  const response = await request(context, requestOptions);
  
  if (!isSuccess(response.status)) {
    throw new WebDAVRequestError(
      `Failed to get DAV compliance: ${response.statusText}`,
      response.status,
      response
    );
  }
  
  return parseDAVCompliance(response);
}

export async function search(
  context: WebDAVClientContext,
  path: string,
  options: { details?: boolean } = {}
): Promise<SearchResult | ResponseDataDetailed<SearchResult>> {
  const { details } = options;
  
  const builder = createXMLParser({
    attributeNamePrefix: "@_",
    attributeParsers: [],
    tagParsers: [],
  });
  
  const propFindXML = createPropFindXML(DEFAULT_PROPS, builder as any);
  
  const requestOptions = createRequestOptions("SEARCH", path, context, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
    data: propFindXML,
  });

  if (details) {
    const response = await requestWithDetails<string>(context, requestOptions);
    const parser = createXMLParser(context.parsing);
    const result = parseWebDAVResult(response.data, parser);
    const searchResult = parseSearchResult(result);
    
    return {
      ...response,
      data: searchResult,
    };
  }

  const xml = await requestWithBody<string>(context, requestOptions);
  const parser = createXMLParser(context.parsing);
  const result = parseWebDAVResult(xml, parser);
  return parseSearchResult(result);
}

export function getFileDownloadLink(
  context: WebDAVClientContext,
  filename: string
): string {
  return `${context.remoteURL}${encodeURI(filename)}`;
}

export function getFileUploadLink(
  context: WebDAVClientContext,
  filename: string
): string {
  return `${context.remoteURL}${encodeURI(filename)}`;
}

export async function customRequest(
  context: WebDAVClientContext,
  path: string,
  requestOptions: RequestOptionsCustom
): Promise<AxiosResponse> {
  const options = createRequestOptions(
    requestOptions.method,
    path,
    context,
    requestOptions
  );
  return request(context, options);
}
