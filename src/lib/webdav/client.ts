import type {
  WebDAVClient,
  WebDAVClientOptions,
  WebDAVClientContext,
  Headers,
  FileStat,
  DAVCompliance,
  DiskQuota,
  LockResponse,
  SearchResult,
  ResponseDataDetailed,
  GetDirectoryContentsOptionsWithDetails,
  GetDirectoryContentsOptionsWithoutDetails,
  GetFileContentsOptions,
  GetQuotaOptions,
  StatOptions,
  SearchOptions,
  CreateDirectoryOptions,
  CopyFileOptions,
  MoveFileOptions,
  PutFileContentsOptions,
  LockOptions,
  WebDAVMethodOptions,
  RequestOptionsCustom,
  WebDAVAttributeParser,
  WebDAVTagParser,
  BufferLike,
} from "./types";
import type { AxiosResponse } from "axios";
import { buildAuthHeaders, getAuthType, createDigestContext } from "./components/auth";
import { buildRemoteURL } from "./components/url";
import {
  getDirectoryContents,
  createDirectory,
  deleteFile,
  moveFile,
  copyFile,
  getFileContents,
  putFileContents,
  stat,
  exists,
  getQuota,
  lock,
  unlock,
  getDAVCompliance,
  search,
  getFileDownloadLink,
  getFileUploadLink,
  customRequest,
} from "./components/operations";

export class WebDAVClientImpl implements WebDAVClient {
  private context: WebDAVClientContext;

  constructor(remoteURL: string, options: WebDAVClientOptions) {
    const authType = getAuthType(options);
    const authHeaders = buildAuthHeaders(options, authType);

    this.context = {
      authType,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
      password: options.password,
      remotePath: options.remoteBasePath || "/",
      remoteURL: buildRemoteURL({ ...options, remoteURL }),
      token: options.token,
      username: options.username,
      withCredentials: options.withCredentials,
      parsing: {
        attributeNamePrefix: options.attributeNamePrefix || "@_",
        attributeParsers: [],
        tagParsers: [],
      },
    };

    if (authType === "digest" && options.username && options.password) {
      this.context.digest = createDigestContext(options.username, options.password);
    }
  }

  getDirectoryContents(path: string): Promise<FileStat[]>;
  getDirectoryContents(
    path: string,
    options: GetDirectoryContentsOptionsWithDetails
  ): Promise<ResponseDataDetailed<FileStat[]>>;
  getDirectoryContents(
    path: string,
    options: GetDirectoryContentsOptionsWithoutDetails
  ): Promise<FileStat[]>;
  getDirectoryContents(
    path: string,
    options: GetDirectoryContentsOptionsWithDetails | GetDirectoryContentsOptionsWithoutDetails = {}
  ): Promise<FileStat[] | ResponseDataDetailed<FileStat[]>> {
    return getDirectoryContents(this.context, path, options as any);
  }

  createDirectory(path: string, options?: CreateDirectoryOptions): Promise<void> {
    return createDirectory(this.context, path, options);
  }

  deleteFile(filename: string, options?: WebDAVMethodOptions): Promise<void> {
    return deleteFile(this.context, filename, options);
  }

  moveFile(
    filename: string,
    destinationFilename: string,
    options?: MoveFileOptions
  ): Promise<void> {
    return moveFile(this.context, filename, destinationFilename, options);
  }

  copyFile(
    filename: string,
    destination: string,
    options?: CopyFileOptions
  ): Promise<void> {
    return copyFile(this.context, filename, destination, options);
  }

  getFileContents(
    filename: string,
    options?: GetFileContentsOptions
  ): Promise<BufferLike | string | ResponseDataDetailed<BufferLike | string>> {
    return getFileContents(this.context, filename, options);
  }

  putFileContents(
    filename: string,
    data: string | BufferLike | WritableStream,
    options?: PutFileContentsOptions
  ): Promise<boolean> {
    if (data instanceof WritableStream) {
      throw Error("WritableStream is not supported for putFileContents");
    }
    return putFileContents(this.context, filename, data as string | ArrayBuffer, options);
  }

  stat(path: string, options?: StatOptions): Promise<FileStat | ResponseDataDetailed<FileStat>> {
    return stat(this.context, path, options);
  }

  exists(path: string, options?: WebDAVMethodOptions): Promise<boolean> {
    return exists(this.context, path, options);
  }

  getQuota(
    options?: GetQuotaOptions
  ): Promise<DiskQuota | null | ResponseDataDetailed<DiskQuota | null>> {
    return getQuota(this.context, options);
  }

  lock(path: string, options?: LockOptions): Promise<LockResponse> {
    return lock(this.context, path, options);
  }

  unlock(path: string, token: string, options?: WebDAVMethodOptions): Promise<void> {
    return unlock(this.context, path, token, options);
  }

  getDAVCompliance(path: string): Promise<DAVCompliance> {
    return getDAVCompliance(this.context, path);
  }

  search(
    path: string,
    options?: SearchOptions
  ): Promise<SearchResult | ResponseDataDetailed<SearchResult>> {
    return search(this.context, path, options);
  }

  getFileDownloadLink(filename: string): string {
    return getFileDownloadLink(this.context, filename);
  }

  getFileUploadLink(filename: string): string {
    return getFileUploadLink(this.context, filename);
  }

  getHeaders(): Headers {
    return { ...this.context.headers };
  }

  setHeaders(headers: Headers): void {
    this.context.headers = {
      ...this.context.headers,
      ...headers,
    };
  }

  customRequest(path: string, requestOptions: RequestOptionsCustom): Promise<AxiosResponse> {
    return customRequest(this.context, path, requestOptions);
  }

  registerAttributeParser(parser: WebDAVAttributeParser): void {
    this.context.parsing.attributeParsers.push(parser);
  }

  registerTagParser(parser: WebDAVTagParser): void {
    this.context.parsing.tagParsers.push(parser);
  }
}
