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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-indigo-600" />

          <div>
            <p className="text-sm font-bold text-gray-900">Classroom Chat</p>

            <p className="mt-0.5 text-[11px] font-medium text-gray-500">
              Messages are visible to everyone
            </p>
          </div>
        </div>

        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
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
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50">
              <Send size={18} className="text-gray-400" />
            </div>

            <p className="text-sm font-bold text-gray-900">No messages yet</p>

            <p className="mt-1.5 max-w-[220px] text-xs font-medium leading-5 text-gray-500">
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
                  <span className="mb-1 max-w-[90%] truncate text-[11px] font-bold text-gray-500">
                    {isMine ? "You" : senderName}
                  </span>

                  <div
                    className={`max-w-[90%] break-words rounded-xl px-3.5 py-2.5 ${
                      isMine
                        ? "rounded-tr-sm bg-indigo-600 text-white shadow-sm"
                        : "rounded-tl-sm border border-gray-100 bg-gray-50 text-gray-800"
                    }`}
                  >
                    <p className="text-sm leading-5 font-medium">{chatMessage.message}</p>
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
        className="shrink-0 border-t border-gray-200 bg-white p-3"
      >
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message..."
            maxLength={1000}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />

          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}