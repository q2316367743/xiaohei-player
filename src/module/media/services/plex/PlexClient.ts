import type {IMediaServer} from "@/module/media/IMediaServer.ts";
import type {MediaServer} from "@/entity";
import type { MediaDetail } from "@/module/media/types/detail/MediaDetail.ts";
import type {MediaEpisode} from "@/module/media/types/detail/MediaEpisode.ts";
import type {MediaSeason} from "@/module/media/types/detail/MediaSeason.ts";
import type {MediaItem} from "@/module/media/types/media/MediaItem.ts";
import type {PaginatedResult, PaginationOptions} from "@/module/media/types/common/MediaPage.ts";
import type {MediaPerson} from "@/module/media/types/person/MediaPerson.ts";
import type {MediaPlaybackReport} from "@/module/media/types/playback/MediaPlaybackReport.ts";
import type {MediaPlaybackInfo} from "@/module/media/types/playback/MediaPlaybackInfo.ts";
import {useMediaStronghold} from "@/lib/Stronghold.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {type Method, requestAction, type RequestConfig} from "@/lib/http.ts";
import { XMLParser } from "fast-xml-parser";
import { mapSortByToPlex } from "@/module/media/services/plex/util.ts";

type PlexResponseContainer = {
  MediaContainer?: Record<string, unknown>;
};

type PlexDirectory = {
  key?: string | number;
  title?: string;
  type?: string;
  summary?: string;
  thumb?: string;
  art?: string;
  uuid?: string;
};

type PlexMetadata = {
  ratingKey?: string | number;
  key?: string;
  guid?: string;
  type?: string;
  title?: string;
  summary?: string;
  year?: number;
  rating?: number;
  duration?: number;
  thumb?: string;
  art?: string;
  banner?: string;
  addedAt?: number;
  updatedAt?: number;
  originallyAvailableAt?: string;
  parentRatingKey?: string | number;
  grandparentRatingKey?: string | number;
  parentTitle?: string;
  grandparentTitle?: string;
  index?: number;
  parentIndex?: number;
  viewOffset?: number;
  viewCount?: number;
  lastViewedAt?: number;
  Genre?: Array<{ tag?: string }>;
  Role?: PlexPersonNode[];
  Director?: PlexPersonNode[];
  Writer?: PlexPersonNode[];
  Producer?: PlexPersonNode[];
  Media?: Array<{
    container?: string;
    Part?: Array<{
      id?: string | number;
      key?: string;
      file?: string;
      Stream?: Array<{
        id?: string | number;
        streamType?: number;
        key?: string;
        language?: string;
        title?: string;
        displayTitle?: string;
        default?: boolean;
      }>;
    }>;
  }>;
};

type PlexPersonNode = {
  id?: string | number;
  tag?: string;
  thumb?: string;
  role?: string;
  key?: string;
  filter?: string;
  count?: number;
};

/**
 * Plex客户端
 */
export class PlexClient implements IMediaServer {
  private readonly server: MediaServer;
  private readonly baseUrl: string;
  private accessToken: string | null = null;
  private authenticating: Promise<void> | null = null;
  private readonly xmlParser = new XMLParser({
    attributeNamePrefix: "",
    ignoreAttributes: false,
  });
  private clientIdentifier: string | null = null;

  constructor(server: MediaServer) {
    this.server = server;
    this.baseUrl = server.url.replace(/\/+$/, "");
  }

