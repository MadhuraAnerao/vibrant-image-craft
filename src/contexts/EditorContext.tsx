
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { EditorState, TextElement, StickerElement } from '../types/editor';

type EditorAction =
  | { type: 'SET_ORIGINAL_IMAGE'; payload: string }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'ROTATE'; payload: number }
  | { type: 'SET_CROP'; payload: { x: number; y: number; width: number; height: number } | null }
  | { type: 'ADD_TEXT'; payload: TextElement }
  | { type: 'UPDATE_TEXT'; payload: TextElement }
  | { type: 'REMOVE_TEXT'; payload: string }
  | { type: 'ADD_STICKER'; payload: StickerElement }
  | { type: 'UPDATE_STICKER'; payload: StickerElement }
  | { type: 'REMOVE_STICKER'; payload: string }
  | { type: 'SAVE_HISTORY' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' };

const initialState: EditorState = {
  originalImage: null,
  currentImage: null,
  filter: '',
  rotation: 0,
  crop: null,
  textElements: [],
  stickerElements: [],
  history: [],
  historyIndex: -1,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_ORIGINAL_IMAGE':
      return {
        ...initialState,
        originalImage: action.payload,
        currentImage: action.payload,
      };
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload,
      };
    case 'ROTATE':
      return {
        ...state,
        rotation: (state.rotation + action.payload) % 360,
      };
    case 'SET_CROP':
      return {
        ...state,
        crop: action.payload,
      };
    case 'ADD_TEXT':
      return {
        ...state,
        textElements: [...state.textElements, action.payload],
      };
    case 'UPDATE_TEXT':
      return {
        ...state,
        textElements: state.textElements.map(el => 
          el.id === action.payload.id ? action.payload : el
        ),
      };
    case 'REMOVE_TEXT':
      return {
        ...state,
        textElements: state.textElements.filter(el => el.id !== action.payload),
      };
    case 'ADD_STICKER':
      return {
        ...state,
        stickerElements: [...state.stickerElements, action.payload],
      };
    case 'UPDATE_STICKER':
      return {
        ...state,
        stickerElements: state.stickerElements.map(el => 
          el.id === action.payload.id ? action.payload : el
        ),
      };
    case 'REMOVE_STICKER':
      return {
        ...state,
        stickerElements: state.stickerElements.filter(el => el.id !== action.payload),
      };
    case 'SAVE_HISTORY':
      // For simplicity, we're just storing the current image state
      // In a real app, you might want to store the full state or operations
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        history: [...newHistory, state.currentImage as string],
        historyIndex: state.historyIndex + 1,
      };
    case 'UNDO':
      if (state.historyIndex <= 0) return state;
      return {
        ...state,
        currentImage: state.history[state.historyIndex - 1],
        historyIndex: state.historyIndex - 1,
      };
    case 'REDO':
      if (state.historyIndex >= state.history.length - 1) return state;
      return {
        ...state,
        currentImage: state.history[state.historyIndex + 1],
        historyIndex: state.historyIndex + 1,
      };
    case 'RESET':
      return {
        ...initialState,
        originalImage: state.originalImage,
        currentImage: state.originalImage,
      };
    default:
      return state;
  }
}

interface EditorContextType {
  state: EditorState;
  setOriginalImage: (imageUrl: string) => void;
  applyFilter: (filter: string) => void;
  rotate: (degrees: number) => void;
  setCrop: (crop: { x: number; y: number; width: number; height: number } | null) => void;
  addText: (text: string, x: number, y: number) => void;
  updateText: (element: TextElement) => void;
  removeText: (id: string) => void;
  addSticker: (url: string, x: number, y: number) => void;
  updateSticker: (element: StickerElement) => void;
  removeSticker: (id: string) => void;
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const setOriginalImage = useCallback((imageUrl: string) => {
    dispatch({ type: 'SET_ORIGINAL_IMAGE', payload: imageUrl });
  }, []);

  const applyFilter = useCallback((filter: string) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const rotate = useCallback((degrees: number) => {
    dispatch({ type: 'ROTATE', payload: degrees });
  }, []);

  const setCrop = useCallback((crop: { x: number; y: number; width: number; height: number } | null) => {
    dispatch({ type: 'SET_CROP', payload: crop });
  }, []);

  const addText = useCallback((text: string, x: number, y: number) => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text,
      x,
      y,
      color: '#ffffff',
      fontSize: 24,
      fontFamily: 'Arial',
    };
    dispatch({ type: 'ADD_TEXT', payload: newText });
  }, []);

  const updateText = useCallback((element: TextElement) => {
    dispatch({ type: 'UPDATE_TEXT', payload: element });
  }, []);

  const removeText = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TEXT', payload: id });
  }, []);

  const addSticker = useCallback((url: string, x: number, y: number) => {
    const newSticker: StickerElement = {
      id: `sticker-${Date.now()}`,
      url,
      x,
      y,
      width: 100,
      height: 100,
      rotation: 0,
    };
    dispatch({ type: 'ADD_STICKER', payload: newSticker });
  }, []);

  const updateSticker = useCallback((element: StickerElement) => {
    dispatch({ type: 'UPDATE_STICKER', payload: element });
  }, []);

  const removeSticker = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_STICKER', payload: id });
  }, []);

  const saveHistory = useCallback(() => {
    dispatch({ type: 'SAVE_HISTORY' });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <EditorContext.Provider
      value={{
        state,
        setOriginalImage,
        applyFilter,
        rotate,
        setCrop,
        addText,
        updateText,
        removeText,
        addSticker,
        updateSticker,
        removeSticker,
        saveHistory,
        undo,
        redo,
        reset
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
