export interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  fontSize: number;
  lineHeight: number;
  primaryColor: string;
}

export interface AppState {
  currentId: string | null;
  articles: Article[];
  settings: Settings;
}

export interface StorageData {
  currentId: string | null;
  articles: Article[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  fontSize: 16,
  lineHeight: 1.75,
  primaryColor: '#576b95',
};

export const FONT_SIZE_OPTIONS = [14, 15, 16, 17, 18, 19, 20];
export const LINE_HEIGHT_OPTIONS = [1.4, 1.5, 1.6, 1.75, 2.0];

export const COLOR_PRESETS = [
  { name: '微信蓝', value: '#576b95' },
  { name: '珊瑚红', value: '#ff6b6b' },
  { name: '翠绿', value: '#52c41a' },
  { name: '深灰', value: '#333333' },
];

export const MAX_ARTICLES = 50;
export const STORAGE_KEY = 'mopai_v1';