  async authenticate(): Promise<void> {
    const stronghold = useMediaStronghold();
    await this.ensureClientIdentifier();
    const accessToken = await stronghold.getMediaRecord(this.server.id, "accessToken");
    if (accessToken) {
      this.accessToken = accessToken;
      if (await this.validateConnection()) {
        return;
      }
      await this.invalidateAuthentication();
    }

    const username = await stronghold.getMediaRecord(this.server.id, "username");
    const password = await stronghold.getMediaRecord(this.server.id, "password");
    if (!username || !password) {
      await MessageBoxUtil.alert("未配置 Plex 用户名或密码（或 token）", "登录失败");
      throw Error("Plex username or password is missing");
    }

    const parsed = password.match(/^(.*?)[\\s:#|](\\d{6})$/);
    const signInPassword = parsed?.[1] ?? password;
    const verificationCode = parsed?.[2];

    // 1. 通过 Plex.tv 交换 Token
    const token = await this.tryGetPlexToken(username, signInPassword, verificationCode);
    if (token) {
      this.accessToken = token;
      if (await this.validateConnection()) {
        await stronghold.setMediaRecord(this.server.id, "accessToken", this.accessToken, 30 * 24 * 60 * 60 * 1000);
        return;
      }
    }

    // 3. 全部失败，抛出错误
    if (token) {
      // 成功获取了 Token 但连不上服务器
      await MessageBoxUtil.alert("Plex Token 无法访问当前服务器，请检查服务器地址或 token", "登录失败");
    } else {
      // 获取 Token 失败（账号密码错误或 2FA）
      await MessageBoxUtil.alert(
        "无法登录 Plex 服务器。\n\n1. 若使用密码登录，请确保账号密码正确，且未开启二步验证(2FA)。\n2. 若已开启 2FA，请直接使用 Plex Token 作为密码填入。\n3. 若使用 Token 登录，请检查 Token 是否有效。\n4. 请检查服务器地址能否访问。",
        "登录失败"
      );
    }
    throw Error("Plex authentication failed");
  }

  private async validateConnection(): Promise<boolean> {
    try {
      const token = this.accessToken;
      const {status} = await requestAction({
        url: "/library/sections",
        method: "GET",
        baseURL: this.baseUrl,
        headers: this.getAuthHeaders(),
        params: token ? { "X-Plex-Token": token } : undefined,
        responseType: "text",
        validateStatus: () => true,
      });
      return status === 200;
    } catch {
      return false;
    }
  }

  async getItem(id: string): Promise<MediaDetail> {
    const raw = await this.getMetadataItem(id);

    const type = this.mapItemType(raw.type);
    const genres = (raw.Genre || []).map(g => g.tag).filter(Boolean) as string[];
    const posterUrl = this.buildUrl(raw.thumb);
    const backdropUrl = this.buildUrl(raw.art) || posterUrl;

    const people = this.normalizePeople(raw);

    const mediaSource = raw.Media?.[0];
    const part = mediaSource?.Part?.[0];
    const streams = part?.Stream || [];

    const audioStreams = streams
      .filter(s => s.streamType === 2)
      .map(s => ({
        id: typeof s.id === "number" ? s.id.toString() : (s.id || ""),
        type: "Audio" as const,
        codec: "",
        language: s.language,
        title: s.displayTitle || s.title,
        isDefault: !!s.default,
      }))
      .filter(s => s.id);

    const subtitleStreams = streams
      .filter(s => s.streamType === 3)
      .map(s => ({
        id: typeof s.id === "number" ? s.id.toString() : (s.id || ""),
        type: "Subtitle" as const,
        codec: "",
        language: s.language,
        title: s.displayTitle || s.title,
        isDefault: !!s.default,
        deliveryUrl: this.buildUrl(s.key),
      }))
      .filter(s => s.id);

    const runtimeSeconds = typeof raw.duration === "number" ? Math.floor(raw.duration / 1000) : undefined;
    const dateCreated = typeof raw.addedAt === "number" ? new Date(raw.addedAt * 1000).toISOString() : undefined;
    const dateModified = typeof raw.updatedAt === "number" ? new Date(raw.updatedAt * 1000).toISOString() : undefined;

    return {
      id: typeof raw.ratingKey === "number" ? raw.ratingKey.toString() : (raw.ratingKey || id),
      name: raw.title || "",
      type,
      year: raw.year,
      posterUrl,
      backdropUrl,
      overview: raw.summary,
      rating: raw.rating,
      genres,
      runtimeSeconds,
      dateCreated,
      dateModified,
      parentId: raw.parentRatingKey ? String(raw.parentRatingKey) : undefined,
      people,
      mediaSources: [
        {
          id: "default",
          container: mediaSource?.container || "",
          videoStreams: [],
          audioStreams,
          subtitleStreams,
        },
      ],
      externalIds: this.extractExternalIds(raw.guid),
      userState: {
        played: (raw.viewCount || 0) > 0,
        playCount: raw.viewCount || 0,
        lastPlayedAt: typeof raw.lastViewedAt === "number" ? new Date(raw.lastViewedAt * 1000).toISOString() : undefined,
        playbackPositionSeconds: typeof raw.viewOffset === "number" ? Math.floor(raw.viewOffset / 1000) : undefined,
        isFavorite: false,
      },
      seriesName: raw.grandparentTitle,
      seasonName: raw.parentTitle,
      indexNumber: raw.index,
      parentIndexNumber: raw.parentIndex,
      extra: raw as unknown as Record<string, unknown>,
    };
  }

  async getItemEpisode(id: string, seasonId: string): Promise<MediaEpisode> {
    const seriesMeta = await this.getMetadataItem(id);
    const seasonMeta = await this.getMetadataItem(seasonId);

    const data = await this.getAction<{ MediaContainer?: { Metadata?: PlexMetadata[]; totalSize?: number; size?: number; offset?: number } }>(
      `/library/metadata/${seasonId}/children`,
      { type: "4" }
    );

    const container = data?.MediaContainer || {};
    const metadata = (container.Metadata || []) as PlexMetadata[];
    const total = typeof container.totalSize === "number" ? container.totalSize : (typeof container.size === "number" ? container.size : metadata.length);
    const startIndex = typeof container.offset === "number" ? container.offset : 0;

    const items = metadata.map((m): MediaEpisode["items"][number] => {
      const idValue = typeof m.ratingKey === "number" ? m.ratingKey.toString() : (m.ratingKey || "");
      const positionMs = typeof m.viewOffset === "number" ? m.viewOffset : undefined;
      const playedAt = typeof m.lastViewedAt === "number" ? new Date(m.lastViewedAt * 1000).toISOString() : undefined;
      return {
        id: idValue,
        name: m.title || "",
        seasonId,
        seasonName: m.parentTitle || seasonMeta.title || "",
        seriesId: id,
        seriesName: m.grandparentTitle || seriesMeta.title || "",
        indexNumber: m.index,
        parentIndexNumber: m.parentIndex,
        runtimeMs: m.duration,
        isFolder: false,
        type: "Episode",
        primaryImageTag: this.buildUrl(m.thumb),
        backdropImageTag: this.buildUrl(m.art),
        container: m.Media?.[0]?.container,
        hasSubtitles: (m.Media?.[0]?.Part?.[0]?.Stream || []).some(s => s.streamType === 3),
        userData: {
          playbackPositionMs: positionMs,
          playCount: m.viewCount,
          played: (m.viewCount || 0) > 0,
          isFavorite: false,
          lastPlayedDate: playedAt,
        },
      };
    });

    return {
      items,
      totalRecordCount: total,
      startIndex,
    };
  }

  async getItemSeason(id: string): Promise<MediaSeason> {
    const seriesMeta = await this.getMetadataItem(id);
    const data = await this.getAction<{ MediaContainer?: { Metadata?: PlexMetadata[]; totalSize?: number; size?: number; offset?: number } }>(
      `/library/metadata/${id}/children`,
      { type: "3" }
    );
    const container = data?.MediaContainer || {};
    const metadata = (container.Metadata || []) as PlexMetadata[];
    const total = typeof container.totalSize === "number" ? container.totalSize : (typeof container.size === "number" ? container.size : metadata.length);
    const startIndex = typeof container.offset === "number" ? container.offset : 0;

    const items = metadata.map((m): MediaSeason["items"][number] => {
      const idValue = typeof m.ratingKey === "number" ? m.ratingKey.toString() : (m.ratingKey || "");
      return {
        id: idValue,
        name: m.title || "",
        indexNumber: m.index,
        seriesId: id,
        seriesName: m.grandparentTitle || seriesMeta.title || "",
        isFolder: true,
        type: "Season",
        primaryImageTag: this.buildUrl(m.thumb),
        backdropImageTag: this.buildUrl(m.art),
        userData: {
          unplayedItemCount: undefined,
          played: false,
          isFavorite: false,
          playCount: m.viewCount,
        },
      };
    });

    return {
      items,
      totalRecordCount: total,
      startIndex,
    };
  }

  async getItems(options: PaginationOptions, parentId?: string): Promise<PaginatedResult<MediaItem>> {
    const libraries = await this.getLibraries();
    const sectionId = parentId || libraries[0]?.id;
    if (!sectionId) {
      return { items: [], total: 0, hasNext: false };
    }

    const {
      page = 1,
      pageSize = 50,
      sortBy = "SortName",
      sortOrder = "Ascending",
      type,
      isUnplayed,
    } = options || {};

    const start = (page - 1) * pageSize;
    const sortField = mapSortByToPlex(sortBy);
    const sortDir = sortOrder === "Descending" ? "desc" : "asc";
    const sort = sortField === "random" ? "random" : `${sortField}:${sortDir}`;

    const params: Record<string, string> = {
      "X-Plex-Container-Start": start.toString(),
      "X-Plex-Container-Size": pageSize.toString(),
      sort,
    };

    const plexType = this.mapQueryType(type);
    if (plexType) params.type = plexType;
    if (isUnplayed) params.unwatched = "1";

    const data = await this.getAction<{ MediaContainer?: { Metadata?: PlexMetadata[]; totalSize?: number; size?: number; offset?: number } }>(
      `/library/sections/${encodeURIComponent(sectionId)}/all`,
      params
    );

    const container = data?.MediaContainer || {};
    const metadata = (container.Metadata || []) as PlexMetadata[];
    const total = typeof container.totalSize === "number" ? container.totalSize : (typeof container.size === "number" ? container.size : metadata.length);

    const items: MediaItem[] = metadata.map(m => this.normalizeMediaItem(m, sectionId));
    const hasNext = start + items.length < total;
    return { items, total, hasNext };
  }

  async getLibraries(): Promise<MediaItem[]> {
    const data = await this.getAction<{ MediaContainer?: { Directory?: PlexDirectory[] } }>(
      "/library/sections",
    );
    const dirs = (data?.MediaContainer?.Directory || []) as PlexDirectory[];
    return dirs.map((d): MediaItem => {
      const id = typeof d.key === "number" ? d.key.toString() : (d.key || "");
      const type = d.type === "show" ? "Series" : (d.type === "movie" ? "Movie" : "Folder");
      return {
        id,
        name: d.title || "",
        type,
        posterUrl: this.buildUrl(d.thumb),
        backdropUrl: this.buildUrl(d.art) || this.buildUrl(d.thumb),
        overview: d.summary,
        extra: d as unknown as Record<string, unknown>,
      };
    });
  }

  async getPeople(itemId: string): Promise<MediaPerson[]> {
    const raw = await this.getMetadataItem(itemId);
    return this.normalizePeople(raw);
  }

  async getPersonDetails(personId: string): Promise<MediaPerson> {
    const raw = await this.getMetadataItem(personId);
    return {
      id: typeof raw.ratingKey === "number" ? raw.ratingKey.toString() : (raw.ratingKey || personId),
      name: raw.title || "",
      type: "Actor",
      imageUrl: this.buildUrl(raw.thumb),
      biography: raw.summary,
      extra: raw as unknown as Record<string, unknown>,
    };
  }

  async getPersonMedia(personId: string): Promise<MediaItem[]> {
    const pageSize = 200;
    let startIndex = 0;
    const items: MediaItem[] = [];

    while (true) {
      const data = await this.getAction<{ MediaContainer?: { Metadata?: PlexMetadata[]; totalSize?: number; size?: number; offset?: number } }>(
        `/library/metadata/${personId}/children`,
        {
          "X-Plex-Container-Start": startIndex.toString(),
          "X-Plex-Container-Size": pageSize.toString(),
        }
      );

      const container = data?.MediaContainer || {};
      const metadata = (container.Metadata || []) as PlexMetadata[];
      const total = typeof container.totalSize === "number" ? container.totalSize : (typeof container.size === "number" ? container.size : items.length);

      for (const m of metadata) items.push(this.normalizeMediaItem(m));

      startIndex += metadata.length;
      if (metadata.length === 0 || startIndex >= total) break;
    }

    return items;
  }

  async getPlaybackInfo(itemId: string, options?: {
    maxBitrate?: number;
    audioTrackId?: string;
    subtitleId?: string;
  }): Promise<MediaPlaybackInfo> {
    const raw = await this.getMetadataItem(itemId);
    const mediaSource = raw.Media?.[0];
    const part = mediaSource?.Part?.[0];
    const partKey = part?.key;

    if (!partKey) {
      throw Error("Plex media part key is missing");
    }

    const token = this.accessToken;
    if (!token) throw Error("Not authenticated");

    const base = this.buildUrl(partKey);
    const streamUrl = base ? this.appendQuery(base, { download: "1" }) : `${this.baseUrl}${partKey}?download=1&X-Plex-Token=${encodeURIComponent(token)}`;

    const streams = part?.Stream || [];

    const subtitleUrls = streams
      .filter(s => s.streamType === 3 && s.key)
      .map(s => this.buildUrl(s.key))
      .filter(Boolean) as string[];

    const audioTracks = streams
      .filter(s => s.streamType === 2)
      .map(s => ({
        id: typeof s.id === "number" ? s.id.toString() : (s.id || ""),
        title: s.displayTitle || s.title || s.language || "Audio Track",
        language: s.language,
        isDefault: !!s.default,
      }))
      .filter(s => s.id);

    const initialPositionMs = typeof raw.viewOffset === "number" ? raw.viewOffset : undefined;

    if (typeof options?.maxBitrate === "number" && Number.isFinite(options.maxBitrate) && options.maxBitrate > 0) {
      await this.ensureClientIdentifier();

      const session = `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const clientIdentifier = this.clientIdentifier || "tauri-desktop";
      const maxVideoBitrateKbps = Math.max(64, Math.floor(options.maxBitrate / 1000));

      const start = this.buildUrl("/video/:/transcode/universal/start.m3u8");
      if (!start) throw Error("Plex transcode url is missing");

      const transcodeUrl = this.appendQuery(start, {
        path: partKey,
        mediaIndex: "0",
        partIndex: "0",
        protocol: "hls",
        directPlay: "0",
        directStream: "1",
        fastSeek: "1",
        maxVideoBitrate: maxVideoBitrateKbps.toString(),
        session,
        "X-Plex-Client-Identifier": clientIdentifier,
        "X-Plex-Product": "omni-player",
        "X-Plex-Platform": "Tauri",
      });

      return {
        streamUrl: transcodeUrl,
        subtitleUrls,
        audioTracks,
        container: "m3u8",
        isDirectPlay: false,
        transcodingSessionId: session,
        initialPositionMs,
      };
    }

    return {
      streamUrl,
      subtitleUrls,
      audioTracks,
      container: mediaSource?.container || "mkv",
      isDirectPlay: true,
      initialPositionMs,
      extra: {
        headers: {
          ...this.getAuthHeaders(),
        },
      },
    };
  }

  async report(report: MediaPlaybackReport): Promise<void> {
    try {
      await this.getAction(
        "/:/timeline",
        {
          ratingKey: report.itemId,
          key: `/library/metadata/${report.itemId}`,
          state: report.state,
          time: report.positionMs.toString(),
          duration: report.durationMs ? report.durationMs.toString() : undefined,
        },
        {
          responseType: "text",
        }
      );
    } catch {
      void 0;
    }
  }

  async search(query: string): Promise<MediaItem[]> {
    const data = await this.getAction<{ MediaContainer?: { Hub?: Array<{ Metadata?: PlexMetadata[] }> } }>(
      "/hubs/search",
      { query, limit: "50", includeCollections: "1" }
    );
    const hubs = (data?.MediaContainer?.Hub || []) as Array<{ Metadata?: PlexMetadata[] }>;
    const result: MediaItem[] = [];
    for (const hub of hubs) {
      for (const m of (hub.Metadata || []) as PlexMetadata[]) {
        result.push(this.normalizeMediaItem(m));
      }
    }
    return result;
  }

  private getClientHeaders() {
    const clientIdentifier = this.clientIdentifier || "tauri-desktop";
    return {
      "X-Plex-Product": "omni-player",
      "X-Plex-Version": "1.0",
      "X-Plex-Client-Identifier": clientIdentifier,
      "X-Plex-Platform": "Tauri",
      "X-Plex-Device": "Desktop",
      "X-Plex-Device-Name": "omni-player",
      Accept: "application/json",
    };
  }

  private getAuthHeaders() {
    if (!this.accessToken) {
      throw Error("Not authenticated");
    }
    return {
      ...this.getClientHeaders(),
      "X-Plex-Token": this.accessToken,
    };
  }

  private async ensureClientIdentifier() {
    if (this.clientIdentifier) return;
    const stronghold = useMediaStronghold();
    const stored = await stronghold.getMediaRecord(this.server.id, "clientIdentifier");
    if (stored) {
      this.clientIdentifier = stored;
      return;
    }
    const generated = `tauri-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.clientIdentifier = generated;
    await stronghold.setMediaRecord(this.server.id, "clientIdentifier", generated, 3650 * 24 * 60 * 60 * 1000);
  }

  private async ensureAuthenticated(options?: { force?: boolean }) {
    if (!options?.force && this.accessToken) return;
    if (this.authenticating) return this.authenticating;
    this.authenticating = this.authenticate().finally(() => {
      this.authenticating = null;
    });
    return this.authenticating;
  }

  private async invalidateAuthentication() {
    this.accessToken = null;
    try {
      await useMediaStronghold().removeMediaRecord(this.server.id, "accessToken");
    } catch {
      void 0;
    }
  }

  private parseStatus(error: unknown): number | undefined {
    if (!error || typeof error !== "object") return undefined;
    const maybeError = error as { response?: unknown; status?: unknown };
    if (typeof maybeError.status === "number") return maybeError.status;
    const response = maybeError.response;
    if (!response || typeof response !== "object") return undefined;
    const maybeResponse = response as { status?: unknown };
    return typeof maybeResponse.status === "number" ? maybeResponse.status : undefined;
  }

  private async request<T>(url: string, method: Method, config?: RequestConfig) {
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.ensureAuthenticated();

        const token = this.accessToken;
        const baseParams = config?.params && typeof config.params === "object" ? (config.params as Record<string, unknown>) : undefined;
        const params = token && baseParams && !("X-Plex-Token" in baseParams)
          ? { ...baseParams, "X-Plex-Token": token }
          : (token && !baseParams ? { "X-Plex-Token": token } : config?.params);

        const requestConfig: RequestConfig = {
          ...config,
          method,
          url,
          baseURL: this.baseUrl,
          params,
          headers: {
            ...this.getClientHeaders(),
            ...config?.headers,
            ...this.getAuthHeaders(),
          },
          responseType: "text",
        };

        const {data} = await requestAction<unknown>(requestConfig);
        return this.parsePlexBody<T>(data);
      } catch (e) {
        const status = this.parseStatus(e);
        const shouldRetry = attempt < maxAttempts && (status === 401 || status === 403 || (e instanceof Error && e.message === "Not authenticated"));
        if (!shouldRetry) throw e;

        await this.invalidateAuthentication();
        await this.ensureAuthenticated({force: true});
      }
    }
    throw Error("Request failed after retries");
  }

  private async getAction<T>(url: string, params?: Record<string, any>, config?: RequestConfig) {
    return this.request<T>(url, "GET", {
      ...config,
      params,
    });
  }

  private parsePlexBody<T>(data: unknown): T {
    if (typeof data === "string") {
      const trimmed = data.trim();
      if (!trimmed) return {} as T;
      if (trimmed.startsWith("<")) {
        const parsed = this.xmlParser.parse(trimmed) as PlexResponseContainer;
        return parsed as unknown as T;
      }
      try {
        return JSON.parse(trimmed) as T;
      } catch {
        return data as unknown as T;
      }
    }
    return data as T;
  }

  private async tryGetPlexToken(username: string, password: string, verificationCode?: string) {
    await this.ensureClientIdentifier();
    try {
      const extractToken = (data: unknown) => {
        const body = this.parsePlexBody<{
          authToken?: string;
          user?: {
            authToken?: string;
            authentication_token?: string;
            auth_token?: string;
          };
        }>(data);
        return body?.authToken || body?.user?.authToken || body?.user?.authentication_token || body?.user?.auth_token || null;
      };

      const v2Res = await requestAction<unknown>({
        url: "https://plex.tv/api/v2/users/signin",
        method: "POST",
        headers: {
          ...this.getClientHeaders(),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: {
          login: username,
          password,
          verificationCode,
        },
        responseType: "text",
        validateStatus: () => true,
      });

      if (v2Res.status === 200 || v2Res.status === 201) {
        const token = extractToken(v2Res.data);
        if (token) return token;
      }

      const form = new URLSearchParams();
      form.set("user[login]", username);
      form.set("user[password]", verificationCode ? `${password}${verificationCode}` : password);

      const formRes = await requestAction<unknown>({
        url: "https://plex.tv/users/sign_in.json",
        method: "POST",
        headers: {
          ...this.getClientHeaders(),
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        data: form.toString(),
        responseType: "text",
        validateStatus: () => true,
      });

      if (formRes.status === 200 || formRes.status === 201) {
        const token = extractToken(formRes.data);
        if (token) return token;
      }

      const authStr = `${username}:${password}`;
      // UTF-8 safe btoa
      const encoded = btoa(encodeURIComponent(authStr).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(_match, p1) {
          return String.fromCharCode(parseInt(p1, 16));
        }));

      const {data, status} = await requestAction<unknown>({
        url: "https://plex.tv/users/sign_in.json",
        method: "POST",
        headers: {
          ...this.getClientHeaders(),
          Authorization: `Basic ${encoded}`,
        },
        responseType: "text",
        validateStatus: () => true,
      });

      if (status === 200 || status === 201) {
        const token = extractToken(data);
        if (token) return token;
      }
    } catch (e) {
      console.warn("Plex TV login failed", e);
    }
    return null;
  }

  private async getMetadataItem(id: string): Promise<PlexMetadata> {
    const data = await this.getAction<{ MediaContainer?: { Metadata?: PlexMetadata[] } }>(
      `/library/metadata/${encodeURIComponent(id)}`,
    );
    const metadata = (data?.MediaContainer?.Metadata || []) as PlexMetadata[];
    const item = metadata[0];
    if (!item) throw Error("Plex metadata is missing");
    return item;
  }

  private mapItemType(type?: string): MediaDetail["type"] {
    if (type === "movie") return "Movie";
    if (type === "show") return "Series";
    if (type === "season") return "Season";
    if (type === "episode") return "Episode";
    if (type === "person") return "Person";
    if (type === "collection") return "Collection";
    return "Folder";
  }

  private mapQueryType(type?: PaginationOptions["type"]): string | undefined {
    if (type === "Movie") return "1";
    if (type === "Series") return "2";
    return undefined;
  }

  private buildUrl(path?: string) {
    if (!path) return undefined;
    if (path.startsWith("http://") || path.startsWith("https://")) return this.appendToken(path);
    const full = `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    return this.appendToken(full);
  }

  private appendToken(url: string) {
    const token = this.accessToken;
    if (!token) return url;
    return this.appendQuery(url, { "X-Plex-Token": token });
  }

  private appendQuery(url: string, query: Record<string, string>) {
    const u = new URL(url);
    for (const [k, v] of Object.entries(query)) {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    return u.toString();
  }

  private normalizeMediaItem(m: PlexMetadata, parentId?: string): MediaItem {
    const id = typeof m.ratingKey === "number" ? m.ratingKey.toString() : (m.ratingKey || "");
    const type = this.mapItemType(m.type);
    const posterUrl = this.buildUrl(m.thumb);
    const backdropUrl = this.buildUrl(m.art) || posterUrl;
    const dateCreated = typeof m.addedAt === "number" ? new Date(m.addedAt * 1000).toISOString() : undefined;
    const dateModified = typeof m.updatedAt === "number" ? new Date(m.updatedAt * 1000).toISOString() : undefined;
    const genres = (m.Genre || []).map(g => g.tag).filter(Boolean) as string[];
    const runtimeSeconds = typeof m.duration === "number" ? Math.floor(m.duration / 1000) : undefined;

    return {
      id,
      name: m.title || "",
      type,
      year: m.year,
      posterUrl,
      backdropUrl,
      overview: m.summary,
      rating: m.rating,
      runtimeSeconds,
      genres,
      dateCreated,
      dateModified,
      parentId: parentId || (m.parentRatingKey ? String(m.parentRatingKey) : undefined),
      userData: {
        playbackPositionTicks: typeof m.viewOffset === "number" ? m.viewOffset * 10_000 : 0,
        playCount: m.viewCount || 0,
        lastPlayedDate: typeof m.lastViewedAt === "number" ? new Date(m.lastViewedAt * 1000).toISOString() : undefined,
        played: (m.viewCount || 0) > 0,
        isFavorite: false,
      },
      extra: m as unknown as Record<string, unknown>,
    };
  }

  private normalizePeople(raw: PlexMetadata): MediaPerson[] {
    const people: MediaPerson[] = [];
    const push = (node: PlexPersonNode, type: MediaPerson["type"]) => {
      const id = typeof node.id === "number" ? node.id.toString() : (node.id || "");
      if (!id) return;
      people.push({
        id,
        name: node.tag || "",
        type,
        imageUrl: this.buildUrl(node.thumb),
        role: node.role,
        extra: node as unknown as Record<string, unknown>,
      });
    };

    for (const n of (raw.Role || [])) push(n, "Actor");
    for (const n of (raw.Director || [])) push(n, "Director");
    for (const n of (raw.Writer || [])) push(n, "Writer");
    for (const n of (raw.Producer || [])) push(n, "Producer");

    return people;
  }

  private extractExternalIds(guid?: string) {
    if (!guid) return undefined;
    const tmdb = guid.match(/tmdb:\/\/(\d+)/)?.[1];
    const imdb = guid.match(/imdb:\/\/(tt\d+)/)?.[1];
    const tvdb = guid.match(/tvdb:\/\/(\d+)/)?.[1];
    const result: { tmdb?: string; imdb?: string; tvdb?: string } = {};
    if (tmdb) result.tmdb = tmdb;
    if (imdb) result.imdb = imdb;
    if (tvdb) result.tvdb = tvdb;
    return Object.keys(result).length ? result : undefined;
  }
}
