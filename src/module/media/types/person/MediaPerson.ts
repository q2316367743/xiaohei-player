export interface MediaPerson {

  id: string;
  name: string;
  type: 'Actor' | 'Director' | 'Writer' | 'Producer'; // 角色类型
  imageUrl?: string;            // 头像/剧照
  role?: string;                // 具体角色名（如 "Tony Stark"）
  birthYear?: number;
  deathYear?: number;
  biography?: string;
  extra?: Record<string, unknown>;
}