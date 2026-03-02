import { XMLParser, XMLBuilder } from "fast-xml-parser";
import type {
  DAVResult,
  DAVResultRaw,
  DAVResultResponse,
  DAVResultResponseProps,
  WebDAVParsingContext,
} from "../types";

const XML_PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  ignoreNameSpace: false,
  allowBooleanAttributes: true,
  parseNodeValue: false,
  parseAttributeValue: false,
  trimValues: true,
  isArray: (name: string) => ["response", "propstat", "prop"].includes(name),
};

export function createXMLParser(context: WebDAVParsingContext): XMLParser {
  const options = {
    ...XML_PARSER_OPTIONS,
    attributeNamePrefix: context.attributeNamePrefix || "@_",
    attributeValueProcessor: (name: string, value: string, jPath: string) => {
      for (const parser of context.attributeParsers) {
        const result = parser(jPath, value);
        if (result !== undefined) {
          return result as string;
        }
      }
      return value;
    },
    tagValueProcessor: (name: string, value: string, jPath: string) => {
      for (const parser of context.tagParsers) {
        const result = parser(jPath, value);
        if (result !== undefined) {
          return result as string;
        }
      }
      return value;
    },
  };

  return new XMLParser(options);
}

export function createXMLBuilder(): XMLBuilder {
  return new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true,
    indentBy: "  ",
  });
}

export function parseXML<T = unknown>(xml: string, parser: XMLParser): T {
  return parser.parse(xml) as T;
}

export function buildXML(obj: unknown, builder: XMLBuilder): string {
  return builder.build(obj);
}

export function parseWebDAVResult(
  xml: string,
  parser: XMLParser
): DAVResult {
  const raw = parseXML<DAVResultRaw>(xml, parser);
  return normalizeDAVResult(raw);
}

function normalizeDAVResult(raw: DAVResultRaw): DAVResult {
  let responses: DAVResultResponse[] = [];

  const multistatus = raw.multistatus;
  
  if (multistatus === "") {
    responses = [];
  } else if (Array.isArray(multistatus)) {
    responses = multistatus.flatMap((ms) =>
      extractResponses(ms)
    );
  } else {
    responses = extractResponses(multistatus);
  }

  return {
    multistatus: {
      response: responses,
    },
  };
}

function extractResponses(
  multistatus: { response: DAVResultResponse | DAVResultResponse[] }
): DAVResultResponse[] {
  const { response } = multistatus;
  if (Array.isArray(response)) {
    return response;
  }
  return [response];
}

export function createPropFindXML(
  props: string[],
  builder: XMLBuilder
): string {
  const propElements: Record<string, string> = {};
  props.forEach((prop) => {
    propElements[prop] = "";
  });

  const obj = {
    "d:propfind": {
      "@_xmlns:d": "DAV:",
      "d:prop": propElements,
    },
  };

  return buildXML(obj, builder);
}

export function createPropPatchXML(
  props: Record<string, string | null>,
  builder: XMLBuilder
): string {
  const setProps: Record<string, string> = {};
  const removeProps: Record<string, string> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (value === null) {
      removeProps[key] = "";
    } else {
      setProps[key] = value;
    }
  });

  const obj: Record<string, unknown> = {
    "d:propertyupdate": {
      "@_xmlns:d": "DAV:",
    },
  };

  const operations: unknown[] = [];

  if (Object.keys(setProps).length > 0) {
    operations.push({
      "d:set": {
        "d:prop": setProps,
      },
    });
  }

  if (Object.keys(removeProps).length > 0) {
    operations.push({
      "d:remove": {
        "d:prop": removeProps,
      },
    });
  }

  (obj["d:propertyupdate"] as Record<string, unknown>)["d:set"] = operations;

  return buildXML(obj, builder);
}

export function createLockXML(
  owner: string,
  builder: XMLBuilder
): string {
  const obj = {
    "d:lockinfo": {
      "@_xmlns:d": "DAV:",
      "d:locktype": {
        "d:write": "",
      },
      "d:lockscope": {
        "d:exclusive": "",
      },
      "d:owner": {
        "d:href": owner,
      },
    },
  };

  return buildXML(obj, builder);
}

export function extractResponseProps(
  response: DAVResultResponse
): DAVResultResponseProps | null {
  if (response.propstat) {
    return response.propstat.prop;
  }
  return null;
}
