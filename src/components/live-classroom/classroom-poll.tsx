"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  Check,
  CircleStop,
  Plus,
  Radio,
  Send,
  X,
} from "lucide-react";

import { useRoomContext } from "@livekit/components-react";

import {
  closeLiveClassPoll,
  createLiveClassPoll,
  getLiveClassPoll,
  voteLiveClassPoll,
  type LiveClassPoll,
} from "@/services/live-class-poll.service";

type ClassroomPollProps = {
  liveClassId: string;
  role: "TEACHER" | "STUDENT";
};

const POLL_TOPIC = "nbca-poll";

type PollMessage =
  | {
      type: "poll-created";
      poll: LiveClassPoll;
    }
  | {
      type: "poll-updated";
      poll: LiveClassPoll;
    }
  | {
      type: "poll-closed";
      poll: LiveClassPoll;
    }
  | {
      type: "poll-state";
      poll: LiveClassPoll | null;
    }
  | {
      type: "poll-request-state";
    };

export default function ClassroomPoll({
  liveClassId,
  role,
}: ClassroomPollProps) {
  const room = useRoomContext();

  const [poll, setPoll] = useState<LiveClassPoll | null>(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [hasVoted, setHasVoted] = useState(false);

  const [showTeacherPanel, setShowTeacherPanel] = useState(false);

  const [question, setQuestion] = useState("");

  const [options, setOptions] = useState<string[]>(["", ""]);

  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (role !== "STUDENT" || !poll || poll.isActive) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPoll(null);
      setSelectedOption(null);
      setHasVoted(false);
    }, 10_000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [poll, role]);

  const sanitizePollForBroadcast = useCallback(
    (currentPoll: LiveClassPoll): LiveClassPoll => {
      if (!currentPoll.isActive) {
        return currentPoll;
      }

      const safePoll = {
        ...currentPoll,
      };

      delete safePoll.correctOptionId;

      return safePoll;
    },
    [],
  );

  const sendPollMessage = useCallback(
    async (message: PollMessage) => {
      try {
        if (room.state !== "connected") {
          return;
        }

        let safeMessage = message;

        if (
          message.type === "poll-created" ||
          message.type === "poll-updated" ||
          message.type === "poll-closed" ||
          message.type === "poll-state"
        ) {
          if (message.poll) {
            safeMessage = {
              ...message,
              poll:
                message.type === "poll-closed"
                  ? message.poll
                  : sanitizePollForBroadcast(message.poll),
            } as PollMessage;
          }
        }

        const payload = new TextEncoder().encode(JSON.stringify(safeMessage));

        await room.localParticipant.publishData(payload, {
          reliable: true,
          topic: POLL_TOPIC,
        });
      } catch (error) {
        console.error("Failed to send poll update:", error);
      }
    },
    [room, sanitizePollForBroadcast],
  );

  const loadPoll = useCallback(async () => {
    try {
      setLoading(true);

      const currentPoll = await getLiveClassPoll(liveClassId);

      setPoll(currentPoll);

      setHasVoted(currentPoll?.hasVoted ?? false);

      if (!currentPoll) {
        setSelectedOption(null);
        return;
      }

      if (!currentPoll.isActive) {
        setSelectedOption(null);
      }
    } catch (error) {
      console.error("Failed to load classroom poll:", error);
    } finally {
      setLoading(false);
    }
  }, [liveClassId]);

  useEffect(() => {
    void loadPoll();
  }, [loadPoll]);

  useEffect(() => {
    const handlePollMessage = (
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== POLL_TOPIC) {
        return;
      }

      try {
        const message = JSON.parse(
          new TextDecoder().decode(payload),
        ) as PollMessage;

        if (message.type === "poll-created") {
          setPoll(message.poll);

          setSelectedOption(null);

          setHasVoted(false);

          return;
        }

        if (message.type === "poll-updated") {
          setPoll(message.poll);

          return;
        }

        if (message.type === "poll-closed") {
          setPoll(message.poll);

          setSelectedOption(null);

          return;
        }

        if (message.type === "poll-state") {
          setPoll(message.poll);

          if (!message.poll) {
            setSelectedOption(null);
            setHasVoted(false);
          }

          return;
        }

        if (message.type === "poll-request-state" && role === "TEACHER") {
          void sendPollMessage({
            type: "poll-state",
            poll,
          });

          return;
        }
      } catch (error) {
        console.error("Failed to process poll message:", error);
      }
    };

    room.on("dataReceived", handlePollMessage);

    return () => {
      room.off("dataReceived", handlePollMessage);
    };
  }, [room, role, poll, sendPollMessage]);

  useEffect(() => {
    if (role !== "STUDENT") {
      return;
    }

    const timeout = window.setTimeout(() => {
      void sendPollMessage({
        type: "poll-request-state",
      });
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [role, sendPollMessage]);

  useEffect(() => {
    if (role !== "TEACHER") {
      return;
    }

    const handleParticipantConnected = () => {
      void sendPollMessage({
        type: "poll-state",
        poll,
      });
    };

    room.on("participantConnected", handleParticipantConnected);

    return () => {
      room.off("participantConnected", handleParticipantConnected);
    };
  }, [room, role, poll, sendPollMessage]);

  const handleCreatePoll = async () => {
    const trimmedQuestion = question.trim();

    const cleanedOptions = options.map((option) => option.trim());

    if (!trimmedQuestion) {
      window.alert("Please enter a poll question.");
      return;
    }

    if (cleanedOptions.length < 2) {
      window.alert("Please add at least 2 options.");
      return;
    }

    if (cleanedOptions.length > 6) {
      window.alert("A poll can have maximum 6 options.");
      return;
    }

    if (cleanedOptions.some((option) => !option)) {
      window.alert("Please fill all options before starting the poll.");
      return;
    }

    if (correctOptionIndex === null) {
      window.alert("Please select the correct answer.");
      return;
    }

    if (correctOptionIndex < 0 || correctOptionIndex >= cleanedOptions.length) {
      window.alert("Please select a valid correct answer.");
      return;
    }

    try {
      setSubmitting(true);

      const createdPoll = await createLiveClassPoll(liveClassId, {
        question: trimmedQuestion,
        options: cleanedOptions,
        correctOptionIndex,
      });

      setPoll(createdPoll);

      setQuestion("");

      setOptions(["", ""]);

      setCorrectOptionIndex(null);

      setShowTeacherPanel(false);

      await sendPollMessage({
        type: "poll-created",
        poll: createdPoll,
      });
    } catch (error: any) {
      console.error("Failed to create poll:", error);

      window.alert(error?.response?.data?.message || "Failed to create poll.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClosePoll = async () => {
    if (!poll?.isActive) {
      return;
    }

    const confirmed = window.confirm(
      "Close this poll? Students will no longer be able to vote.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);

      const closedPoll = await closeLiveClassPoll(liveClassId);

      setPoll(closedPoll);

      await sendPollMessage({
        type: "poll-closed",
        poll: closedPoll,
      });
    } catch (error: any) {
      console.error("Failed to close poll:", error);

      window.alert(error?.response?.data?.message || "Failed to close poll.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNewPoll = async () => {
    setPoll(null);

    setSelectedOption(null);

    setHasVoted(false);

    setQuestion("");

    setOptions(["", ""]);

    setCorrectOptionIndex(null);

    setShowTeacherPanel(true);

    await sendPollMessage({
      type: "poll-state",
      poll: null,
    });
  };

  const handleVote = async () => {
    if (
      role !== "STUDENT" ||
      !poll?.isActive ||
      !selectedOption ||
      hasVoted ||
      submitting
    ) {
      return;
    }

    try {
      setSubmitting(true);

      const updatedPoll = await voteLiveClassPoll(liveClassId, selectedOption);

      const safeUpdatedPoll = {
        ...updatedPoll,
      };

      delete safeUpdatedPoll.correctOptionId;

      setPoll(safeUpdatedPoll);

      setHasVoted(true);

      await sendPollMessage({
        type: "poll-updated",
        poll: safeUpdatedPoll,
      });
    } catch (error: any) {
      console.error("Failed to vote:", error);

      window.alert(error?.response?.data?.message || "Failed to submit vote.");
    } finally {
      setSubmitting(false);
    }
  };

  const addOption = () => {
    if (options.length >= 6) {
      return;
    }

    setOptions((current) => [...current, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      return;
    }

    if (correctOptionIndex === index) {
      setCorrectOptionIndex(null);
    } else if (correctOptionIndex !== null && correctOptionIndex > index) {
      setCorrectOptionIndex(correctOptionIndex - 1);
    }

    setOptions((current) =>
      current.filter((_, optionIndex) => optionIndex !== index),
    );
  };

  const updateOption = (index: number, value: string) => {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  };

  const totalVotes = useMemo(() => {
    if (!poll) {
      return 0;
    }

    return poll.options.reduce((total, option) => total + option.votes, 0);
  }, [poll]);

  if (loading && !poll && role === "STUDENT") {
    return null;
  }

  if (role === "TEACHER" && !poll && !showTeacherPanel) {
    return (
      <button
        type="button"
        onClick={() => setShowTeacherPanel(true)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-800"
        title="Create poll"
        aria-label="Create poll"
      >
        <BarChart3 size={19} />
      </button>
    );
  }

  if (role === "TEACHER" && !poll && showTeacherPanel) {
    return (
      <div className="fixed inset-x-4 bottom-24 z-[90] mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-gray-900">Create poll</p>

            <p className="mt-0.5 text-[11px] font-medium text-gray-500">
              Ask your students a quick question
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTeacherPanel(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {}

          <div>
            <label className="mb-2 block text-xs font-bold text-gray-700">
              Question
            </label>

            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What is the correct answer?"
              maxLength={300}
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">
                Options
              </label>

              <span className="text-[10px] font-medium text-gray-500">
                {options.length}/6
              </span>
            </div>

            <div className="space-y-2">
              {options.map((option, index) => {
                const isCorrect =
                  correctOptionIndex === index && option.trim() !== "";

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 rounded-xl border p-1.5 transition-all ${
                      isCorrect
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-transparent"
                    }`}
                  >
                    {}

                    <button
                      type="button"
                      onClick={() => {
                        if (option.trim()) {
                          setCorrectOptionIndex(index);
                        }
                      }}
                      disabled={!option.trim()}
                      title={
                        isCorrect ? "Correct answer" : "Mark as correct answer"
                      }
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
                        isCorrect
                          ? "border-emerald-200 bg-emerald-100 text-emerald-600"
                          : "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                      }`}
                    >
                      {isCorrect ? (
                        <Check size={15} />
                      ) : (
                        <span className="text-[10px] font-bold">
                          {String.fromCharCode(65 + index)}
                        </span>
                      )}
                    </button>

                    {}

                    <input
                      value={option}
                      onChange={(event) =>
                        updateOption(index, event.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      maxLength={150}
                      className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />

                    {}

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mt-2 text-[10px] font-medium text-gray-500">
              Click the circle on an option to mark it as the correct answer.
            </p>
          </div>

          {}

          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-xs font-semibold text-gray-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Plus size={15} />
              Add option
            </button>
          )}

          {}

          <button
            type="button"
            disabled={
              submitting ||
              correctOptionIndex === null ||
              options.some((option) => !option.trim())
            }
            onClick={() => void handleCreatePoll()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
          >
            <Send size={16} />

            {submitting ? "Starting..." : "Start poll"}
          </button>
        </div>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-[90] sm:bottom-28 sm:left-auto sm:right-5 sm:w-[390px]">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        {}

        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BarChart3 size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">Live Poll</p>

                {poll.isActive && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                    <Radio size={9} />
                    LIVE
                  </span>
                )}

                {!poll.isActive && (
                  <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-500">
                    CLOSED
                  </span>
                )}
              </div>

              <p className="mt-1 text-[10px] font-medium text-gray-500">
                {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
              </p>
            </div>
          </div>

          {}

          {role === "TEACHER" && poll.isActive && (
            <button
              type="button"
              onClick={() => void handleClosePoll()}
              disabled={submitting}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 text-[10px] font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              <CircleStop size={14} />
              Close
            </button>
          )}
        </div>

        {}

        <div className="px-5 pt-5">
          <h3 className="text-sm font-bold leading-6 text-gray-900">
            {poll.question}
          </h3>
        </div>

        {}

        <div className="space-y-2 px-5 py-5">
          {poll.options.map((option, index) => {
            const percentage =
              totalVotes > 0
                ? Math.round((option.votes / totalVotes) * 100)
                : 0;

            const isSelected = selectedOption === option.id;

            const showCorrectAnswer = role === "TEACHER" || !poll.isActive;

            const isCorrect =
              showCorrectAnswer && poll.correctOptionId === option.id;

            return (
              <button
                key={option.id}
                type="button"
                disabled={
                  role === "TEACHER" || !poll.isActive || hasVoted || submitting
                }
                onClick={() => setSelectedOption(option.id)}
                className={`relative w-full overflow-hidden rounded-xl border text-left transition-all ${
                  isCorrect
                    ? "border-emerald-300 bg-emerald-50"
                    : isSelected
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                } disabled:cursor-default`}
              >
                {}

                {(hasVoted || role === "TEACHER" || !poll.isActive) && (
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                      isCorrect ? "bg-emerald-100" : "bg-indigo-100"
                    }`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                )}

                <div className="relative flex items-center gap-3 px-3.5 py-3">
                  {}

                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                      isCorrect
                        ? "bg-emerald-100 text-emerald-600"
                        : isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isCorrect ? (
                      <Check size={14} />
                    ) : isSelected ? (
                      <Check size={14} />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>

                  {}

                  <span
                    className={`min-w-0 flex-1 text-xs font-bold ${
                      isCorrect ? "text-emerald-700" : "text-gray-700"
                    }`}
                  >
                    {option.text}

                    {isCorrect && (
                      <span className="ml-2 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                        Correct answer
                      </span>
                    )}
                  </span>

                  {}

                  {(hasVoted || role === "TEACHER" || !poll.isActive) && (
                    <span className="shrink-0 text-[10px] font-bold text-gray-500">
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {}

        {role === "STUDENT" && poll.isActive && !hasVoted && (
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
            <button
              type="button"
              disabled={!selectedOption || submitting}
              onClick={() => void handleVote()}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
            >
              <Check size={15} />

              {submitting ? "Submitting..." : "Submit answer"}
            </button>
          </div>
        )}

        {}

        {role === "STUDENT" && hasVoted && poll.isActive && (
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 text-center">
            <p className="text-[11px] font-bold text-emerald-600">
              Your answer has been submitted
            </p>

            <p className="mt-1 text-[10px] font-medium text-gray-500">
              Results are updating live
            </p>
          </div>
        )}

        {}

        {!poll.isActive && (
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-center text-[11px] font-bold text-gray-500">
              Poll closed
            </p>

            {}

            {role === "TEACHER" && (
              <button
                type="button"
                onClick={() => void handleCreateNewPoll()}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-sm"
              >
                <Plus size={15} />
                Create new poll
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}