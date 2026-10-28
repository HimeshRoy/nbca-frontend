"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRoomContext } from "@livekit/components-react";

import {
  Eraser,
  Minus,
  Plus,
  Trash2,
  X,
} from "lucide-react";

interface WhiteboardProps {
  role: "TEACHER" | "STUDENT";
  onClose: () => void;
}

/* ============================================================
   TYPES
============================================================ */

type WhiteboardOperation = {
  type: "draw";
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  brushSize: number;
  isEraser: boolean;
};

type WhiteboardMessage =
  | WhiteboardOperation
  | {
      type: "clear";
    }
  | {
      type: "request-state";
    }
  | {
      type: "state";
      operations: WhiteboardOperation[];
    };

const WHITEBOARD_TOPIC = "nbca-whiteboard";

/* ============================================================
   COMPONENT
============================================================ */

export default function Whiteboard({
  role,
  onClose,
}: WhiteboardProps) {
  const room = useRoomContext();

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const [isDrawing, setIsDrawing] =
    useState(false);

  const [brushSize, setBrushSize] =
    useState(4);

  const [isEraser, setIsEraser] =
    useState(false);

  const lastPosition =
    useRef<{
      x: number;
      y: number;
    } | null>(null);

  /*
   * This contains the complete current
   * whiteboard history.
   */
  const operationsRef =
    useRef<WhiteboardOperation[]>([]);

  /* ============================================================
     DRAW LINE
  ============================================================ */

  const drawLine = useCallback(
    (
      previousX: number,
      previousY: number,
      x: number,
      y: number,
      size: number,
      eraser: boolean,
    ) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const context =
        canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.lineWidth = size;
      context.lineCap = "round";
      context.lineJoin = "round";

      context.strokeStyle = eraser
        ? "#ffffff"
        : "#111827";

      context.beginPath();

      context.moveTo(
        previousX,
        previousY,
      );

      context.lineTo(x, y);

      context.stroke();

      context.closePath();
    },
    [],
  );

  /* ============================================================
     CLEAR CANVAS
  ============================================================ */

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    context.clearRect(
      0,
      0,
      rect.width,
      rect.height,
    );

    context.fillStyle = "#ffffff";

    context.fillRect(
      0,
      0,
      rect.width,
      rect.height,
    );
  }, []);

  /* ============================================================
     REDRAW ALL OPERATIONS
  ============================================================ */

  const redrawOperations = useCallback(
    (
      operations: WhiteboardOperation[],
    ) => {
      clearCanvas();

      for (const operation of operations) {
        drawLine(
          operation.previousX,
          operation.previousY,
          operation.x,
          operation.y,
          operation.brushSize,
          operation.isEraser,
        );
      }
    },
    [clearCanvas, drawLine],
  );

  /* ============================================================
     CANVAS INITIALIZATION + RESIZE
  ============================================================ */

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const resizeCanvas = () => {
      const rect =
        canvas.getBoundingClientRect();

      if (
        rect.width <= 0 ||
        rect.height <= 0
      ) {
        return;
      }

      const dpr =
        window.devicePixelRatio || 1;

      /*
       * Save current operations before
       * resizing the physical canvas.
       */
      const operations =
        operationsRef.current;

      canvas.width =
        Math.round(rect.width * dpr);

      canvas.height =
        Math.round(rect.height * dpr);

      const context =
        canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0,
      );

      context.fillStyle = "#ffffff";

      context.fillRect(
        0,
        0,
        rect.width,
        rect.height,
      );

      /*
       * Restore the board after resize.
       */
      for (const operation of operations) {
        drawLine(
          operation.previousX,
          operation.previousY,
          operation.x,
          operation.y,
          operation.brushSize,
          operation.isEraser,
        );
      }
    };

    resizeCanvas();

    window.addEventListener(
      "resize",
      resizeCanvas,
    );

    return () => {
      window.removeEventListener(
        "resize",
        resizeCanvas,
      );
    };
  }, [drawLine]);

  /* ============================================================
     SEND WHITEBOARD DATA
  ============================================================ */

  const sendWhiteboardMessage =
    useCallback(
      async (
        message: WhiteboardMessage,
      ) => {
        try {
          const payload =
            new TextEncoder().encode(
              JSON.stringify(message),
            );

          await room.localParticipant.publishData(
            payload,
            {
              reliable: true,
              topic: WHITEBOARD_TOPIC,
            },
          );
        } catch (error) {
          console.error(
            "Failed to send whiteboard update:",
            error,
          );
        }
      },
      [room],
    );

  /* ============================================================
     RECEIVE WHITEBOARD DATA
  ============================================================ */

  useEffect(() => {
    const handleWhiteboardMessage = (
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string,
    ) => {
      /*
       * Ignore chat, reactions,
       * raise-hand and other data messages.
       */
      if (
        topic !== WHITEBOARD_TOPIC
      ) {
        return;
      }

      try {
        const message =
          JSON.parse(
            new TextDecoder().decode(
              payload,
            ),
          ) as WhiteboardMessage;

        /* ======================================================
           DRAW
        ====================================================== */

        if (
          message.type === "draw"
        ) {
          /*
           * Store operation.
           */
          operationsRef.current.push(
            message,
          );

          /*
           * Draw it immediately.
           */
          drawLine(
            message.previousX,
            message.previousY,
            message.x,
            message.y,
            message.brushSize,
            message.isEraser,
          );

          return;
        }

        /* ======================================================
           CLEAR
        ====================================================== */

        if (
          message.type === "clear"
        ) {
          operationsRef.current = [];

          clearCanvas();

          return;
        }

        /* ======================================================
           STUDENT REQUESTED STATE
        ====================================================== */

        if (
          message.type ===
            "request-state" &&
          role === "TEACHER"
        ) {
          /*
           * Teacher sends the complete
           * current board.
           */
          void sendWhiteboardMessage({
            type: "state",
            operations:
              operationsRef.current,
          });

          return;
        }

        /* ======================================================
           STUDENT RECEIVES STATE
        ====================================================== */

        if (
          message.type === "state" &&
          role === "STUDENT"
        ) {
          operationsRef.current =
            message.operations;

          redrawOperations(
            message.operations,
          );

          return;
        }
      } catch (error) {
        console.error(
          "Failed to process whiteboard message:",
          error,
        );
      }
    };

    room.on(
      "dataReceived",
      handleWhiteboardMessage,
    );

    return () => {
      room.off(
        "dataReceived",
        handleWhiteboardMessage,
      );
    };
  }, [
    room,
    role,
    drawLine,
    clearCanvas,
    redrawOperations,
    sendWhiteboardMessage,
  ]);

  /* ============================================================
     REQUEST CURRENT STATE
  ============================================================ */

  useEffect(() => {
    if (role !== "STUDENT") {
      return;
    }

    /*
     * Wait one tick so the data listener
     * is definitely registered first.
     */
    const timeout = window.setTimeout(
      () => {
        void sendWhiteboardMessage({
          type: "request-state",
        });
      },
      100,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    role,
    sendWhiteboardMessage,
  ]);

  /* ============================================================
     POSITION
  ============================================================ */

  const getPosition = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect =
      canvas.getBoundingClientRect();

    if ("touches" in event) {
      const touch =
        event.touches[0];

      if (!touch) {
        return null;
      }

      return {
        x:
          touch.clientX -
          rect.left,

        y:
          touch.clientY -
          rect.top,
      };
    }

    return {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    };
  };

  /* ============================================================
     START DRAWING
  ============================================================ */

  const startDrawing = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    /*
     * Students are completely
     * read-only.
     */
    if (role !== "TEACHER") {
      return;
    }

    event.preventDefault();

    const position =
      getPosition(event);

    if (!position) {
      return;
    }

    lastPosition.current =
      position;

    setIsDrawing(true);
  };

  /* ============================================================
     DRAW
  ============================================================ */

  const draw = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (
      role !== "TEACHER" ||
      !isDrawing ||
      !lastPosition.current
    ) {
      return;
    }

    event.preventDefault();

    const position =
      getPosition(event);

    if (!position) {
      return;
    }

    const previous =
      lastPosition.current;

    const operation: WhiteboardOperation =
      {
        type: "draw",

        x: position.x,
        y: position.y,

        previousX: previous.x,
        previousY: previous.y,

        brushSize,

        isEraser,
      };

    /*
     * Draw locally immediately.
     */
    drawLine(
      operation.previousX,
      operation.previousY,
      operation.x,
      operation.y,
      operation.brushSize,
      operation.isEraser,
    );

    /*
     * Store operation locally.
     */
    operationsRef.current.push(
      operation,
    );

    /*
     * Send to every participant.
     */
    void sendWhiteboardMessage(
      operation,
    );

    lastPosition.current =
      position;
  };

  /* ============================================================
     STOP DRAWING
  ============================================================ */

  const stopDrawing = () => {
    setIsDrawing(false);

    lastPosition.current = null;
  };

  /* ============================================================
     CLEAR BOARD
  ============================================================ */

  const handleClearBoard =
    async () => {
      if (role !== "TEACHER") {
        return;
      }

      operationsRef.current = [];

      clearCanvas();

      await sendWhiteboardMessage({
        type: "clear",
      });
    };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#0b0f19]">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-black/10 bg-white px-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Whiteboard
          </h2>

          <p className="text-[10px] text-slate-400">
            {role === "TEACHER"
              ? "Teacher whiteboard"
              : "Viewing teacher whiteboard"}
          </p>
        </div>

        {/* ==================================================
            TEACHER TOOLS
        ================================================== */}

        {role === "TEACHER" ? (
          <div className="flex items-center gap-2">
            {/* BRUSH SIZE */}

            <div className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 sm:flex">
              <button
                type="button"
                onClick={() =>
                  setBrushSize(
                    (size) =>
                      Math.max(
                        1,
                        size - 1,
                      ),
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-900"
                title="Decrease brush size"
              >
                <Minus size={14} />
              </button>

              <span className="min-w-[34px] text-center text-[11px] font-medium text-slate-600">
                {brushSize}px
              </span>

              <button
                type="button"
                onClick={() =>
                  setBrushSize(
                    (size) =>
                      Math.min(
                        30,
                        size + 1,
                      ),
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-900"
                title="Increase brush size"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* ERASER */}

            <button
              type="button"
              onClick={() =>
                setIsEraser(
                  (value) =>
                    !value,
                )
              }
              className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition ${
                isEraser
                  ? "border-[#3949ab]/30 bg-[#3949ab]/10 text-[#3949ab]"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
              title="Eraser"
            >
              <Eraser size={15} />

              <span className="hidden sm:inline">
                Eraser
              </span>
            </button>

            {/* CLEAR */}

            <button
              type="button"
              onClick={
                handleClearBoard
              }
              className="flex h-9 items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 text-xs font-medium text-red-500 transition hover:bg-red-100"
              title="Clear whiteboard"
            >
              <Trash2 size={15} />

              <span className="hidden sm:inline">
                Clear
              </span>
            </button>

            {/* CLOSE */}

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              title="Close whiteboard"
            >
              <X size={17} />
            </button>
          </div>
        ) : (
          /* ==================================================
             STUDENT CLOSE
          ================================================== */

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            title="Close whiteboard"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* ======================================================
          CANVAS
      ====================================================== */}

      <div className="min-h-0 flex-1 bg-slate-200 p-3">
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-white shadow-sm">
          <canvas
            ref={canvasRef}
            className={`h-full w-full touch-none ${
              role === "TEACHER"
                ? "cursor-crosshair"
                : "cursor-default"
            }`}
            onMouseDown={
              startDrawing
            }
            onMouseMove={draw}
            onMouseUp={
              stopDrawing
            }
            onMouseLeave={
              stopDrawing
            }
            onTouchStart={
              startDrawing
            }
            onTouchMove={draw}
            onTouchEnd={
              stopDrawing
            }
          />
        </div>
      </div>
    </div>
  );
}