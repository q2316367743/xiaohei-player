import type {
  DAVCompliance,
  DAVResult,
  DAVResultResponse,
  DiskQuota,
  FileStat,
  LockResponse,
  SearchResult,
} from "../types";
import { extractBasename, normalizePath } from "./url";
import { createXMLParser } from "./xml";
import type { AxiosResponse } from "axios";

export function parseFileStat(
  response: DAVResultResponse
): FileStat | null {
  const props = response.propstat?.prop;
  if (!props) {
    return null;
  }

  const filename = normalizePath(decodeURIComponent(response.href || ""));
  const basename = extractBasename(filename);
  
  const isDirectory = !!props.resourcetype?.collection;
  
  const size = props.getcontentlength ? parseInt(props.getcontentlength, 10) : 0;
  const lastmod = props.getlastmodified || new Date().toISOString();
  const etag = props.getetag || null;
  const mime = props.getcontenttype;

  return {
    filename,
    basename,
    lastmod,
    size,
    type: isDirectory ? "directory" : "file",
    etag,
    mime,
    props,
  };
}

export function parseDirectoryContents(
  result: DAVResult,
  options: { includeSelf?: boolean } = {}
): FileStat[] {
  const { includeSelf = false } = options;
  const files: FileStat[] = [];

  for (const response of result.multistatus.response) {
    const fileStat = parseFileStat(response);
    if (fileStat) {
      if (!includeSelf && fileStat.filename === "/") {
        continue;
      }
      files.push(fileStat);
    }
  }

  return files;
}

export function parseQuota(result: DAVResult): DiskQuota | null {
  const response = result.multistatus.response[0];
  if (!response) {
    return null;
  }

  const props = response.propstat?.prop;
  if (!props) {
    return null;
  }

  const used = props["quota-used-bytes"]
    ? parseInt(String(props["quota-used-bytes"]), 10)
    : 0;
  
  const availableRaw = props["quota-available-bytes"];
  let available: DiskQuota["available"] = "unknown";
  
  if (availableRaw !== undefined) {
    const availableNum = parseInt(String(availableRaw), 10);
    if (!isNaN(availableNum)) {
      if (availableNum < 0) {
        available = "unlimited";
      } else {
        available = availableNum;
      }
    }
  }

  return {
    used,
    available,
  };
}

export function parseLockResponse(xml: string): LockResponse | null {
  const parser = createXMLParser({
    attributeNamePrefix: "@_",
    attributeParsers: [],
    tagParsers: [],
  });

  try {
    const result = parser.parse(xml) as {
      prop?: {
        lockdiscovery?: {
          activelock?: {
            locktoken?: {
              href?: string;
            };
            timeout?: string;
          };
        };
      };
    };

    const lock = result?.prop?.lockdiscovery?.activelock;
    if (lock) {
      return {
        token: lock.locktoken?.href || "",
        serverTimeout: lock.timeout || "",
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function parseDAVCompliance(response: AxiosResponse): DAVCompliance {
  const davHeader = (response.headers["dav"] as string) || "";
  const serverHeader = (response.headers["server"] as string) || "";

  const compliance = davHeader
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    compliance,
    server: serverHeader,
  };
}

export function parseSearchResult(
  result: DAVResult
): SearchResult {
  const files = parseDirectoryContents(result);
  
  return {
    truncated: false,
    results: files,
  };
}

export function filterFilesByGlob(
  files: FileStat[],
  globPattern: string
): FileStat[] {
  const regex = globToRegex(globPattern);
  return files.filter((file) => regex.test(file.filename));
}

function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`, "i");
}

export function sortFiles(
  files: FileStat[],
  options: { sortBy?: "name" | "size" | "lastmod"; order?: "asc" | "desc" } = {}
): FileStat[] {
  const { sortBy = "name", order = "asc" } = options;
  
  const sorted = [...files].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "name":
        comparison = a.basename.localeCompare(b.basename);
        break;
      case "size":
        comparison = a.size - b.size;
        break;
      case "lastmod":
        comparison = new Date(a.lastmod).getTime() - new Date(b.lastmod).getTime();
        break;
    }
    
    return order === "asc" ? comparison : -comparison;
  });

  return sorted;
}
