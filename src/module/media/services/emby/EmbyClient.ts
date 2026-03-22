import type {IMediaServer} from "@/module/media/IMediaServer.ts";
import type {MediaServer} from "@/entity";
import type {MediaDetail} from "@/module/media/types/detail/MediaDetail.ts";
import type {MediaEpisode, MediaEpisodeItem} from "@/module/media/types/detail/MediaEpisode.ts";
import type {MediaSeason, MediaSeasonItem} from "@/module/media/types/detail/MediaSeason.ts";
import type {MediaItem} from "@/module/media/types/media/MediaItem.ts";
import type {PaginatedResult, PaginationOptions} from "@/module/media/types/common/MediaPage.ts";
import type {MediaPerson} from "@/module/media/types/person/MediaPerson.ts";
import type {MediaPlaybackReport} from "@/module/media/types/playback/MediaPlaybackReport.ts";
import type {MediaPlaybackInfo} from "@/module/media/types/playback/MediaPlaybackInfo.ts";
import {useMediaStronghold} from "@/lib/Stronghold.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {type Method, postAction, requestAction, type RequestConfig} from "@/lib/http.ts";
import {
  buildBackdropUrls,
  mapItemType,
  mapMediaSource,
  normalizeImageUrl,
  normalizeMediaItem,
  normalizePerson
} from "@/module/media/services/jellyfin/utils.ts";

/**
 * Emby客户端
 */
export class EmbyClient implements IMediaServer {
  private readonly server: MediaServer;
  private readonly baseUrl: string;
  private accessToken: string | null = null;
  private userId: string | null = null;
  private authenticating: Promise<void> | null = null;

  constructor(server: MediaServer) {
    this.server = server;
    this.baseUrl = server.url.replace(/\/+$/, "");
  }

  async authenticate(): Promise<void> {
    const stronghold = useMediaStronghold();
    const accessToken = await stronghold.getMediaRecord(this.server.id, "accessToken");
    if (accessToken) {
      this.accessToken = accessToken;
      try {
        const {data, status} = await requestAction<any>({
          url: "/Users/Me",
          method: "GET",
          baseURL: this.baseUrl,
          headers: this.getAuthHeaders(),
          responseType: "json"
        });
        if (status === 200 && data) {
          this.userId = data.Id;
          return;
        }
      } catch (e) {
        console.error(e);
      }
      await this.invalidateAuthentication();
    }

    const username = await stronghold.getMediaRecord(this.server.id, "username");
    const password = await stronghold.getMediaRecord(this.server.id, "password");
    if (!username || !password) {
      await MessageBoxUtil.alert("未配置 Emby 用户名或密码", "登录失败");
      throw Error("Emby username or password is missing");
    }

    try {
      const {data, status} = await postAction<any>(`${this.baseUrl}/Users/AuthenticateByName`, {
        Username: username,
        Pw: password
      }, {
        headers: {
          "Content-Type": "application/json",
          "X-Emby-Authorization": `MediaBrowser Client="TauriApp", Device="Desktop", DeviceId="tauri-${Date.now()}", Version="1.0"`
        }
      });
      if (status !== 200 || !data) {
        const message = (data && (data as any).ErrorMessage) || "登录失败";
        await MessageBoxUtil.alert(message, "登录失败");
        return Promise.reject(Error(message));
      }
      this.accessToken = data.AccessToken;
      this.userId = data.User?.Id;
      if (!this.accessToken || !this.userId) {
        await MessageBoxUtil.alert("Emby 登录响应缺少 AccessToken 或 UserId", "登录失败");
        return Promise.reject(Error("Emby login response is invalid"))
      }
      await stronghold.setMediaRecord(this.server.id, "accessToken", this.accessToken, 30 * 24 * 60 * 60 * 1000);
    } catch (e: any) {
      let message = "登录失败";
      const responseData = e?.response?.data;
      if (responseData) {
        if (typeof responseData === "string") {
          message = responseData;
        } else if (typeof responseData === "object") {
          message = responseData.ErrorMessage || responseData.Message || message;
        }
      } else if (e?.message) {
        message = e.message;
      }
      await MessageBoxUtil.alert(message, "登录失败");
      throw e;
    }
  }

