
export interface ImageFilter {
  name: string;
  class: string;
  preview?: string;
}

export interface Sticker {
  id: string;
  url: string;
  name: string;
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  fontFamily: string;
}

export interface StickerElement {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface EditorState {
  originalImage: string | null;
  currentImage: string | null;
  filter: string;
  rotation: number;
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  textElements: TextElement[];
  stickerElements: StickerElement[];
  history: string[];
  historyIndex: number;
}
