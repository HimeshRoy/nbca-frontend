"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useClassroomEvents } from "@/components/live-classroom/use-classroom-events";
import ClassroomChat from "@/components/live-classroom/classroom-chat";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  TrackReferenceOrPlaceholder,
  VideoTrack,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";

import {
  BookOpen,
  Camera,
  CameraOff,
  Hand,
  LogOut,
  Maximize,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  MoreVertical,
  PanelRight,
  Users,
  Wifi,
} from "lucide-react";

import { Track } from "livekit-client";

import { joinLiveClassRoom } from "@/services/livekit.service";
import {
  endLiveClass,
  getLiveClassById,
  removeStudentFromLiveClass,
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
  startTime?: string;
  endTime?: string;

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

export default function TeacherClassroomPage({ params }: Props) {
  const { id } = use(params);

  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  const [liveClass, setLiveClass] = useState<LiveClassData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClassroom = async () => {
      try {
        setLoading(true);
        setError(null);

        const [roomData, classResponse] = await Promise.all([
          joinLiveClassRoom(id),
          getLiveClassById(id),
        ]);

        setToken(roomData.token);
        setServerUrl(roomData.url);

        /*
         * Handles both:
         *
         * response.data
         *
         * and
         *
         * response.data.data
         *
         * depending on your API response wrapper.
         */
        const response: any = classResponse;

        const classData = response?.data?.data ?? response?.data ?? response;

        setLiveClass(classData);
      } catch (error: any) {
        console.error("Failed to load classroom:", error);

        setError(error?.response?.data?.message || "Failed to join classroom");
      } finally {
        setLoading(false);
      }
    };

    loadClassroom();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a12] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#3949ab]" />

          <p className="text-sm text-white/60">Preparing your classroom...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a12] px-6 text-white">
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

  if (!token || !serverUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#070a12]">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect
        audio
        video
        onDisconnected={() => {
          console.log("Disconnected from classroom");
        }}
      >
        <TeacherClassroom liveClass={liveClass} />

        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

/* ============================================================
   CLASSROOM
============================================================ */

function TeacherClassroom({ liveClass }: { liveClass: LiveClassData | null }) {
  const {
    localParticipant,
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
  } = useLocalParticipant();

  const room = useRoomContext();

  const { raisedHands, clearRaisedHand } = useClassroomEvents("TEACHER");

  const participants = useParticipants();

  const cameraTracks = useTracks([
    {
      source: Track.Source.Camera,
      withPlaceholder: true,
    },
  ]);

  const screenTracks = useTracks([Track.Source.ScreenShare]);

  const [showParticipants, setShowParticipants] = useState(true);

  const [showChat, setShowChat] = useState(false);

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

  const className =
    liveClass?.class?.name ||
    liveClass?.class?.className ||
    liveClass?.class?.title ||
    "Class";

  const subjectName =
    liveClass?.subject?.name || liveClass?.subject?.title || "Subject";

  const classTitle = liveClass?.title || `${subjectName} · ${className}`;

  const toggleMicrophone = async () => {
    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  };

  const toggleCamera = async () => {
    await localParticipant.setCameraEnabled(!isCameraEnabled);
  };

  const toggleScreenShare = async () => {
    await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
  };

  const endClass = async () => {
    if (!liveClass?.id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to end this class? All classroom chat messages will be permanently cleared.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await endLiveClass(liveClass.id);

      await room.disconnect();

      window.history.back();
    } catch (error) {
      console.error("Failed to end live class:", error);

      window.alert("Failed to end the class. Please try again.");
    }
  };

  const removeStudent = async (studentId: string, studentName: string) => {
    if (!liveClass?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Remove ${studentName} from this classroom?\n\nThey will be disconnected immediately and will not be able to rejoin this class.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeStudentFromLiveClass(liveClass.id, studentId);

      window.alert(`${studentName} has been removed from the classroom.`);
    } catch (error: any) {
      console.error("Failed to remove student:", error);

      window.alert(
        error?.response?.data?.message ||
          "Failed to remove the student. Please try again.",
      );
    }
  };

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
              <h1 className="truncate text-sm font-semibold text-white">
                {classTitle}
              </h1>

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
            onClick={() => setShowParticipants(!showParticipants)}
            className={`flex h-9 items-center gap-2 rounded-lg border px-3 transition ${
              showParticipants
                ? "border-[#3949ab]/40 bg-[#3949ab]/10 text-white"
                : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06]"
            }`}
          >
            <Users size={16} />

            <span className="hidden text-xs font-medium sm:block">
              {participants.length}
            </span>
          </button>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            title="More options"
          >
            <MoreVertical size={17} />
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="flex min-h-0 flex-1">
        {/* ===================================================
            VIDEO SECTION
        =================================================== */}

        <section className="flex min-w-0 flex-1 flex-col">
          {showChat && (
            <ClassroomChat
              liveClassId={liveClass?.id || ""}
              onClose={() => setShowChat(false)}
            />
          )}
          {/* VIDEO */}

          <div className="relative min-h-0 flex-1 p-4">
            {screenTracks.length > 0 ? (
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
                <VideoTrack
                  trackRef={screenTracks[0]}
                  className="h-full w-full object-contain"
                />

                <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-xs font-medium backdrop-blur">
                  Screen sharing
                </div>
              </div>
            ) : (
              <TeacherMainVideo
                tracks={cameraTracks}
                teacherName={teacherName}
              />
            )}
          </div>

          {/* =================================================
              CONTROL BAR
          ================================================= */}

          <div className="flex h-[82px] shrink-0 items-center justify-center border-t border-white/[0.07] bg-[#0b0f19]">
            <div className="flex items-center gap-2">
              <ControlButton
                active={isMicrophoneEnabled}
                danger={!isMicrophoneEnabled}
                label={
                  isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"
                }
                onClick={toggleMicrophone}
              >
                {isMicrophoneEnabled ? <Mic size={19} /> : <MicOff size={19} />}
              </ControlButton>

              <ControlButton
                active={isCameraEnabled}
                danger={!isCameraEnabled}
                label={isCameraEnabled ? "Turn camera off" : "Turn camera on"}
                onClick={toggleCamera}
              >
                {isCameraEnabled ? (
                  <Camera size={19} />
                ) : (
                  <CameraOff size={19} />
                )}
              </ControlButton>

              <ControlButton
                active={isScreenShareEnabled}
                label={isScreenShareEnabled ? "Stop sharing" : "Share screen"}
                onClick={toggleScreenShare}
              >
                <MonitorUp size={19} />
              </ControlButton>

              <ControlButton
                active={showChat}
                label="Open chat"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare size={19} />
              </ControlButton>

              <ControlButton
                active={false}
                label="Raise hand"
                onClick={() => {}}
              >
                <Hand size={19} />
              </ControlButton>

              <div className="mx-2 h-8 w-px bg-white/[0.08]" />

              <button
                onClick={endClass}
                className="flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]"
              >
                <LogOut size={17} />

                <span className="hidden sm:inline">End class</span>
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        {Object.keys(raisedHands).length > 0 && (
          <div className="border-b border-white/[0.06] px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">✋</span>

                <h3 className="text-xs font-semibold text-white">
                  Raised hands
                </h3>
              </div>

              <span className="rounded-full bg-[#4655d6]/15 px-2 py-0.5 text-[10px] font-semibold text-[#9da7ff]">
                {Object.keys(raisedHands).length}
              </span>
            </div>

            <div className="space-y-2">
              {Object.values(raisedHands).map((hand) => (
                <div
                  key={hand.identity}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4655d6]/15 text-sm">
                    ✋
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white">
                      {hand.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/35">
                      {hand.role === "STUDENT" ? "Student" : "Teacher"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => clearRaisedHand(hand.identity)}
                    className="shrink-0 rounded-lg border border-white/[0.07] px-2 py-1.5 text-[10px] font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    Clear
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showParticipants && (
          <aside className="hidden w-[300px] shrink-0 border-l border-white/[0.07] bg-[#0b0f19] lg:flex lg:flex-col">
            <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-white/[0.07] px-4">
              <div>
                <p className="text-sm font-semibold">Participants</p>

                <p className="mt-0.5 text-[11px] text-white/35">
                  {participants.length} in classroom
                </p>
              </div>

              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.05] hover:text-white"
                title="Close participants"
                onClick={() => setShowParticipants(false)}
              >
                <PanelRight size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {participants.map((participant) => {
                  const isTeacher =
                    participant.identity === localParticipant.identity;

                  return (
                    <ParticipantRow
                      key={participant.sid}
                      participant={participant}
                      name={
                        isTeacher
                          ? teacherName
                          : participant.name || participant.identity
                      }
                      isTeacher={isTeacher}
                      onRemove={
                        isTeacher
                          ? undefined
                          : () =>
                              removeStudent(
                                participant.identity,
                                participant.name || participant.identity,
                              )
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
   MAIN TEACHER VIDEO
============================================================ */

function TeacherMainVideo({
  tracks,
  teacherName,
}: {
  tracks: TrackReferenceOrPlaceholder[];
  teacherName: string;
}) {
  const cameraTrack = tracks.find(
    (track) =>
      track.participant.isLocal && track.source === Track.Source.Camera,
  );

  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#05070c]">
      {cameraTrack?.publication?.isSubscribed ? (
        <VideoTrack
          trackRef={cameraTrack as any}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#3949ab] text-3xl font-semibold">
              {getInitials(teacherName)}
            </div>

            <p className="mt-4 text-sm font-medium text-white/80">
              {teacherName}
            </p>

            <p className="mt-1 text-xs text-white/35">Camera is off</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/65 px-3 py-2 backdrop-blur">
        <span className="text-xs font-medium">{teacherName}</span>

        <span className="text-[11px] text-white/40">· Teacher</span>
      </div>
    </div>
  );
}

/* ============================================================
   PARTICIPANT ROW
============================================================ */

function ParticipantRow({
  participant,
  name,
  isTeacher,
  onRemove,
}: {
  participant: any;
  name: string;
  isTeacher: boolean;
  onRemove?: () => void;
}) {
  const hasAudio = participant.isSpeaking;

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 transition hover:bg-white/[0.045]">
      <div
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isTeacher ? "bg-[#3949ab]" : "bg-white/10"
        }`}
      >
        {getInitials(name)}

        {hasAudio && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b0f19] bg-emerald-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-white">{name}</p>

        <p className="mt-0.5 text-[10px] text-white/35">
          {isTeacher ? "Teacher" : "Student"}
        </p>
      </div>

      {isTeacher ? (
        <span className="rounded-md bg-[#3949ab]/10 px-2 py-1 text-[9px] font-medium text-[#9da7ff]">
          HOST
        </span>
      ) : (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg border border-red-500/10 bg-red-500/[0.05] px-2 py-1.5 text-[10px] font-medium text-red-400 opacity-0 transition hover:border-red-500/20 hover:bg-red-500/10 group-hover:opacity-100"
          title={`Remove ${name}`}
        >
          Remove
        </button>
      )}
    </div>
  );
}

/* ============================================================
   CONTROL BUTTON
============================================================ */

function ControlButton({
  children,
  active,
  danger,
  label,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  danger?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition active:scale-[0.96] ${
        danger
          ? "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15"
          : active
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