  private getAuthHeaders() {
    if (!this.accessToken) {
      throw Error("Not authenticated");
    }
    return {
      "X-Emby-Token": this.accessToken,
      "X-MediaBrowser-Token": this.accessToken,
    };
  }

  private async ensureAuthenticated(options?: { force?: boolean }) {
    if (!options?.force && this.accessToken && this.userId) return;
    if (this.authenticating) return this.authenticating;
    this.authenticating = this.authenticate().finally(() => {
      this.authenticating = null;
    });
    return this.authenticating;
  }

  private async invalidateAuthentication() {
    this.accessToken = null;
    this.userId = null;
    try {
      await useMediaStronghold().removeMediaRecord(this.server.id, "accessToken");
    } catch (e) {
      console.error(e);
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

  private async request<T extends Record<string, any>>(url: string, method: Method, config?: RequestConfig) {
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.ensureAuthenticated();

        const requestConfig: RequestConfig = {
          ...config,
          method,
          url,
          baseURL: this.baseUrl,
          headers: {
            ...config?.headers,
            ...this.getAuthHeaders(),
          },
          responseType: "json"
        };

        const {data} = await requestAction<T>(requestConfig);
        return data;
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

  private async getAction<T extends Record<string, any>>(url: string, params?: Record<string, any>, config?: RequestConfig) {
    return this.request<T>(
      url, "GET",
      {
        ...config,
        params,
      },
    );
  }

  private async postAction<T extends Record<string, any>>(url: string, data?: Record<string, any>, config?: RequestConfig) {
    return this.request<T>(
      url, "POST",
      {
        ...config,
        data: data,
      },
    );
  }

  async getItem(id: string): Promise<MediaDetail> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw Error("Not authenticated");
    }

    const fields = [
      "Genres", "Overview", "Ratings", "People", "Chapters",
      "MediaSources", "ProviderIds", "DateCreated", "DateLastSaved",
      "Studios", "ProductionLocations", "Taglines", "UserData",
      "Tags", "Keywords", "ProductionYear", "PremiereDate",
      "EndDate", "Status", "SeriesStudio", "SeriesStatus",
      "SeasonUserData", "SeriesUserData", "RecursiveItemCount",
      "ChildCount", "CumulativeRunTimeTicks", "Metascore",
      "Awards", "Video3DFormat", "AspectRatio", "VideoRange",
      "DisplayOrder", "SortName", "OfficialRatingDescription",
      "CustomRating", "OriginalTitle", "PrimaryImageAspectRatio",
      "ProductionLocations", "Path", "FileName", "IsHD",
      "IsShortcut", "Width", "Height", "ExtraIds",
      "ExtraType", "TrickplayToken", "CollectionType",
      "Album", "AlbumId", "AlbumArtist", "ArtistItems",
      "SeriesPresentationUniqueKey", "PresentationUniqueKey"
    ].join(",");

    const enableImageTypes = "Primary,Backdrop,Logo,Art,Banner,Thumb,Disc,Menu,Screenshot,Chapter,Box,BoxRear,Profile";

    const rawItem = await this.getAction<any>(
      `/Users/${userId}/Items/${id}`,
      {
        Fields: fields,
        EnableImageTypes: enableImageTypes,
        ImageTypeLimit: 0,
      }
    );

    return {
      id: rawItem.Id,
      name: rawItem.Name || "",
      type: mapItemType(rawItem.Type),
      year: rawItem.ProductionYear,
      posterUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, "Primary", rawItem.ImageTags?.Primary),
      backdropUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, "Backdrop", rawItem.ImageTags?.Backdrop),
      overview: rawItem.Overview,
      rating: rawItem.CommunityRating,
      genres: rawItem.GenreItems?.map((g: any) => g.Name) || [],
      dateCreated: rawItem.DateCreated,
      parentId: rawItem.ParentId,

      originalTitle: rawItem.OriginalTitle,
      tagline: rawItem.Taglines?.[0],
      officialRating: rawItem.OfficialRating,
      studios: rawItem.Studios?.map((s: any) => s.Name).filter(Boolean) || [],
      productionLocations: rawItem.ProductionLocations || [],

      backdropUrls: buildBackdropUrls(this.baseUrl, rawItem.Id, rawItem.BackdropImageTags),
      logoUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, "Logo", rawItem.ImageTags?.Logo),
      thumbUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, "Thumb", rawItem.ImageTags?.Thumb),
      artUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, "Art", rawItem.ImageTags?.Art),

      discUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, "Disc", rawItem.ImageTags?.Disc),
      menuUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, "Menu", rawItem.ImageTags?.Menu),
      screenshotUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, "Screenshot", rawItem.ImageTags?.Screenshot),
      chapterImageUrls: (rawItem.ChapterImages || []).map((tag: string, index: number) =>
        `${this.baseUrl}/Videos/${rawItem.Id}/Chapters/${index}/Images/Chapter?tag=${tag}`
      ),
      boxUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, "Box", rawItem.ImageTags?.Box),
      boxRearUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, "BoxRear", rawItem.ImageTags?.BoxRear),
      profileUrl: normalizeImageUrl(this.baseUrl, rawItem.Id, "Profile", rawItem.ImageTags?.Profile),

      runtimeSeconds: rawItem.RunTimeTicks ? Math.floor(rawItem.RunTimeTicks / 10_000_000) : undefined,
      chapters: (rawItem.Chapters || []).map((c: any) => ({
        startSeconds: typeof c.StartPositionTicks === "number" ? Math.floor(c.StartPositionTicks / 10_000_000) : 0,
        title: c.Name || "",
        thumbnailUrl: c.ImageTag ? `${this.baseUrl}/Items/${rawItem.Id}/Images/Chapter/${c.ImageTag}` : undefined,
      })),
      people: (rawItem.People || []).map((p: any) => ({
        id: p.Id,
        name: p.Name,
        type: p.Type ? (p.Type === "Actor" ? "Actor" : p.Type) : "Actor",
        role: p.Role,
        imageUrl: p.PrimaryImageTag ? normalizeImageUrl(this.baseUrl, p.Id, "Primary", p.PrimaryImageTag) : undefined,
        extra: p,
      })) as MediaPerson[],
      externalIds: rawItem.ProviderIds ? {
        tmdb: rawItem.ProviderIds.Tmdb,
        imdb: rawItem.ProviderIds.Imdb,
        tvdb: rawItem.ProviderIds.Tvdb,
      } : undefined,
      userState: rawItem.UserData ? {
        played: !!rawItem.UserData.Played,
        playCount: rawItem.UserData.PlayCount || 0,
        lastPlayedAt: rawItem.UserData.LastPlayedDate,
        playbackPositionSeconds: rawItem.UserData.PlaybackPositionTicks
          ? Math.floor(rawItem.UserData.PlaybackPositionTicks / 10_000_000)
          : undefined,
        isFavorite: !!rawItem.UserData.IsFavorite,
        personalRating: rawItem.UserData.UserRating,
      } : undefined,
      seriesName: rawItem.SeriesName,
      seasonName: rawItem.SeasonName,
      indexNumber: rawItem.IndexNumber,
      parentIndexNumber: rawItem.ParentIndexNumber,
      mediaSources: (rawItem.MediaSources || []).map((source: any) => mapMediaSource(this.baseUrl, source)),
      extra: rawItem,
    };
  }

  async getItemEpisode(id: string, seasonId: string): Promise<MediaEpisode> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw Error("Not authenticated");
    }

    const data = await this.getAction<any>(
      `/Shows/${id}/Episodes`,
      {
        UserId: userId,
        SeasonId: seasonId,
        EnableImageTypes: "Primary,Backdrop",
        Fields: "UserData,ImageTags,MediaSources",
        SortBy: "IndexNumber",
        SortOrder: "Ascending",
      }
    );

    const rawItems = Array.isArray(data) ? data : (data?.Items || []);
    const items = (rawItems as any[]).map((raw) => {
      const imageTagsRaw = (raw?.ImageTags ?? {}) as Record<string, string>;
      const userDataRaw = raw?.UserData ?? {};
      const positionTicks = userDataRaw?.PlaybackPositionTicks;

      const runtimeMs = typeof raw?.RunTimeTicks === "number"
        ? Math.floor(raw.RunTimeTicks / 10_000)
        : undefined;

      return {
        id: raw?.Id,
        name: raw?.Name ?? "",
        seasonId: raw?.SeasonId ?? raw?.ParentId ?? seasonId,
        seasonName: raw?.SeasonName ?? "",
        seriesId: raw?.SeriesId ?? id,
        seriesName: raw?.SeriesName ?? "",
        indexNumber: raw?.IndexNumber,
        parentIndexNumber: raw?.ParentIndexNumber,
        runtimeMs,
        isFolder: !!raw?.IsFolder,
        type: "Episode",
        primaryImageTag: imageTagsRaw.Primary,
        backdropImageTag: imageTagsRaw.Backdrop,
        userData: {
          playbackPositionMs: typeof positionTicks === "number" ? Math.floor(positionTicks / 10_000) : undefined,
          playCount: userDataRaw?.PlayCount,
          played: userDataRaw?.Played,
          isFavorite: userDataRaw?.IsFavorite,
          lastPlayedDate: userDataRaw?.LastPlayedDate,
        },
        container: raw?.Container,
        hasSubtitles: raw?.HasSubtitles,
      } as MediaEpisodeItem;
    });

    return {
      items,
      totalRecordCount: data?.TotalRecordCount,
      startIndex: data?.StartIndex,
    };
  }

  async getItemSeason(id: string): Promise<MediaSeason> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw Error("Not authenticated");
    }

    const data = await this.getAction<any>(
      `/Shows/${id}/Seasons`,
      {
        UserId: userId,
        EnableImageTypes: "Primary,Backdrop",
        Fields: "UserData,ImageTags",
      }
    );

    const rawItems = Array.isArray(data) ? data : (data?.Items || []);
    const items = (rawItems as any[]).map((raw) => {
      const imageTags = (raw?.ImageTags ?? {}) as Record<string, string>;
      const userDataRaw = raw?.UserData ?? {};

      return {
        id: raw?.Id,
        name: raw?.Name ?? "",
        indexNumber: raw?.IndexNumber,
        seriesId: raw?.SeriesId ?? id,
        seriesName: raw?.SeriesName ?? "",
        isFolder: !!raw?.IsFolder,
        type: "Season",
        primaryImageTag: imageTags.Primary,
        backdropImageTag: imageTags.Backdrop,
        userData: {
          unplayedItemCount: userDataRaw?.UnplayedItemCount,
          played: userDataRaw?.Played,
          isFavorite: userDataRaw?.IsFavorite,
          playCount: userDataRaw?.PlayCount,
        },
      } as MediaSeasonItem;
    });

    return {
      items,
      totalRecordCount: data?.TotalRecordCount,
      startIndex: data?.StartIndex,
    };
  }

  async getItems(options: PaginationOptions, parentId?: string): Promise<PaginatedResult<MediaItem>> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw Error("Not authenticated");
    }

    const {
      page = 1,
      pageSize = 50,
      sortBy = "SortName",
      sortOrder = "Ascending",
      isUnplayed,
      isFavorite,
      genres,
      years,
      type
    } = options || {};

    const params: Record<string, any> = {
      Recursive: true,
      Fields: "ProviderIds,UserData,Genres,Overview,DateCreated,DateLastSaved,ChildCount,RecursiveItemCount",
      ImageTypeLimit: "1",
      EnableImageTypes: "Primary,Backdrop",
      SortBy: sortBy,
      SortOrder: sortOrder,
      IncludeItemTypes: "Movie,Series"
    };

    if (type) params.IncludeItemTypes = type;
    if (isUnplayed) params.IsUnplayed = true;
    if (isFavorite) params.IsFavorite = true;
    if (genres?.length) genres.forEach(g => params.Genres = g);
    if (years?.length) years.forEach(y => params.Years = y.toString());
    if (parentId) params.ParentId = parentId;

    const startIndex = (page - 1) * pageSize;
    params.StartIndex = startIndex.toString();
    params.Limit = pageSize.toString();

    const data = await this.getAction<any>(
      `/Users/${userId}/Items`,
      params
    );

    const items = (data?.Items || []).map((item: any) =>
      normalizeMediaItem({...item, ServerUrl: this.baseUrl})
    ) as MediaItem[];
    const total = data?.TotalRecordCount || items.length;
    const hasNext = startIndex + items.length < total;

    return {
      items,
      total,
      hasNext
    };
  }

  async getLibraries(): Promise<MediaItem[]> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw Error("Not authenticated");
    }
    const data = await this.getAction<any>(
      `/Users/${userId}/Views`,
    );
    return data.Items.map((item: any) =>
      normalizeMediaItem({...item, ServerUrl: this.baseUrl})
    ) as MediaItem[];
  }

  async getPeople(itemId: string): Promise<MediaPerson[]> {
    const res = await this.getAction<any>(`/Items/${itemId}/People`);
    const peopleRaw = Array.isArray(res) ? res : (res?.People || res?.Items || []);
    return (peopleRaw as any[]).map((p) => normalizePerson(p, this.baseUrl)) as MediaPerson[];
  }

  async getPersonDetails(personId: string): Promise<MediaPerson> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw Error("Not authenticated");
    }

    const person = await this.getAction<any>(
      `/Users/${userId}/Items/${personId}`,
      {
        Fields: "Overview",
      }
    );

    const birthYear = typeof person?.BirthYear === "number"
      ? person.BirthYear
      : (typeof person?.BirthDate === "string" ? new Date(person.BirthDate).getFullYear() : undefined);

    const deathYear = typeof person?.EndYear === "number"
      ? person.EndYear
      : (typeof person?.DeathDate === "string" ? new Date(person.DeathDate).getFullYear() : undefined);

    const primaryImageTag = person?.PrimaryImageTag ?? person?.ImageTags?.Primary;

    return {
      id: person.Id,
      name: person.Name,
      type: "Actor",
      imageUrl: primaryImageTag ? `${this.baseUrl}/Items/${person.Id}/Images/Primary?tag=${primaryImageTag}` : undefined,
      birthYear,
      deathYear,
      biography: person.Overview,
      extra: person,
    };
  }

  async getPersonMedia(personId: string): Promise<MediaItem[]> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw Error("Not authenticated");
    }

    const pageSize = 200;
    let startIndex = 0;
    const items: MediaItem[] = [];

    while (true) {
      const data = await this.getAction<any>(
        `/Users/${userId}/Items`,
        {
          Recursive: "true",
          PersonIds: personId,
          IncludeItemTypes: "Movie,Series",
          Fields: "ProviderIds,UserData,Genres,Overview,DateCreated,DateLastSaved",
          SortBy: "SortName",
          SortOrder: "Ascending",
          StartIndex: startIndex.toString(),
          Limit: pageSize.toString(),
        }
      );

      const batch = (data?.Items || []) as any[];
      for (const raw of batch) {
        items.push(normalizeMediaItem({...raw, ServerUrl: this.baseUrl}) as unknown as MediaItem);
      }

      const total = typeof data?.TotalRecordCount === "number" ? data.TotalRecordCount : items.length;
      startIndex += batch.length;
      if (batch.length === 0 || startIndex >= total) break;
    }

    return items;
  }

  async getPlaybackInfo(itemId: string, options?: {
    maxBitrate?: number;
    audioTrackId?: string;
    subtitleId?: string
  }): Promise<MediaPlaybackInfo> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw Error("Not authenticated");
    }

    const playbackData = await this.postAction<any>(
      `/Items/${itemId}/PlaybackInfo`,
      {
        UserId: userId,
        MaxStreamingBitrate: options?.maxBitrate || 100_000_000,
        AutoOpenLiveStream: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    type PlaybackMediaStream = {
      Type?: string;
      DeliveryUrl?: string;
      Index?: number;
      DisplayTitle?: string;
      Language?: string;
      IsDefault?: boolean;
    };
    type PlaybackMediaSource = {
      Id?: string;
      Container?: string;
      MediaStreams?: PlaybackMediaStream[];
      DirectStreamUrl?: string;
      TranscodingUrl?: string;
    };

    const mediaSource = playbackData.MediaSources?.[0] as unknown as PlaybackMediaSource | undefined;

    const baseUrl = this.baseUrl.replace(/\/+$/, "");
    const resolveUrl = (u?: string): string | undefined => {
      if (!u) return undefined;
      if (/^https?:\/\//i.test(u)) return u;
      if (u.startsWith("/")) return baseUrl + u;
      return baseUrl + "/" + u;
    };

    const directStreamUrl = resolveUrl(mediaSource?.DirectStreamUrl);
    const transcodingUrl = resolveUrl(mediaSource?.TranscodingUrl);
    const fallbackUrl = `${baseUrl}/Videos/${itemId}/stream?static=true&mediaSourceId=${itemId}`;
    const streamUrl = transcodingUrl || directStreamUrl || fallbackUrl;

    let containerFromUrl: string | undefined = undefined;
    try {
      const path = new URL(streamUrl).pathname.toLowerCase();
      if (path.endsWith(".m3u8")) containerFromUrl = "m3u8";
      else if (path.endsWith(".flv")) containerFromUrl = "flv";
      else if (path.endsWith(".mkv")) containerFromUrl = "mkv";
      else if (path.endsWith(".mp4")) containerFromUrl = "mp4";
    } catch {
      containerFromUrl = undefined;
    }

    const container = containerFromUrl || mediaSource?.Container || "mp4";

    const subtitleUrls: string[] = [];
    if (mediaSource?.MediaStreams) {
      for (const stream of mediaSource.MediaStreams) {
        if (stream.Type === "Subtitle" && stream.DeliveryUrl) {
          subtitleUrls.push(this.baseUrl + stream.DeliveryUrl);
        }
      }
    }

    const audioTracks = (mediaSource?.MediaStreams || [])
      .filter((s: any) => s.Type === "Audio")
      .map((s: any) => ({
        id: s.Index.toString(),
        title: s.DisplayTitle || s.Language || "Audio Track",
        language: s.Language,
        isDefault: s.IsDefault,
      }));

    let initialPositionMs: number | undefined = undefined;
    const userData = (playbackData as any).UserData;
    if (userData?.PlaybackPositionTicks) {
      initialPositionMs = Math.floor(userData.PlaybackPositionTicks / 10_000);
    }

    return {
      streamUrl,
      subtitleUrls,
      audioTracks,
      container,
      isDirectPlay: !transcodingUrl,
      transcodingSessionId: transcodingUrl ? (playbackData as { PlaySessionId?: string })?.PlaySessionId : undefined,
      initialPositionMs,
      extra: {
        headers: {
          ...this.getAuthHeaders(),
        },
      },
    };
  }

  async report(report: MediaPlaybackReport): Promise<void> {
    await this.ensureAuthenticated();

    const positionTicks = Math.max(0, Math.floor(report.positionMs * 10_000));
    const playbackStartTimeTicks = typeof report.playbackStartTime === "number"
      ? Math.floor(report.playbackStartTime * 10_000)
      : undefined;

    const baseParams: Record<string, any> = {
      ItemId: report.itemId,
      MediaSourceId: report.itemId,
      PositionTicks: positionTicks,
      CanSeek: true,
      IsMuted: false,
      PlayMethod: "DirectPlay",
      PlaybackStartTimeTicks: playbackStartTimeTicks
    };


    if (report.state === "stopped") {
      await this.request(
        "/Sessions/Playing/Stopped",
        "POST",
        {
          params: {
            ...baseParams,
            EventName: "Stop",
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return;
    }

    const isPaused = report.state === "paused";
    const endpoint = report.state === "playing" && report.positionMs <= 1000
      ? "/Sessions/Playing"
      : "/Sessions/Playing/Progress";

    await this.request(
      endpoint,
      "POST",
      {
        params: {
          ...baseParams,
          IsPaused: isPaused,
          EventName: isPaused ? "Pause" : "TimeUpdate",
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  async search(query: string): Promise<MediaItem[]> {
    await this.ensureAuthenticated();
    const userId = this.userId;
    if (!userId) {
      throw Error("Not authenticated");
    }

    const data = await this.getAction<any>(
      `/Users/${userId}/Items`,
      {
        SearchTerm: query,
        Recursive: true,
        IncludeItemTypes: "Movie,Series,Person",
        Fields: "ProviderIds,UserData,Genres,Overview,DateCreated,DateLastSaved",
        SortBy: "SortName",
        SortOrder: "Ascending",
        Limit: "50",
      }
    );

    return (data?.Items || []).map((item: any) =>
      normalizeMediaItem({...item, ServerUrl: this.baseUrl})
    ) as MediaItem[];
  }

}
