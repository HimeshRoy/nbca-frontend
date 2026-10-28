"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { Send, X } from "lucide-react";

import { useChat, useLocalParticipant } from "@livekit/components-react";

import {
  getClassroomChat,
  saveClassroomChatMessage,
  type ClassroomChatMessage,
} from "@/services/live-class-chat.service";

type ClassroomChatProps = {
  liveClassId: string;
  onClose: () => void;
};

export default function ClassroomChat({
  liveClassId,
  onClose,
}: ClassroomChatProps) {
  const { chatMessages, send, isSending } = useChat();

  const { localParticipant } = useLocalParticipant();

  const [message, setMessage] = useState("");

  const [history, setHistory] = useState<ClassroomChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /*
   * Load temporary chat history from Redis
   * when the classroom/chat opens.
   */
  useEffect(() => {
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
   * Combine:
   *
   * Redis history
   * +
   * LiveKit real-time messages
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
   * Scroll to the newest message.
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
       * 1. Send through LiveKit
       *
       * This makes the message appear
       * instantly for everyone in the room.
       */
      await send(trimmed);

      /*
       * 2. Save temporarily in Redis
       *
       * This allows the message to survive
       * a page refresh during the class.
       */
      await saveClassroomChatMessage(liveClassId, {
        identity: localParticipant.identity,

        name: localParticipant.name || localParticipant.identity,

        message: trimmed,

        timestamp,
      });

      /*
       * Clear input only after both
       * operations succeed.
       */
      setMessage("");
    } catch (error) {
      console.error("Failed to send chat message:", error);
    }
  };

  return (
    <aside className="absolute right-4 top-4 bottom-20 z-40 flex w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d111b]/95 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.07] px-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">Classroom chat</h3>

          <p className="mt-0.5 truncate text-[11px] text-white/40">
            Messages are visible to everyone
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/[0.06] hover:text-white"
          aria-label="Close chat"
        >
          <X size={17} />
        </button>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
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

              return (
                <div key={chatMessage.id} className="space-y-1">
                  <span className="block truncate text-xs font-semibold text-white/75">
                    {senderName}
                  </span>

                  <div className="max-w-[90%] rounded-xl rounded-tl-md border border-white/[0.06] bg-white/[0.04] px-3 py-2.5">
                    <p className="break-words text-sm leading-5 text-white/80">
                      {chatMessage.message}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-white/[0.07] p-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message..."
            maxLength={1000}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/25"
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
    </aside>
  );
}
