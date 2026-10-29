"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { Send, X, MessageSquare } from "lucide-react";

import { useChat, useLocalParticipant } from "@livekit/components-react";

import {
  getClassroomChat,
  saveClassroomChatMessage,
  type ClassroomChatMessage,
} from "@/services/live-class-chat.service";

type ClassroomChatProps = {
  liveClassId: string;
  onClose?: () => void;
  showCloseButton?: boolean;
};

export default function ClassroomChat({
  liveClassId,
  onClose,
  showCloseButton = false,
}: ClassroomChatProps) {
  const { chatMessages, send, isSending } = useChat();

  const { localParticipant } = useLocalParticipant();

  const [message, setMessage] = useState("");

  const [history, setHistory] = useState<ClassroomChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /*
   * Load temporary chat history from Redis.
   */
  useEffect(() => {
    if (!liveClassId) {
      return;
    }

    const loadChatHistory = async () => {
      try {
        const messages = await getClassroomChat(liveClassId);

        setHistory(messages);
      } catch (error) {
        console.error("Failed to load classroom chat:", error);
      }
    };

    loadChatHistory();
  }, [liveClassId]);

  /*
   * Combine Redis history
   * + LiveKit realtime messages.
   */
  const allMessages = [
    ...history.map((chatMessage) => ({
      id: chatMessage.id,
      timestamp: chatMessage.timestamp,
      message: chatMessage.message,
      sender: {
        identity: chatMessage.identity,
        name: chatMessage.name,
      },
    })),

    ...chatMessages.map((chatMessage, index) => ({
      id: `${chatMessage.timestamp}-${index}`,
      timestamp: chatMessage.timestamp,
      message: chatMessage.message,
      sender: chatMessage.from,
    })),
  ];

  /*
   * Scroll to newest message.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [allMessages.length]);

  /*
   * Send message through LiveKit
   * and save it temporarily in Redis.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = message.trim();

    if (!trimmed || isSending) {
      return;
    }

    try {
      const timestamp = Date.now();

      /*
       * 1. Send through LiveKit.
       */
      await send(trimmed);

      /*
       * 2. Save temporarily in Redis.
       */
      await saveClassroomChatMessage(liveClassId, {
        identity: localParticipant.identity,

        name: localParticipant.name || localParticipant.identity,

        message: trimmed,

        timestamp,
      });

      /*
       * Clear only after success.
       */
      setMessage("");
    } catch (error) {
      console.error("Failed to send chat message:", error);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0d111b]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-white/[0.07] px-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#9da7ff]" />

              <div>
                <p className="text-sm font-semibold">Classroom Chat</p>

                <p className="mt-0.5 text-[11px] text-white/35">
                  Messages are visible to everyone
                </p>
              </div>
            </div>

        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Close chat"
            title="Close chat"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4">
        {allMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
              <Send size={17} className="text-white/40" />
            </div>

            <p className="text-sm font-medium text-white/70">No messages yet</p>

            <p className="mt-1 max-w-[220px] text-xs leading-5 text-white/35">
              Send a message to start the classroom conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {allMessages.map((chatMessage) => {
              const sender = chatMessage.sender;

              const senderName =
                sender?.name || sender?.identity || "Participant";

              const isMine = sender?.identity === localParticipant.identity;

              return (
                <div
                  key={chatMessage.id}
                  className={`flex flex-col ${
                    isMine ? "items-end" : "items-start"
                  }`}
                >
                  <span className="mb-1 max-w-[90%] truncate text-[11px] font-semibold text-white/45">
                    {isMine ? "You" : senderName}
                  </span>

                  <div
                    className={`max-w-[90%] break-words rounded-xl px-3 py-2.5 ${
                      isMine
                        ? "rounded-tr-md bg-[#3949ab] text-white"
                        : "rounded-tl-md border border-white/[0.06] bg-white/[0.04] text-white/80"
                    }`}
                  >
                    <p className="text-sm leading-5">{chatMessage.message}</p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* =====================================================
          INPUT
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-white/[0.07] p-3"
      >
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message..."
            maxLength={1000}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/25"
          />

          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4655d6] text-white transition hover:bg-[#5261e6] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
