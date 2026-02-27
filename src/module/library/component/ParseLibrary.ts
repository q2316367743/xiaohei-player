import type {VideoEdit, VideoMetadata} from "@/entity/domain/Video.ts";

interface ParseLibraryProp {
  filePath: string;
  fileName: string;
}

interface ParseLibraryResult extends VideoMetadata, VideoEdit {
}

export async function parseLibrary(prop: ParseLibraryProp): Promise<ParseLibraryResult> {
  console.log('parseLibrary', prop);
  const titleTemp = prop.fileName.split(".");
  if (titleTemp.length > 1) titleTemp.pop();
  return {
    studio_id: '',
    actors: [],
    link: '',
    director: '',
    studio: '',
    tags: [],
    description: '',
    release_date: '',
    title: titleTemp.join('.')
  }
}