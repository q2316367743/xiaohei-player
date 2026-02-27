import type {VideoEdit, VideoMetadata} from "@/entity/domain/Video.ts";

interface ParseLibraryProp {
  filePath: string;
}

interface ParseLibraryResult extends VideoMetadata, VideoEdit {
}

export async function parseLibrary(prop: ParseLibraryProp): Promise<ParseLibraryResult> {
  console.log('parseLibrary', prop);
  return {
    studio_id: '',
    actors: [],
    link: '',
    director: '',
    studio: '',
    tags: [],
    description: '',
    release_date: '',
    title: ''
  }
}