"use client";

import { use, useEffect, useMemo, useState } from "react";

import { useClassroomEvents } from "@/components/live-classroom/use-classroom-events";
import ClassroomChat from "@/components/live-classroom/classroom-chat";
import { markLiveClassLeave } from "@/services/attendance.service";
import Whiteboard from "@/components/live-classroom/whiteboard";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useLocalParticipant,
  useParticipants,
  useTracks,
  useRoomContext,
  type TrackReference,
} from "@livekit/components-react";

import {
  BookOpen,
  Hand,
  LogOut,
  MessageSquare,
  PanelRight,
  Users,
  Wifi,
} from "lucide-react";

import { Track } from "livekit-client";

import { joinLiveClassRoom } from "@/services/livekit.service";
import { getStudentLiveClasses } from "@/services/live-class.service";
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
  description?: string;

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

        const [roomData, classesResponse] = await Promise.all([
          joinLiveClassRoom(id),
          getStudentLiveClasses(),
        ]);

        setToken(roomData.token);
        setServerUrl(roomData.url);

        const response: any = classesResponse;

        const classes = response?.data?.data ?? response?.data ?? response;

        if (Array.isArray(classes)) {
          const currentClass = classes.find(
            (item: LiveClassData) => item.id === id,
          );

          if (currentClass) {
            setLiveClass(currentClass);
          }
        }
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070a12] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#3949ab]" />

          <p className="text-sm text-white/50">Preparing your classroom...</p>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070a12] px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d111c] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <Wifi size={22} />
          </div>

          <h1 className="text-lg font-semibold">Unable to join classroom</h1>

          <p className="mt-2 text-sm leading-6 text-white/50">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[#3949ab] px-5 py-2.5 text-sm font-medium transition hover:bg-[#303f9f]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (removed) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070a12] px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0d111c] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
            <LogOut size={24} className="text-red-400" />
          </div>

          <h1 className="mt-5 text-xl font-semibold">Removed from classroom</h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/50">
            You have been removed from this classroom by the teacher. You can no
            longer rejoin this class.
          </p>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="mt-7 rounded-xl bg-[#3949ab] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#303f9f] active:scale-[0.98]"
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
    <div className="fixed inset-0 z-[9999] bg-[#070a12]">
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

        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

/* ============================================================
   STUDENT CLASSROOM
============================================================ */

function StudentClassroom({ liveClass }: { liveClass: LiveClassData | null }) {
  const { localParticipant } = useLocalParticipant();

  const room = useRoomContext();

  const { isRaised, toggleRaiseHand } = useClassroomEvents("STUDENT");

  const participants = useParticipants();

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

  const [showParticipants, setShowParticipants] = useState(true);

  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
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
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#070a12] text-white">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0b0f19] px-5">
        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3949ab]">
            <BookOpen size={18} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-semibold">{classTitle}</h1>

              <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />

              <span className="hidden text-xs text-white/40 sm:block">
                {className}
              </span>
            </div>

            <p className="mt-0.5 truncate text-xs text-white/40">
              {subjectName}
              {" · "}
              {teacherName}
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-2 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

            <span className="text-xs font-medium text-emerald-300">Live</span>
          </div>

          <button
            onClick={() => setShowParticipants((current) => !current)}
            className={`flex h-9 items-center gap-2 rounded-lg border px-3 transition ${
              showParticipants
                ? "border-[#3949ab]/40 bg-[#3949ab]/10 text-white"
                : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06]"
            }`}
            aria-label="Toggle participants"
            title="Toggle participants"
          >
            <Users size={16} />

            <span className="hidden text-xs font-medium sm:block">
              {participants.length}
            </span>
          </button>
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
          <div className="relative min-h-0 flex-1 p-4">
            {/* =================================================
                SCREEN SHARE
            ================================================= */}

            {activeScreenShare ? (
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
                <VideoTrack
                  trackRef={activeScreenShare}
                  className="h-full w-full object-contain"
                />

                <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-xs font-medium backdrop-blur">
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

              <div className="relative flex h-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#05070c]">
                <div className="flex flex-col items-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#3949ab] text-3xl font-semibold">
                    {getInitials(teacherName)}
                  </div>

                  <p className="mt-4 text-sm font-medium">{teacherName}</p>

                  <p className="mt-1 text-xs text-white/35">
                    Waiting for teacher video
                  </p>
                </div>
              </div>
            )}
          </div>

          {showChat && (
            <ClassroomChat
              liveClassId={liveClass?.id || ""}
              onClose={() => setShowChat(false)}
            />
          )}

          {/* =================================================
              STUDENT CONTROLS
          ================================================= */}

          <div className="flex h-[82px] shrink-0 items-center justify-center border-t border-white/[0.07] bg-[#0b0f19]">
            <div className="flex items-center gap-2">
              {/* CHAT */}

              <StudentControlButton
                active={showChat}
                label="Open classroom chat"
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

              <StudentControlButton
                active={showWhiteboard}
                label="Open whiteboard"
                onClick={() => setShowWhiteboard((current) => !current)}
              >
                <BookOpen size={19} />
              </StudentControlButton>

              <div className="mx-2 h-8 w-px bg-white/[0.08]" />

              {/* LEAVE */}

              <button
                onClick={leaveClass}
                className="flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]"
              >
                <LogOut size={17} />

                <span className="hidden sm:inline">Leave class</span>
              </button>
            </div>
          </div>
          {showWhiteboard && (
            <Whiteboard
              role="STUDENT"
              onClose={() => setShowWhiteboard(false)}
            />
          )}
        </section>

        {/* ===================================================
            PARTICIPANTS
        =================================================== */}

        {showParticipants && (
          <aside className="hidden w-[300px] shrink-0 border-l border-white/[0.07] bg-[#0b0f19] lg:flex lg:flex-col">
            {/* HEADER */}

            <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-white/[0.07] px-4">
              <div>
                <p className="text-sm font-semibold">Participants</p>

                <p className="mt-0.5 text-[11px] text-white/35">
                  {participants.length} in classroom
                </p>
              </div>

              <button
                onClick={() => setShowParticipants(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.05] hover:text-white"
                title="Close participants"
                aria-label="Close participants"
              >
                <PanelRight size={16} />
              </button>
            </div>

            {/* LIST */}

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {participants.map((participant) => {
                  const isTeacher =
                    participant.identity !== localParticipant.identity;

                  const name = isTeacher ? teacherName : "You";

                  return (
                    <StudentParticipantRow
                      key={participant.sid}
                      name={name}
                      isTeacher={isTeacher}
                      isLocal={
                        participant.identity === localParticipant.identity
                      }
                    />
                  );
                })}
              </div>
            </div>
          </aside>
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
    <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
      <VideoTrack trackRef={track} className="h-full w-full object-cover" />

      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/65 px-3 py-2 backdrop-blur">
        <span className="text-xs font-medium">{teacherName}</span>

        <span className="text-[11px] text-white/40">· Teacher</span>
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
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 transition hover:bg-white/[0.045]">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isTeacher ? "bg-[#3949ab]" : "bg-white/10"
        }`}
      >
        {getInitials(name)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{isLocal ? "You" : name}</p>

        <p className="mt-0.5 text-[10px] text-white/35">
          {isTeacher ? "Teacher" : "Student"}
        </p>
      </div>

      {isTeacher && (
        <span className="rounded-md bg-[#3949ab]/10 px-2 py-1 text-[9px] font-medium text-[#9da7ff]">
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
          ? "border-[#3949ab]/40 bg-[#3949ab]/15 text-[#aab2ff]"
          : "border-white/[0.08] bg-white/[0.04] text-white/65 hover:bg-white/[0.08] hover:text-white"
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
