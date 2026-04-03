export type MediaServerType = 'jellyfin' | 'emby' | 'plex';

export interface MediaServerInsert {

  name: string;

  type: MediaServerType;

  is_enabled: boolean;

  url: string;
  // 顺序
  sequence: number;

  username: string;

  password: string;

}

/**
 * 媒体服务器
 */
export interface MediaServer extends MediaServerInsert{
  id: string;
  created_at: number;
  updated_at: number;

  // username
  // password

}

export interface MediaServerEdit extends MediaServerInsert {
  username: string;
  password: string;
}

export function buildMediaServerInsert(): MediaServerInsert {
  return {
    name: '',
    url: '',
    is_enabled: true,
    type: 'jellyfin',
    sequence: 0,
    username: '',
    password: ''
  }
}