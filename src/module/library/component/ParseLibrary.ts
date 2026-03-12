import type {VideoEdit, VideoMetadata} from "@/entity/domain/Video.ts";
import {readTextFile} from "@tauri-apps/plugin-fs";
import {XMLParser} from "fast-xml-parser";
import type {ScanVideoFile} from "@/module/library/types.ts";

interface ParseLibraryResult extends VideoMetadata, VideoEdit {
  cover?: string;
}

interface NfoData {
  movie?: {
    title?: string;
    plot?: string;
    director?: string;
    studio?: string;
    year?: string;
    premiered?: string;
    releasedate?: string;
    tag?: string | string[];
    genre?: string | string[];
    actor?: Array<{
      name?: string;
      role?: string;
    }>;
    thumb?: string;
  };
}

export async function parseLibrary(prop: ScanVideoFile): Promise<ParseLibraryResult> {

  const titleTemp = prop.fileName.split(".");
  if (titleTemp.length > 1) titleTemp.pop();

  const title = titleTemp.join('.');

  const result: ParseLibraryResult = {
    studio_id: '',
    actors: [],
    link: '',
    director: '',
    studio: '',
    tags: [],
    description: '',
    release_date: '',
    title
  };

  if (prop.nfo) {
    try {
      const nfo = await readTextFile(prop.nfo);
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        allowBooleanAttributes: true,
        trimValues: true,
      });

      const parsed = parser.parse(nfo) as NfoData;
      const movie = parsed.movie;

      if (movie) {
        if (movie.title) {
          result.title = movie.title;
        }

        if (movie.plot) {
          result.description = movie.plot;
        }

        if (movie.director) {
          result.director = movie.director;
        }

        if (movie.studio) {
          result.studio = movie.studio;
        }

        if (movie.thumb) {
          result.cover = movie.thumb;
        }

        if (movie.year) {
          result.release_date = movie.year;
        } else if (movie.premiered) {
          result.release_date = movie.premiered;
        } else if (movie.releasedate) {
          result.release_date = movie.releasedate;
        }

        if (movie.actor) {
          const actors = Array.isArray(movie.actor) ? movie.actor : [movie.actor];
          result.actors = actors
            .filter(actor => actor.name)
            .map(actor => ({
              name: actor.name || '',
              role: actor.role || ''
            }));
        }

        if (movie.tag || movie.genre) {
          const tags: string[] = [];
          if (movie.tag) {
            if (Array.isArray(movie.tag)) {
              tags.push(...movie.tag);
            } else {
              tags.push(movie.tag);
            }
          }
          if (movie.genre) {
            if (Array.isArray(movie.genre)) {
              tags.push(...movie.genre);
            } else {
              tags.push(movie.genre);
            }
          }
          result.tags = tags;
        }
      }
    } catch (e) {
      console.error('解析 nfo 文件失败:', e);
    }
  }

  if (prop.cover) {
    result.cover = prop.cover;
  }

  return result;
}