"use client";

import { use, useEffect, useMemo, useState } from "react";

import { useClassroomEvents } from "@/components/live-classroom/use-classroom-events";
import ClassroomChat from "@/components/live-classroom/classroom-chat";
import { markLiveClassLeave } from "@/services/attendance.service";
import Whiteboard from "@/components/live-classroom/whiteboard";
import ClassroomPoll from "@/components/live-classroom/classroom-poll";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useLocalParticipant,
  useTracks,
  useRoomContext,
  type TrackReference,
} from "@livekit/components-react";

import { BookOpen, Hand, LogOut, MessageSquare, Wifi } from "lucide-react";

import { Track } from "livekit-client";

import { joinLiveClassRoom } from "@/services/livekit.service";
import {
  checkStudentRemovalStatus,
  getLiveClassById,
} from "@/services/live-class.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

interface LiveClassData {
  id?: string;
  title?: string;
  description?: string | null;

  teacher?: {
    id?: string;
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    user?: {
      name?: string;
      fullName?: string;
    };
  };

  class?: {
    id?: string;
    name?: string;
    title?: string;
    className?: string;
  };

  subject?: {
    id?: string;
    name?: string;
    title?: string;
  };
}

/* ============================================================
   PAGE
============================================================ */

export default function StudentClassroomPage({ params }: Props) {
  const { id } = use(params);

  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  const [liveClass, setLiveClass] = useState<LiveClassData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const connectToClassroom = async () => {
      try {
        setLoading(true);
        setError(null);

        const roomData = await joinLiveClassRoom(id);

        setToken(roomData.token);
        setServerUrl(roomData.url);
        setLiveClass(roomData.liveClass);
      } catch (error: any) {
        console.error("Failed to join classroom:", error);

        setError(error?.response?.data?.message || "Failed to join classroom");
      } finally {
        setLoading(false);
      }
    };

    connectToClassroom();
  }, [id]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F8F9FA] text-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-gray-500">Preparing your classroom...</p>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F8F9FA] px-6 text-gray-900">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Wifi size={24} />
          </div>

          <h1 className="text-xl font-bold text-gray-900">Unable to join classroom</h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-7 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (removed) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F8F9FA] px-6 text-gray-900">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <LogOut size={24} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">Removed from classroom</h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
            You have been removed from this classroom by the teacher. You can no
            longer rejoin this class.
          </p>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="mt-7 w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            Return to live classes
          </button>
        </div>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return null;
  }

  /* ============================================================
     CLASSROOM
  ============================================================ */

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8F9FA]">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect
        audio={false}
        video={false}
        onDisconnected={async () => {
          console.log("Student disconnected from classroom");

          try {
            const wasRemoved = await checkStudentRemovalStatus(id);

            if (wasRemoved) {
              setRemoved(true);
              setToken(null);
              setServerUrl(null);
            }
          } catch (error) {
            console.error("Failed to check removal status:", error);
          }
        }}
      >
        <StudentClassroom liveClass={liveClass} />

        {/* LIVE POLL */}
        <ClassroomPoll liveClassId={id} role="STUDENT" />

        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

/* ============================================================
   STUDENT CLASSROOM
============================================================ */

const WHITEBOARD_CONTROL_TOPIC = "nbca-whiteboard-control";

