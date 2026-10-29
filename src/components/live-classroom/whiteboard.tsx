"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRoomContext } from "@livekit/components-react";

import {
  Check,
  ChevronDown,
  Eraser,
  ImagePlus,
  Minus,
  MousePointer2,
  Move,
  Plus,
  Redo2,
  RotateCcw,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";

/* ============================================================
   PROPS
============================================================ */

interface WhiteboardProps {
  role: "TEACHER" | "STUDENT";
  onClose: () => void;
}

/* ============================================================
   CONSTANTS
============================================================ */

const WHITEBOARD_TOPIC = "nbca-whiteboard";

const STORAGE_PREFIX = "nbca:whiteboard:";

const DEFAULT_COLOR = "#111827";

// Expanded from 11 to 24 colors for a full spectrum
const COLORS = [
  "#000000", // Black
  "#4B5563", // Gray 600
  "#9CA3AF", // Gray 400
  "#FFFFFF", // White
  "#EF4444", // Red 500
  "#F97316", // Orange 500
  "#F59E0B", // Amber 500
  "#EAB308", // Yellow 500
  "#84CC16", // Lime 500
  "#22C55E", // Green 500
  "#10B981", // Emerald 500
  "#14B8A6", // Teal 500
  "#06B6D4", // Cyan 500
  "#0EA5E9", // Sky 500
  "#3B82F6", // Blue 500
  "#4F46E5", // Indigo 600 (NBCA Primary)
  "#6366F1", // Indigo 500
  "#8B5CF6", // Violet 500
  "#A855F7", // Purple 500
  "#D946EF", // Fuchsia 500
  "#EC4899", // Pink 500
  "#F43F5E", // Rose 500
  "#78350F", // Amber 900 (Brown)
  "#064E3B", // Emerald 900 (Dark Green)
];

const BRUSH_SIZES = [2, 4, 6, 10, 16, 24];

const TEXT_SIZES = [18, 24, 28, 36, 48, 64];

const MIN_ZOOM = 0.35;

const MAX_ZOOM = 3;

const ZOOM_STEP = 0.15;

/*
 * Large logical whiteboard.
 *
 * This is NOT the size of the physical canvas.
 * The canvas itself only renders the current viewport.
 */
const WORLD_WIDTH = 10000;

const WORLD_HEIGHT = 6000;

const IMAGE_MAX_WIDTH = 1400;

const IMAGE_MAX_HEIGHT = 1000;

/* ============================================================
   TYPES
============================================================ */

type Point = {
  x: number;
  y: number;
};

type StrokeElement = {
  id: string;
  type: "stroke";
  points: Point[];
  color: string;
  size: number;
  isEraser: boolean;
};

type TextElement = {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
};

type ImageElement = {
  id: string;
  type: "image";
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  name?: string;
};

type WhiteboardElement = StrokeElement | TextElement | ImageElement;

type WhiteboardDocument = {
  version: 3;
  elements: WhiteboardElement[];
  background: string;
};

type WhiteboardMessage =
  | { type: "state"; document: WhiteboardDocument }
  | { type: "request-state" }
  | { type: "update"; element: WhiteboardElement }
  | { type: "delete"; elementId: string }
  | { type: "clear" }
  | { type: "full-state"; document: WhiteboardDocument };

type TouchMap = Map<number, { x: number; y: number }>;

/* ============================================================
   HELPERS
============================================================ */

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

const createEmptyDocument = (): WhiteboardDocument => ({
  version: 3,
  elements: [],
  background: "#ffffff",
});

const cloneDocument = (value: WhiteboardDocument): WhiteboardDocument => {
  return {
    ...value,
    elements: value.elements.map((element) => {
      if (element.type === "stroke") {
        return {
          ...element,
          points: element.points.map((point) => ({ ...point })),
        };
      }
      return { ...element };
    }),
  };
};

/* ============================================================
   COMPONENT
============================================================ */

export default function Whiteboard({ role, onClose }: WhiteboardProps) {
  const room = useRoomContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ==========================================================
     DOCUMENT
  ========================================================== */

  const [document, setDocument] = useState<WhiteboardDocument>(
    createEmptyDocument(),
  );
  const documentRef = useRef<WhiteboardDocument>(createEmptyDocument());

  /* ==========================================================
     TOOLS
  ========================================================== */

  const [tool, setTool] = useState<
    "select" | "pen" | "eraser" | "text" | "pan"
  >("pen");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [brushSize, setBrushSize] = useState(4);
  const [textSize, setTextSize] = useState(28);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  /* ==========================================================
     SELECTION
  ========================================================== */

  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* ==========================================================
     HISTORY
  ========================================================== */

  const [history, setHistory] = useState<WhiteboardDocument[]>([]);
  const [future, setFuture] = useState<WhiteboardDocument[]>([]);
  const historyRef = useRef<WhiteboardDocument[]>([]);
  const futureRef = useRef<WhiteboardDocument[]>([]);

  /* ==========================================================
     DRAWING
  ========================================================== */

  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<StrokeElement | null>(null);
  const strokeBeforeDrawingRef = useRef<WhiteboardDocument | null>(null);
  const lastSentStrokeRef = useRef(0);

  /* ==========================================================
     PAN
  ========================================================== */

  const [camera, setCamera] = useState({
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
  });
  const cameraRef = useRef(camera);

  /* ==========================================================
     ZOOM
  ========================================================== */

  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(zoom);

  /* ==========================================================
     MANUAL PAN
  ========================================================== */

  const panningRef = useRef(false);
  const panStartRef = useRef<{
    clientX: number;
    clientY: number;
    cameraX: number;
    cameraY: number;
  } | null>(null);

  /* ==========================================================
     TOUCH / PINCH
  ========================================================== */

  const touchesRef = useRef<TouchMap>(new Map());
  const pinchRef = useRef<{
    distance: number;
    zoom: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  /* ==========================================================
     TEXT EDITOR
  ========================================================== */

  const [textEditor, setTextEditor] = useState<{
    x: number;
    y: number;
    value: string;
  } | null>(null);

  /* ==========================================================
     STORAGE
  ========================================================== */

  const storageKey = useMemo(() => {
    if (typeof window === "undefined") {
      return `${STORAGE_PREFIX}unknown`;
    }
    const parts = window.location.pathname.split("/");
    const classroomIndex = parts.indexOf("classroom");
    const liveClassId =
      classroomIndex > 0 ? parts[classroomIndex - 1] : "unknown";
    return `${STORAGE_PREFIX}${liveClassId}`;
  }, []);

  /* ==========================================================
     KEEP REFS IN SYNC
  ========================================================== */

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  /* ==========================================================
     PERSIST DOCUMENT
  ========================================================== */

  const persistDocument = useCallback(
    (nextDocument: WhiteboardDocument) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextDocument));
      } catch (error) {
        console.error("Failed to persist whiteboard:", error);
      }
    },
    [storageKey],
  );

  /* ==========================================================
     APPLY DOCUMENT
  ========================================================== */

  const applyDocument = useCallback(
    (nextDocument: WhiteboardDocument, saveHistory = false) => {
      if (saveHistory) {
        const previous = cloneDocument(documentRef.current);
        const nextHistory = [...historyRef.current, previous].slice(-50);
        historyRef.current = nextHistory;
        setHistory(nextHistory);
        futureRef.current = [];
        setFuture([]);
      }
      documentRef.current = nextDocument;
      setDocument(nextDocument);
      persistDocument(nextDocument);
    },
    [persistDocument],
  );

  /* ==========================================================
     LOAD SAVED DOCUMENT
  ========================================================== */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        return;
      }
      const parsed = JSON.parse(saved) as WhiteboardDocument;
      if (parsed && Array.isArray(parsed.elements)) {
        const restored: WhiteboardDocument = {
          version: parsed.version === 3 ? 3 : 3,
          elements: parsed.elements,
          background: parsed.background || "#ffffff",
        };
        documentRef.current = restored;
        setDocument(restored);
      }
    } catch (error) {
      console.error("Failed to restore whiteboard:", error);
    }
  }, [storageKey]);

  /* ==========================================================
     SEND LIVEKIT DATA
  ========================================================== */

  const sendWhiteboardMessage = useCallback(
    async (message: WhiteboardMessage) => {
      try {
        if (room.state !== "connected") {
          return;
        }
        const payload = new TextEncoder().encode(JSON.stringify(message));
        await room.localParticipant.publishData(payload, {
          reliable: true,
          topic: WHITEBOARD_TOPIC,
        });
      } catch (error) {
        if (room.state !== "connected") {
          return;
        }
        console.error("Failed to send whiteboard update:", error);
      }
    },
    [room],
  );

  /* ==========================================================
     VIEWPORT SIZE
  ========================================================== */

  const getViewportRect = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return null;
    const rect = viewport.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return rect;
  }, []);

  /* ==========================================================
     WORLD -> SCREEN
  ========================================================== */

  const worldToScreen = useCallback(
    (point: Point) => {
      const rect = getViewportRect();
      if (!rect) return null;
      const currentCamera = cameraRef.current;
      const currentZoom = zoomRef.current;
      return {
        x: rect.width / 2 + (point.x - currentCamera.x) * currentZoom,
        y: rect.height / 2 + (point.y - currentCamera.y) * currentZoom,
      };
    },
    [getViewportRect],
  );

  /* ==========================================================
     SCREEN -> WORLD
  ========================================================== */

  const screenToWorld = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const rect = getViewportRect();
      if (!rect) return null;
      const currentCamera = cameraRef.current;
      const currentZoom = zoomRef.current;
      return {
        x:
          currentCamera.x +
          (clientX - rect.left - rect.width / 2) / currentZoom,
        y:
          currentCamera.y +
          (clientY - rect.top - rect.height / 2) / currentZoom,
      };
    },
    [getViewportRect],
  );

  /* ==========================================================
     LIMIT CAMERA
  ========================================================== */

  const clampCamera = useCallback(
    (nextX: number, nextY: number, nextZoom = zoomRef.current) => {
      const rect = getViewportRect();
      if (!rect) {
        return { x: nextX, y: nextY };
      }
      const halfWorldWidth = rect.width / nextZoom / 2;
      const halfWorldHeight = rect.height / nextZoom / 2;
      return {
        x: clamp(nextX, halfWorldWidth, WORLD_WIDTH - halfWorldWidth),
        y: clamp(nextY, halfWorldHeight, WORLD_HEIGHT - halfWorldHeight),
      };
    },
    [getViewportRect],
  );

  /* ==========================================================
     REDRAW CANVAS
  ========================================================== */

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const rect = getViewportRect();

    if (!canvas || !rect) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    context.fillStyle = documentRef.current.background;
    context.fillRect(0, 0, rect.width, rect.height);

    const currentCamera = cameraRef.current;
    const currentZoom = zoomRef.current;

    context.save();
    context.translate(rect.width / 2, rect.height / 2);
    context.scale(currentZoom, currentZoom);
    context.translate(-currentCamera.x, -currentCamera.y);
    context.lineCap = "round";
    context.lineJoin = "round";

    for (const element of documentRef.current.elements) {
      if (element.type !== "stroke") continue;
      if (element.points.length === 0) continue;

      context.beginPath();
      const first = element.points[0];
      context.moveTo(first.x, first.y);

      for (let index = 1; index < element.points.length; index++) {
        const point = element.points[index];
        context.lineTo(point.x, point.y);
      }
      context.strokeStyle = element.isEraser ? "#ffffff" : element.color;
      context.lineWidth = element.size;
      context.stroke();
      context.closePath();
    }
    context.restore();
  }, [getViewportRect]);

  /* ==========================================================
     CANVAS RESIZE
  ========================================================== */

  useEffect(() => {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) return;

    const resizeCanvas = () => {
      const rect = viewport.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      redrawCanvas();
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(viewport);
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [redrawCanvas]);

  /* ==========================================================
     REDRAW WHEN CAMERA / DOCUMENT CHANGES
  ========================================================== */

  useEffect(() => {
    redrawCanvas();
  }, [document, camera, zoom, redrawCanvas]);

  /* ==========================================================
     AUTO-FOLLOW POINT
  ========================================================== */

  const followWorldPoint = useCallback(
    (point: Point, smooth = true) => {
      const rect = getViewportRect();
      if (!rect) return;

      const currentZoom = zoomRef.current;
      const targetCamera = clampCamera(point.x, point.y, currentZoom);

      if (!smooth) {
        cameraRef.current = targetCamera;
        setCamera(targetCamera);
        return;
      }

      const start = cameraRef.current;
      const startTime = performance.now();
      const duration = 260;

      const animate = (now: number) => {
        const progress = clamp((now - startTime) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const next = {
          x: start.x + (targetCamera.x - start.x) * eased,
          y: start.y + (targetCamera.y - start.y) * eased,
        };

        cameraRef.current = next;
        setCamera(next);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    },
    [clampCamera, getViewportRect],
  );

  /* ==========================================================
     FOLLOW LATEST ELEMENT
  ========================================================== */

  const followElement = useCallback(
    (element: WhiteboardElement) => {
      if (role !== "STUDENT") return;

      let point: Point | null = null;
      if (element.type === "stroke") {
        const last = element.points[element.points.length - 1];
        if (last) point = last;
      }

      if (element.type === "text" || element.type === "image") {
        point = {
          x: element.x + (element.type === "image" ? element.width / 2 : 0),
          y: element.y + (element.type === "image" ? element.height / 2 : 0),
        };
      }

      if (point) {
        followWorldPoint(point, true);
      }
    },
    [followWorldPoint, role],
  );

  /* ==========================================================
     POINTER POSITION
  ========================================================== */

  const getPointerWorldPoint = useCallback(
    (
      event:
        | React.PointerEvent<HTMLCanvasElement>
        | React.PointerEvent<HTMLDivElement>,
    ) => {
      return screenToWorld(event.clientX, event.clientY);
    },
    [screenToWorld],
  );

  /* ==========================================================
     POINTER DOWN
  ========================================================== */

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (role !== "TEACHER") return;
      event.preventDefault();

      const point = getPointerWorldPoint(event);
      if (!point) return;

      /* TEXT */
      if (tool === "text") {
        const screen = worldToScreen(point);
        if (!screen) return;

        setTextEditor({
          x: point.x,
          y: point.y,
          value: "",
        });
        return;
      }

      /* SELECT */
      if (tool === "select") return;

      /* PAN */
      if (tool === "pan") {
        panningRef.current = true;
        panStartRef.current = {
          clientX: event.clientX,
          clientY: event.clientY,
          cameraX: cameraRef.current.x,
          cameraY: cameraRef.current.y,
        };
        return;
      }

      /* PEN / ERASER */
      drawingRef.current = true;
      strokeBeforeDrawingRef.current = cloneDocument(documentRef.current);

      const stroke: StrokeElement = {
        id: createId(),
        type: "stroke",
        points: [point],
        color,
        size: brushSize,
        isEraser: tool === "eraser",
      };

      currentStrokeRef.current = stroke;
      const nextDocument = {
        ...documentRef.current,
        elements: [...documentRef.current.elements, stroke],
      };

      documentRef.current = nextDocument;
      setDocument(nextDocument);
    },
    [brushSize, color, getPointerWorldPoint, role, tool, worldToScreen],
  );

  /* ==========================================================
     POINTER MOVE
  ========================================================== */

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (role !== "TEACHER") return;

      /* PAN */
      if (panningRef.current && panStartRef.current) {
        event.preventDefault();
        const start = panStartRef.current;
        const currentZoom = zoomRef.current;
        const nextX =
          start.cameraX - (event.clientX - start.clientX) / currentZoom;
        const nextY =
          start.cameraY - (event.clientY - start.clientY) / currentZoom;

        const nextCamera = clampCamera(nextX, nextY, currentZoom);
        cameraRef.current = nextCamera;
        setCamera(nextCamera);
        return;
      }

      /* DRAW */
      if (!drawingRef.current || !currentStrokeRef.current) return;
      event.preventDefault();

      const point = getPointerWorldPoint(event);
      if (!point) return;

      currentStrokeRef.current.points.push(point);
      redrawCanvas();

      const now = Date.now();
      if (now - lastSentStrokeRef.current >= 60) {
        lastSentStrokeRef.current = now;
        void sendWhiteboardMessage({
          type: "update",
          element: cloneStroke(currentStrokeRef.current),
        });
      }
    },
    [
      getPointerWorldPoint,
      redrawCanvas,
      role,
      sendWhiteboardMessage,
      clampCamera,
    ],
  );

  /* ==========================================================
     POINTER UP
  ========================================================== */

  const handlePointerUp = useCallback(() => {
    if (panningRef.current) {
      panningRef.current = false;
      panStartRef.current = null;
      return;
    }

    if (!drawingRef.current || !currentStrokeRef.current) return;

    drawingRef.current = false;
    const stroke = cloneStroke(currentStrokeRef.current);
    currentStrokeRef.current = null;

    const previous = strokeBeforeDrawingRef.current;
    if (previous) {
      const nextHistory = [...historyRef.current, previous].slice(-50);
      historyRef.current = nextHistory;
      setHistory(nextHistory);
    }
    strokeBeforeDrawingRef.current = null;

    futureRef.current = [];
    setFuture([]);
    persistDocument(documentRef.current);

    void sendWhiteboardMessage({
      type: "update",
      element: stroke,
    });
  }, [persistDocument, sendWhiteboardMessage]);

  /* ==========================================================
     POINTER CANCEL
  ========================================================== */

  const handlePointerCancel = useCallback(() => {
    drawingRef.current = false;
    currentStrokeRef.current = null;
    strokeBeforeDrawingRef.current = null;
    panningRef.current = false;
    panStartRef.current = null;
  }, []);

  /* ==========================================================
     TEXT SAVE
  ========================================================== */

  const saveText = useCallback(() => {
    if (!textEditor || !textEditor.value.trim()) {
      setTextEditor(null);
      return;
    }

    const element: TextElement = {
      id: createId(),
      type: "text",
      x: textEditor.x,
      y: textEditor.y,
      text: textEditor.value,
      color,
      fontSize: textSize,
    };

    const previous = cloneDocument(documentRef.current);
    const nextDocument = {
      ...documentRef.current,
      elements: [...documentRef.current.elements, element],
    };

    const nextHistory = [...historyRef.current, previous].slice(-50);
    historyRef.current = nextHistory;
    setHistory(nextHistory);
    futureRef.current = [];
    setFuture([]);
    applyDocument(nextDocument, false);

    void sendWhiteboardMessage({
      type: "update",
      element,
    });

    setTextEditor(null);
  }, [applyDocument, color, sendWhiteboardMessage, textEditor, textSize]);

  /* ==========================================================
     IMAGE PROCESSING
  ========================================================== */

  const fileToDataUrl = useCallback(
    (
      file: File,
    ): Promise<{
      src: string;
      width: number;
      height: number;
    }> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => {
          reject(new Error("Failed to read image"));
        };

        reader.onload = () => {
          const source = reader.result;
          if (typeof source !== "string") {
            reject(new Error("Invalid image"));
            return;
          }

          const image = new Image();
          image.onload = () => {
            let width = image.width;
            let height = image.height;

            const ratio = Math.min(
              IMAGE_MAX_WIDTH / width,
              IMAGE_MAX_HEIGHT / height,
              1,
            );

            width = Math.round(width * ratio);
            height = Math.round(height * ratio);

            const canvas = window.document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");
            if (!context) {
              reject(new Error("Canvas unavailable"));
              return;
            }

            context.drawImage(image, 0, 0, width, height);

            resolve({
              src: canvas.toDataURL("image/jpeg", 0.86),
              width,
              height,
            });
          };

          image.onerror = () => {
            reject(new Error("Invalid image"));
          };

          image.src = source;
        };

        reader.readAsDataURL(file);
      });
    },
    [],
  );

  /* ==========================================================
     IMAGE INSERT
  ========================================================== */

  const insertImage = useCallback(
    async (file: File) => {
      if (role !== "TEACHER") return;
      if (!file.type.startsWith("image/")) return;

      try {
        const image = await fileToDataUrl(file);
        const maxWidth = 900;
        const scale = Math.min(maxWidth / image.width, 1);
        const width = image.width * scale;
        const height = image.height * scale;

        const currentCamera = cameraRef.current;
        const rect = getViewportRect();

        if (!rect) return;

        const centerWorld = {
          x: currentCamera.x,
          y: currentCamera.y,
        };

        const element: ImageElement = {
          id: createId(),
          type: "image",
          x: centerWorld.x - width / 2,
          y: centerWorld.y - height / 2,
          width,
          height,
          src: image.src,
          name: file.name,
        };

        const previous = cloneDocument(documentRef.current);
        const nextDocument = {
          ...documentRef.current,
          elements: [...documentRef.current.elements, element],
        };

        const nextHistory = [...historyRef.current, previous].slice(-50);
        historyRef.current = nextHistory;
        setHistory(nextHistory);
        futureRef.current = [];
        setFuture([]);

        applyDocument(nextDocument, false);
        setSelectedId(element.id);

        void sendWhiteboardMessage({
          type: "update",
          element,
        });
      } catch (error) {
        console.error("Failed to insert image:", error);
      }
    },
    [
      applyDocument,
      fileToDataUrl,
      getViewportRect,
      role,
      sendWhiteboardMessage,
    ],
  );

  /* ==========================================================
     FILE INPUT
  ========================================================== */

  const handleImageInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        void insertImage(file);
      }
      event.target.value = "";
    },
    [insertImage],
  );

  /* ==========================================================
     DROP IMAGE
  ========================================================== */

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (role !== "TEACHER") return;

      const file = event.dataTransfer.files?.[0];
      if (file) {
        void insertImage(file);
      }
    },
    [insertImage, role],
  );

  /* ==========================================================
     DRAG TEXT / IMAGE
  ========================================================== */

  const draggingRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const startElementDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, element: WhiteboardElement) => {
      if (role !== "TEACHER") return;
      if (tool !== "select") return;

      if (element.type !== "text" && element.type !== "image") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const point = screenToWorld(event.clientX, event.clientY);
      if (!point) return;

      draggingRef.current = {
        id: element.id,
        offsetX: point.x - element.x,
        offsetY: point.y - element.y,
      };

      setSelectedId(element.id);
      const previous = cloneDocument(documentRef.current);

      const handleMove = (moveEvent: PointerEvent) => {
        const current = draggingRef.current;
        if (!current) return;

        const nextPoint = screenToWorld(moveEvent.clientX, moveEvent.clientY);
        if (!nextPoint) return;

        const nextX = clamp(nextPoint.x - current.offsetX, 0, WORLD_WIDTH - 50);
        const nextY = clamp(
          nextPoint.y - current.offsetY,
          0,
          WORLD_HEIGHT - 50,
        );

        const nextElements = documentRef.current.elements.map((item) => {
          if (
            item.id !== current.id ||
            (item.type !== "text" && item.type !== "image")
          ) {
            return item;
          }
          return {
            ...item,
            x: nextX,
            y: nextY,
          };
        });

        const nextDocument = {
          ...documentRef.current,
          elements: nextElements,
        };

        documentRef.current = nextDocument;
        setDocument(nextDocument);
        redrawCanvas();
      };

      const handleUp = () => {
        const current = draggingRef.current;

        if (current) {
          const moved = documentRef.current.elements.find(
            (item) =>
              item.id === current.id &&
              (item.type === "text" || item.type === "image"),
          );

          if (moved && (moved.type === "text" || moved.type === "image")) {
            const nextHistory = [...historyRef.current, previous].slice(-50);
            historyRef.current = nextHistory;
            setHistory(nextHistory);
            futureRef.current = [];
            setFuture([]);
            persistDocument(documentRef.current);

            void sendWhiteboardMessage({
              type: "update",
              element: moved,
            });
          }
        }

        draggingRef.current = null;
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [
      persistDocument,
      redrawCanvas,
      role,
      screenToWorld,
      sendWhiteboardMessage,
      tool,
    ],
  );

  /* ==========================================================
     DELETE SELECTED
  ========================================================== */

  const deleteSelected = useCallback(() => {
    if (!selectedId || role !== "TEACHER") return;

    const exists = documentRef.current.elements.some(
      (element) => element.id === selectedId,
    );

    if (!exists) return;

    const previous = cloneDocument(documentRef.current);
    const nextDocument = {
      ...documentRef.current,
      elements: documentRef.current.elements.filter(
        (element) => element.id !== selectedId,
      ),
    };

    const nextHistory = [...historyRef.current, previous].slice(-50);
    historyRef.current = nextHistory;
    setHistory(nextHistory);
    futureRef.current = [];
    setFuture([]);
    applyDocument(nextDocument, false);

    void sendWhiteboardMessage({
      type: "delete",
      elementId: selectedId,
    });

    setSelectedId(null);
  }, [applyDocument, role, selectedId, sendWhiteboardMessage]);

  /* ==========================================================
     UNDO
  ========================================================== */

  const undo = useCallback(() => {
    if (role !== "TEACHER") return;
    if (historyRef.current.length === 0) return;

    const previous = historyRef.current[historyRef.current.length - 1];
    const current = cloneDocument(documentRef.current);

    historyRef.current = historyRef.current.slice(0, -1);
    futureRef.current = [...futureRef.current, current].slice(-50);

    setHistory(historyRef.current);
    setFuture(futureRef.current);

    documentRef.current = previous;
    setDocument(previous);
    persistDocument(previous);

    void sendWhiteboardMessage({
      type: "full-state",
      document: previous,
    });
  }, [persistDocument, role, sendWhiteboardMessage]);

  /* ==========================================================
     REDO
  ========================================================== */

  const redo = useCallback(() => {
    if (role !== "TEACHER") return;
    if (futureRef.current.length === 0) return;

    const next = futureRef.current[futureRef.current.length - 1];
    const current = cloneDocument(documentRef.current);

    futureRef.current = futureRef.current.slice(0, -1);
    historyRef.current = [...historyRef.current, current].slice(-50);

    setHistory(historyRef.current);
    setFuture(futureRef.current);

    documentRef.current = next;
    setDocument(next);
    persistDocument(next);

    void sendWhiteboardMessage({
      type: "full-state",
      document: next,
    });
  }, [persistDocument, role, sendWhiteboardMessage]);

  /* ==========================================================
     CLEAR BOARD
  ========================================================== */

  const clearBoard = useCallback(async () => {
    if (role !== "TEACHER") return;

    const previous = cloneDocument(documentRef.current);
    const nextHistory = [...historyRef.current, previous].slice(-50);

    historyRef.current = nextHistory;
    setHistory(nextHistory);
    futureRef.current = [];
    setFuture([]);

    const nextDocument = createEmptyDocument();
    applyDocument(nextDocument, false);
    setSelectedId(null);

    await sendWhiteboardMessage({
      type: "clear",
    });
  }, [applyDocument, role, sendWhiteboardMessage]);

  /* ==========================================================
     RESET CAMERA
  ========================================================== */

  const resetCamera = useCallback(() => {
    const nextCamera = clampCamera(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
      zoomRef.current,
    );

    cameraRef.current = nextCamera;
    setCamera(nextCamera);
  }, [clampCamera]);

  /* ==========================================================
     ZOOM AROUND POINT
  ========================================================== */

  const zoomAroundPoint = useCallback(
    (nextZoom: number, clientX?: number, clientY?: number) => {
      const rect = getViewportRect();
      if (!rect) return;

      const oldZoom = zoomRef.current;
      const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

      if (oldZoom === clampedZoom) return;

      let worldPoint: Point;

      if (typeof clientX === "number" && typeof clientY === "number") {
        const currentCamera = cameraRef.current;
        worldPoint = {
          x: currentCamera.x + (clientX - rect.left - rect.width / 2) / oldZoom,
          y: currentCamera.y + (clientY - rect.top - rect.height / 2) / oldZoom,
        };
      } else {
        worldPoint = cameraRef.current;
      }

      let nextCameraX = worldPoint.x;
      let nextCameraY = worldPoint.y;

      if (typeof clientX === "number" && typeof clientY === "number") {
        const screenX = clientX - rect.left - rect.width / 2;
        const screenY = clientY - rect.top - rect.height / 2;

        nextCameraX = worldPoint.x - screenX / clampedZoom;
        nextCameraY = worldPoint.y - screenY / clampedZoom;
      }

      const nextCamera = clampCamera(nextCameraX, nextCameraY, clampedZoom);
      zoomRef.current = clampedZoom;
      cameraRef.current = nextCamera;

      setZoom(clampedZoom);
      setCamera(nextCamera);
    },
    [clampCamera, getViewportRect],
  );

  /* ==========================================================
     MOUSE WHEEL ZOOM
  ========================================================== */

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (event.ctrlKey) return;
      event.preventDefault();

      const direction = event.deltaY > 0 ? -1 : 1;
      zoomAroundPoint(
        zoomRef.current + direction * ZOOM_STEP,
        event.clientX,
        event.clientY,
      );
    },
    [zoomAroundPoint],
  );

  /* ==========================================================
     TOUCH EVENTS
  ========================================================== */

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (role !== "STUDENT") return;

      const touches = event.touches;
      if (touches.length === 2) {
        const first = touches[0];
        const second = touches[1];
        const dx = second.clientX - first.clientX;
        const dy = second.clientY - first.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        pinchRef.current = {
          distance,
          zoom: zoomRef.current,
          centerX: (first.clientX + second.clientX) / 2,
          centerY: (first.clientY + second.clientY) / 2,
        };
      }
    },
    [role],
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (role !== "STUDENT") return;
      if (event.touches.length !== 2 || !pinchRef.current) return;

      event.preventDefault();
      const first = event.touches[0];
      const second = event.touches[1];
      const dx = second.clientX - first.clientX;
      const dy = second.clientY - first.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const ratio = distance / pinchRef.current.distance;

      zoomAroundPoint(
        pinchRef.current.zoom * ratio,
        pinchRef.current.centerX,
        pinchRef.current.centerY,
      );
    },
    [role, zoomAroundPoint],
  );

  const handleTouchEnd = useCallback(() => {
    pinchRef.current = null;
  }, []);

  /* ==========================================================
     RECEIVE LIVEKIT
  ========================================================== */

  useEffect(() => {
    const handleMessage = (
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== WHITEBOARD_TOPIC) return;

      try {
        const message = JSON.parse(
          new TextDecoder().decode(payload),
        ) as WhiteboardMessage;

        if (message.type === "request-state" && role === "TEACHER") {
          void sendWhiteboardMessage({
            type: "state",
            document: documentRef.current,
          });
          return;
        }

        if (message.type === "state" || message.type === "full-state") {
          documentRef.current = message.document;
          setDocument(message.document);
          persistDocument(message.document);

          if (role === "STUDENT") {
            const last = getLastVisibleElement(message.document);
            if (last) followElement(last);
          }
          return;
        }

        if (message.type === "update") {
          const index = documentRef.current.elements.findIndex(
            (element) => element.id === message.element.id,
          );

          let nextDocument: WhiteboardDocument;

          if (index >= 0) {
            const nextElements = [...documentRef.current.elements];
            nextElements[index] = message.element;
            nextDocument = { ...documentRef.current, elements: nextElements };
          } else {
            nextDocument = {
              ...documentRef.current,
              elements: [...documentRef.current.elements, message.element],
            };
          }

          documentRef.current = nextDocument;
          setDocument(nextDocument);
          persistDocument(nextDocument);

          if (role === "STUDENT") {
            followElement(message.element);
          }
          return;
        }

        if (message.type === "delete") {
          const nextDocument = {
            ...documentRef.current,
            elements: documentRef.current.elements.filter(
              (element) => element.id !== message.elementId,
            ),
          };
          documentRef.current = nextDocument;
          setDocument(nextDocument);
          persistDocument(nextDocument);
          return;
        }

        if (message.type === "clear") {
          const nextDocument = createEmptyDocument();
          documentRef.current = nextDocument;
          setDocument(nextDocument);
          persistDocument(nextDocument);
          if (role === "STUDENT") resetCamera();
          return;
        }
      } catch (error) {
        console.error("Failed to process whiteboard message:", error);
      }
    };

    room.on("dataReceived", handleMessage);
    return () => {
      room.off("dataReceived", handleMessage);
    };
  }, [
    followElement,
    persistDocument,
    resetCamera,
    role,
    room,
    sendWhiteboardMessage,
  ]);

  useEffect(() => {
    if (role !== "STUDENT") return;
    const timeout = window.setTimeout(() => {
      void sendWhiteboardMessage({ type: "request-state" });
    }, 300);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [role, sendWhiteboardMessage]);

  useEffect(() => {
    return () => {
      persistDocument(documentRef.current);
    };
  }, [persistDocument]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (role !== "TEACHER") return;

      const modifier = event.ctrlKey || event.metaKey;

      if (modifier && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (modifier && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }

      if (event.key === "Delete" && selectedId) {
        event.preventDefault();
        deleteSelected();
      }

      if (event.key === "Escape") {
        setTextEditor(null);
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteSelected, redo, role, selectedId, undo]);

  const renderedElements = document.elements.filter(
    (element) => element.type !== "stroke",
  );

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="absolute inset-0 z-50 flex min-h-0 flex-col overflow-hidden bg-[#F8F9FA]">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex min-h-[58px] shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2 shadow-sm sm:px-5">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-gray-900">
            Interactive Whiteboard
          </h2>

          <p className="hidden text-[11px] font-medium text-gray-500 sm:block">
            {role === "TEACHER"
              ? "Teacher Controls Active"
              : "Viewing teacher's screen"}
          </p>
        </div>

        {/* ==================================================
            TEACHER TOOLBAR
        ================================================== */}

        {role === "TEACHER" ? (
          <div className="flex min-w-0 max-w-[calc(100vw-130px)] items-center gap-2 overflow-x-auto scrollbar-none">
            {/* SELECT */}
            <button
              type="button"
              onClick={() => setTool("select")}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                tool === "select"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
              title="Select and move"
            >
              <MousePointer2 size={18} />
            </button>

            {/* PAN */}
            <button
              type="button"
              onClick={() => setTool("pan")}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                tool === "pan"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
              title="Pan board"
            >
              <Move size={18} />
            </button>

            {/* PEN */}
            <button
              type="button"
              onClick={() => setTool("pen")}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all ${
                tool === "pen"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
              title="Pen"
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <span className="hidden md:inline">Pen</span>
            </button>

            {/* COLOR */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsColorPickerOpen((value) => !value)}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 text-xs text-gray-600 shadow-sm transition hover:bg-gray-50"
                title="Pen color"
              >
                <span
                  className="h-4 w-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <ChevronDown size={14} />
              </button>

              {isColorPickerOpen && (
                <>
                  {/* Invisible backdrop to close the color picker when clicking outside */}
                  <div
                    className="fixed inset-0 z-[80]"
                    onClick={() => setIsColorPickerOpen(false)}
                  />

                  {/* The actual color picker grid, fixed to avoid overflow clipping */}
                  <div className="fixed top-[64px] left-1/2 -translate-x-1/2 z-[90] grid w-[230px] grid-cols-6 gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl sm:left-auto sm:right-1/4 sm:translate-x-0">
                    {COLORS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setColor(item);
                          setIsColorPickerOpen(false);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                        title={item}
                      >
                        <span
                          className="h-6 w-6 rounded-full border border-black/5"
                          style={{ backgroundColor: item }}
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* SIZE */}
            <div className="hidden shrink-0 items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 sm:flex shadow-sm">
              <button
                type="button"
                onClick={() => setBrushSize((size) => Math.max(2, size - 2))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 transition"
              >
                <Minus size={15} />
              </button>

              <span className="min-w-[32px] text-center text-xs font-bold text-gray-700">
                {brushSize}
              </span>

              <button
                type="button"
                onClick={() => setBrushSize((size) => Math.min(30, size + 2))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 transition"
              >
                <Plus size={15} />
              </button>
            </div>

            {/* ERASER */}
            <button
              type="button"
              onClick={() => setTool(tool === "eraser" ? "pen" : "eraser")}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                tool === "eraser"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
              title="Eraser"
            >
              <Eraser size={18} />
            </button>

            {/* TEXT */}
            <button
              type="button"
              onClick={() => setTool("text")}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                tool === "text"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
              title="Text box"
            >
              <Type size={18} />
            </button>

            {/* IMAGE */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
              title="Insert image"
            >
              <ImagePlus size={18} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageInput}
            />

            {/* UNDO */}
            <button
              type="button"
              disabled={history.length === 0}
              onClick={undo}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
              title="Undo"
            >
              <Undo2 size={18} />
            </button>

            {/* REDO */}
            <button
              type="button"
              disabled={future.length === 0}
              onClick={redo}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
              title="Redo"
            >
              <Redo2 size={18} />
            </button>

            {/* RESET VIEW */}
            <button
              type="button"
              onClick={resetCamera}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
              title="Reset view"
            >
              <RotateCcw size={18} />
            </button>

            {/* ZOOM OUT */}
            <button
              type="button"
              onClick={() => zoomAroundPoint(zoom - ZOOM_STEP)}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 sm:flex"
              title="Zoom out"
            >
              <Minus size={16} />
            </button>

            <span className="hidden min-w-[45px] text-center text-[11px] font-bold text-gray-500 sm:block">
              {Math.round(zoom * 100)}%
            </span>

            {/* ZOOM IN */}
            <button
              type="button"
              onClick={() => zoomAroundPoint(zoom + ZOOM_STEP)}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 sm:flex"
              title="Zoom in"
            >
              <Plus size={16} />
            </button>

            {/* DELETE */}
            {selectedId && (
              <button
                type="button"
                onClick={deleteSelected}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
                title="Delete selected"
              >
                <Trash2 size={18} />
              </button>
            )}

            {/* CLEAR */}
            <button
              type="button"
              onClick={() => void clearBoard()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
              title="Clear whiteboard"
            >
              <Trash2 size={18} />
            </button>

            {/* CLOSE */}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
              title="Close whiteboard"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          /* ==================================================
             STUDENT HEADER
          ================================================== */
          <div className="flex items-center gap-2">
            <span className="hidden rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600 sm:block">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              onClick={() => zoomAroundPoint(zoom - ZOOM_STEP)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
              title="Zoom out"
            >
              <Minus size={18} />
            </button>

            <button
              type="button"
              onClick={() => zoomAroundPoint(zoom + ZOOM_STEP)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
              title="Zoom in"
            >
              <Plus size={18} />
            </button>

            <button
              type="button"
              onClick={resetCamera}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
              title="Reset view"
            >
              <RotateCcw size={18} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
              title="Close whiteboard"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* ======================================================
          BOARD VIEWPORT
      ====================================================== */}
      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden bg-gray-100 p-2 sm:p-4"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ==================================================
            WHITE BOARD
        ================================================== */}
        <div className="relative h-full min-h-0 w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200/50 sm:rounded-2xl">
          {/* ==================================================
              CANVAS
          ================================================== */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 block h-full w-full touch-none ${
              role === "TEACHER"
                ? tool === "pan"
                  ? "cursor-grab"
                  : tool === "select"
                    ? "cursor-default"
                    : "cursor-crosshair"
                : "cursor-grab"
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          />

          {/* ==================================================
              TEXT + IMAGE WORLD LAYER
          ================================================== */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {renderedElements.map((element) => {
              if (element.type === "text") {
                const screen = worldToScreen({
                  x: element.x,
                  y: element.y,
                });

                if (!screen) return null;

                return (
                  <div
                    key={element.id}
                    className={`pointer-events-auto absolute select-none whitespace-pre-wrap ${
                      selectedId === element.id
                        ? "rounded-md ring-2 ring-indigo-500/50"
                        : ""
                    }`}
                    style={{
                      left: screen.x,
                      top: screen.y,
                      color: element.color,
                      fontSize: `${element.fontSize * zoom}px`,
                      lineHeight: 1.2,
                      maxWidth: `${Math.max(240, 700 * zoom)}px`,
                      transform: "translate(0, -0%)",
                      cursor:
                        role === "TEACHER" && tool === "select"
                          ? "move"
                          : "default",
                    }}
                    onPointerDown={(event) => startElementDrag(event, element)}
                  >
                    {element.text}
                  </div>
                );
              }

              if (element.type === "image") {
                const screen = worldToScreen({
                  x: element.x,
                  y: element.y,
                });

                if (!screen) return null;

                return (
                  <div
                    key={element.id}
                    className={`pointer-events-auto absolute overflow-hidden ${
                      selectedId === element.id ? "ring-2 ring-indigo-500" : ""
                    }`}
                    style={{
                      left: screen.x,
                      top: screen.y,
                      width: element.width * zoom,
                      height: element.height * zoom,
                      cursor:
                        role === "TEACHER" && tool === "select"
                          ? "move"
                          : "default",
                    }}
                    onPointerDown={(event) => startElementDrag(event, element)}
                  >
                    <img
                      src={element.src}
                      alt={element.name ?? "Whiteboard image"}
                      draggable={false}
                      className="h-full w-full select-none object-contain"
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* ==================================================
              TEXT EDITOR
          ================================================== */}
          {textEditor &&
            (() => {
              const screen = worldToScreen({
                x: textEditor.x,
                y: textEditor.y,
              });

              if (!screen) return null;

              return (
                <div
                  className="absolute z-30"
                  style={{
                    left: screen.x,
                    top: screen.y,
                  }}
                >
                  <textarea
                    autoFocus
                    value={textEditor.value}
                    onChange={(event) =>
                      setTextEditor({
                        ...textEditor,
                        value: event.target.value,
                      })
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        saveText();
                      }
                      if (event.key === "Escape") {
                        setTextEditor(null);
                      }
                    }}
                    placeholder="Type here..."
                    className="min-h-[48px] min-w-[200px] resize rounded-xl border-2 border-indigo-500 bg-white p-2.5 text-sm shadow-xl outline-none ring-4 ring-indigo-500/20"
                    style={{
                      color,
                      fontSize: `${textSize}px`,
                    }}
                  />

                  <div className="mt-2 flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                    {TEXT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTextSize(size)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                          textSize === size
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={saveText}
                      className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 shadow-sm"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              );
            })()}

          {/* ==================================================
              STUDENT PAN HINT
          ================================================== */}
          {role === "STUDENT" && document.elements.length === 0 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center px-4">
              <div className="rounded-full border border-gray-200 bg-white/95 px-4 py-2 text-xs font-bold text-gray-500 shadow-sm backdrop-blur-sm">
                Teacher's whiteboard will appear here
              </div>
            </div>
          )}

          {/* ==================================================
              TEACHER EMPTY HINT
          ================================================== */}
          {role === "TEACHER" &&
            document.elements.length === 0 &&
            !textEditor && (
              <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center px-4">
                <div className="rounded-full border border-gray-200 bg-white/95 px-4 py-2 text-xs font-bold text-gray-500 shadow-sm backdrop-blur-sm">
                  Draw, add text, or drop an image here
                </div>
              </div>
            )}

          {/* ==================================================
              STUDENT MOBILE HELP
          ================================================== */}
          {role === "STUDENT" && (
            <div className="pointer-events-none absolute bottom-4 right-4 hidden rounded-xl border border-gray-200 bg-white/95 px-3 py-2 text-[10px] font-bold text-gray-500 shadow-sm backdrop-blur-sm sm:block">
              Pinch to zoom • Drag to explore
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CLONE STROKE
============================================================ */

function cloneStroke(stroke: StrokeElement): StrokeElement {
  return {
    ...stroke,
    points: stroke.points.map((point) => ({ ...point })),
  };
}

/* ============================================================
   GET LAST VISIBLE ELEMENT
============================================================ */

function getLastVisibleElement(
  document: WhiteboardDocument,
): WhiteboardElement | null {
  for (let index = document.elements.length - 1; index >= 0; index--) {
    const element = document.elements[index];

    if (element.type === "stroke" && element.points.length === 0) {
      continue;
    }

    return element;
  }
  return null;
}
