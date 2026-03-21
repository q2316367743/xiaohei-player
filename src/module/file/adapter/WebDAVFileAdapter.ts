import type {FileBrowser, FileItem} from "@/module/file/types.ts";
import {convertWebDavToUrl} from "@/lib/FileSrc.ts";
import type {FolderViewCoreWebdav} from "@/entity/main/Folder.ts";
import {instance} from "@/lib/http.ts";
import {XMLParser} from "fast-xml-parser";
import {basename, extname} from "@/util/lang/FileUtil.ts";

interface WebDAVMultistatus {
  'd:response'?: WebDAVResponseItem | WebDAVResponseItem[];
  'D:response'?: WebDAVResponseItem | WebDAVResponseItem[];
  response?: WebDAVResponseItem | WebDAVResponseItem[];
  [key: string]: unknown;
}

interface WebDAVResponse {
  'd:multistatus'?: WebDAVMultistatus;
  'D:multistatus'?: WebDAVMultistatus;
  multistatus?: WebDAVMultistatus;
}

interface WebDAVPropstat {
  'd:prop'?: WebDAVProp;
  'D:prop'?: WebDAVProp;
  prop?: WebDAVProp;
  [key: string]: unknown;
}

interface WebDAVResponseItem {
  'd:href'?: string;
  'D:href'?: string;
  href?: string;
  'd:propstat'?: WebDAVPropstat | WebDAVPropstat[];
  propstat?: WebDAVPropstat | WebDAVPropstat[];
  [key: string]: unknown;
}

interface WebDAVProp {
  'd:resourcetype'?: { 'd:collection'?: unknown } | { 'D:collection'?: unknown } | { collection?: unknown };
  'D:resourcetype'?: { 'd:collection'?: unknown } | { 'D:collection'?: unknown } | { collection?: unknown };
  resourcetype?: { 'd:collection'?: unknown } | { 'D:collection'?: unknown } | { collection?: unknown };
  'd:getcontentlength'?: string;
  'D:getcontentlength'?: string;
  getcontentlength?: string;
  'd:getlastmodified'?: string;
  'D:getlastmodified'?: string;
  getlastmodified?: string;
  'd:displayname'?: string;
  'D:displayname'?: string;
  displayname?: string;
  [key: string]: unknown;
}

function getPropValue<T>(prop: WebDAVProp | undefined, keys: string[]): T | undefined {
  if (!prop) return undefined;
  for (const key of keys) {
    if (prop[key as keyof WebDAVProp] !== undefined) {
      return prop[key as keyof WebDAVProp] as T;
    }
  }
  return undefined;
}

function isCollection(resourcetype: unknown): boolean {
  if (!resourcetype || typeof resourcetype !== 'object') return false;
  const rt = resourcetype as Record<string, unknown>;
  return 'd:collection' in rt || 'D:collection' in rt || 'collection' in rt;
}

export class WebDAVFileAdapter implements FileBrowser {
  private readonly prop: FolderViewCoreWebdav;
  private readonly base: string;

  constructor(prop: FolderViewCoreWebdav) {
    this.prop = prop;
    this.base = this.prop.path;
  }

  async init(): Promise<void> {
  }

  private getFileDownloadLink(path: string): string {
    const baseUrl = this.prop.payload.auth_url.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    return baseUrl + normalizedPath;
  }

  getLink(path: string): string {
    const target = this.base + path;
    const url = this.getFileDownloadLink(target);
    const filename = path.split('/').pop() || 'video.mp4';
    return convertWebDavToUrl(filename, url, this.prop.payload.auth_username, this.prop.payload.auth_password, this.prop.payload.auth_type);
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.prop.payload.auth_username && this.prop.payload.auth_password) {
      const credentials = btoa(`${this.prop.payload.auth_username}:${this.prop.payload.auth_password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }
    return headers;
  }

  async list(path: string): Promise<FileItem[]> {
    const target = this.base + path;
    const url = this.getFileDownloadLink(target);

    const propfindXml = `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:resourcetype/>
    <d:getcontentlength/>
    <d:getlastmodified/>
    <d:displayname/>
  </d:prop>
</d:propfind>`;

    const response = await instance.request<string>({
      url: url,
      method: 'PROPFIND',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/xml',
        'Depth': '1',
      },
      data: propfindXml,
      responseType: 'text',
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      allowBooleanAttributes: true,
      trimValues: true,
    });

    const parsed = parser.parse(response.data) as WebDAVResponse;
    const items: FileItem[] = [];

    const multistatus = parsed['d:multistatus'] || parsed['D:multistatus'] || parsed.multistatus;

    if (!multistatus) return items;

    let responses = multistatus['d:response'] || multistatus['D:response'] || multistatus.response;
    if (!responses) return items;

    if (!Array.isArray(responses)) {
      responses = [responses];
    }

    for (const resp of responses) {
      const href = resp['d:href'] || resp['D:href'] || resp.href;
      if (!href) continue;

      const decodedHref = decodeURIComponent(href);
      const hrefPath = decodedHref.endsWith('/') ? decodedHref.slice(0, -1) : decodedHref;
      const targetPath = target.endsWith('/') ? target.slice(0, -1) : target;

      if (hrefPath === targetPath || hrefPath === targetPath + '/') {
        continue;
      }

      const rawPropstat = resp['d:propstat'] || resp['D:propstat'] || resp.propstat;
      if (!rawPropstat) continue;

      const propstatArray = Array.isArray(rawPropstat) ? rawPropstat : [rawPropstat];
      const validPropstat = propstatArray.find(ps => {
        const prop = ps['d:prop'] || ps['D:prop'] || ps.prop;
        return prop != null;
      });

      if (!validPropstat) continue;

      const prop = (validPropstat['d:prop'] || validPropstat['D:prop'] || validPropstat.prop) as WebDAVProp | undefined;
      if (!prop) continue;

      const resourcetype = getPropValue(prop, ['d:resourcetype', 'D:resourcetype', 'resourcetype']);
      const isDirectory = isCollection(resourcetype);
      const isFile = !isDirectory;

      const displayName = getPropValue<string>(prop, ['d:displayname', 'D:displayname', 'displayname']);
      const name = displayName || basename(hrefPath);

      const itemPath = hrefPath.startsWith(this.base)
        ? hrefPath.substring(this.base.length)
        : hrefPath;


      items.push({
        name: name,
        extname: extname(name),
        path: itemPath,
        folder: target,
        isFile: isFile,
        isDirectory: isDirectory,
        isSymlink: false,
      });
    }

    return items;
  }

}