function StudentClassroom({ liveClass }: { liveClass: LiveClassData | null }) {
  const { localParticipant } = useLocalParticipant();

  const room = useRoomContext();

  const { isRaised, toggleRaiseHand } = useClassroomEvents("STUDENT");

  /* ============================================================
     TRACKS
  ============================================================ */

  const cameraTracks = useTracks([
    {
      source: Track.Source.Camera,
      withPlaceholder: false,
    },
  ]);

  const screenTracks = useTracks([
    {
      source: Track.Source.ScreenShare,
      withPlaceholder: false,
    },
  ]);

  /* ============================================================
     UI STATE
  ============================================================ */

  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);

  useEffect(() => {
    const handleWhiteboardControl = (
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== WHITEBOARD_CONTROL_TOPIC) {
        return;
      }

      try {
        const message = JSON.parse(new TextDecoder().decode(payload)) as {
          type: "open" | "close";
        };

        if (message.type === "open") {
          setShowWhiteboard(true);
        }

        if (message.type === "close") {
          setShowWhiteboard(false);
        }
      } catch (error) {
        console.error("Failed to process whiteboard control:", error);
      }
    };

    room.on("dataReceived", handleWhiteboardControl);

    return () => {
      room.off("dataReceived", handleWhiteboardControl);
    };
  }, [room]);

  /* ============================================================
     CLASS DATA
  ============================================================ */

  const className =
    liveClass?.class?.name ||
    liveClass?.class?.className ||
    liveClass?.class?.title ||
    "Class";

  const subjectName =
    liveClass?.subject?.name || liveClass?.subject?.title || "Subject";

  const classTitle = liveClass?.title || `${subjectName} · ${className}`;

  const teacherName = useMemo(() => {
    const teacher = liveClass?.teacher;

    if (!teacher) {
      return "Teacher";
    }

    if (teacher.fullName) {
      return teacher.fullName;
    }

    if (teacher.name) {
      return teacher.name;
    }

    if (teacher.firstName || teacher.lastName) {
      return `${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`.trim();
    }

    if (teacher.user?.fullName) {
      return teacher.user.fullName;
    }

    if (teacher.user?.name) {
      return teacher.user.name;
    }

    return "Teacher";
  }, [liveClass]);

  /* ============================================================
     TEACHER CAMERA
  ============================================================ */

  const teacherTrack = cameraTracks.find(
    (track): track is TrackReference =>
      track.participant.identity !== localParticipant.identity &&
      track.publication !== undefined,
  );

  /* ============================================================
     SCREEN SHARE
  ============================================================ */

  const activeScreenShare: TrackReference | undefined = screenTracks.find(
    (track): track is TrackReference => track.publication !== undefined,
  );

  /* ============================================================
     LEAVE CLASS
  ============================================================ */

  const leaveClass = async () => {
    try {
      if (liveClass?.id) {
        await markLiveClassLeave(liveClass.id);
      }
    } catch (error) {
      console.error("Failed to update attendance:", error);
    } finally {
      await room.disconnect();
      window.history.back();
    }
  };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#F8F9FA] text-gray-900">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 shadow-sm z-10">
        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <BookOpen size={20} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-bold text-gray-900">{classTitle}</h1>

              <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />

              <span className="hidden text-xs font-medium text-gray-500 sm:block">
                {className}
              </span>
            </div>

            <p className="mt-0.5 truncate text-xs font-medium text-gray-500">
              {subjectName}
              {" · "}
              {teacherName}
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-xs font-bold text-red-600">Live</span>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="flex min-h-0 flex-1">
        {/* ===================================================
            VIDEO AREA
        =================================================== */}

        <section className="relative flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1 p-3 sm:p-4">
            {/* =================================================
                SCREEN SHARE
            ================================================= */}

            {activeScreenShare ? (
              <div className="relative h-full overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 bg-black shadow-sm">
                <VideoTrack
                  trackRef={activeScreenShare}
                  className="h-full w-full object-contain"
                />

                <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-[11px] font-medium text-white backdrop-blur sm:bottom-4 sm:left-4 sm:text-xs">
                  Teacher is sharing their screen
                </div>
              </div>
            ) : teacherTrack ? (
              /* =================================================
                 TEACHER CAMERA
              ================================================= */

              <StudentTeacherVideo
                track={teacherTrack}
                teacherName={teacherName}
              />
            ) : (
              /* =================================================
                 NO TEACHER VIDEO
              ================================================= */

              <div className="relative flex h-full items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col items-center px-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-2xl font-bold sm:h-24 sm:w-24 sm:text-3xl">
                    {getInitials(teacherName)}
                  </div>

                  <p className="mt-5 text-sm font-bold text-gray-900">{teacherName}</p>

                  <p className="mt-1.5 text-xs font-medium text-gray-500">
                    Waiting for teacher's video...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              STUDENT CONTROLS
          ================================================= */}

          <div className="flex h-[72px] shrink-0 items-center justify-center border-t border-gray-200 bg-white px-3 shadow-sm sm:h-[82px] z-10">
            <div className="flex items-center gap-2">
              {/* CHAT */}

              <StudentControlButton
                active={showChat}
                label={
                  showChat ? "Close classroom chat" : "Open classroom chat"
                }
                onClick={() => setShowChat((current) => !current)}
              >
                <MessageSquare size={19} />
              </StudentControlButton>

              {/* RAISE HAND */}

              <StudentControlButton
                active={isRaised}
                label={isRaised ? "Lower hand" : "Raise hand"}
                onClick={toggleRaiseHand}
              >
                <Hand size={19} />
              </StudentControlButton>

              <div className="mx-1 h-8 w-px bg-gray-200 sm:mx-2" />

              {/* LEAVE */}

              <button
                onClick={leaveClass}
                className="flex h-11 items-center justify-center rounded-xl bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-[0.98] sm:gap-2 sm:px-5"
              >
                <LogOut size={17} />

                <span className="hidden sm:inline">Leave class</span>
              </button>
            </div>
          </div>

          {/* =================================================
              STUDENT WHITEBOARD
          ================================================= */}

          {showWhiteboard && <Whiteboard role="STUDENT" onClose={() => {}} />}
        </section>

        {/* ===================================================
            DESKTOP CHAT
        =================================================== */}

        <aside className="hidden w-[320px] shrink-0 border-l border-gray-200 bg-white shadow-sm xl:flex xl:flex-col z-10">
          <div className="min-h-0 flex-1">
            <ClassroomChat liveClassId={liveClass?.id || ""} />
          </div>
        </aside>

        {/* ===================================================
            MOBILE / TABLET CHAT
        =================================================== */}

        {showChat && (
          <div className="absolute inset-x-0 bottom-[72px] top-0 z-40 bg-white sm:bottom-[82px] xl:hidden">
            <ClassroomChat
              liveClassId={liveClass?.id || ""}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </main>
    </div>
  );
}

/* ============================================================
   TEACHER VIDEO
============================================================ */

function StudentTeacherVideo({
  track,
  teacherName,
}: {
  track: TrackReference;
  teacherName: string;
}) {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
      <VideoTrack trackRef={track} className="h-full w-full object-cover" />

      {/* Video Overlay Info remains dark mode to contrast with video content */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/65 px-3 py-2 text-white backdrop-blur">
        <span className="text-xs font-semibold">{teacherName}</span>

        <span className="text-[11px] font-medium text-white/60">· Teacher</span>
      </div>
    </div>
  );
}

/* ============================================================
   PARTICIPANT
============================================================ */

function StudentParticipantRow({
  name,
  isTeacher,
  isLocal,
}: {
  name: string;
  isTeacher: boolean;
  isLocal: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 shadow-sm transition hover:bg-gray-50">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isTeacher ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700"
        }`}
      >
        {getInitials(name)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-gray-900">{isLocal ? "You" : name}</p>

        <p className="mt-0.5 text-[10px] font-medium text-gray-500">
          {isTeacher ? "Teacher" : "Student"}
        </p>
      </div>

      {isTeacher && (
        <span className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-600">
          HOST
        </span>
      )}
    </div>
  );
}

/* ============================================================
   CONTROL
============================================================ */

function StudentControlButton({
  children,
  active,
  label,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition active:scale-[0.96] ${
        active
          ? "border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm"
          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return "N";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}