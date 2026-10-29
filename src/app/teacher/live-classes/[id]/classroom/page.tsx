"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useClassroomEvents } from "@/components/live-classroom/use-classroom-events";
import ClassroomChat from "@/components/live-classroom/classroom-chat";
import Whiteboard from "@/components/live-classroom/whiteboard";
import ClassroomPoll from "@/components/live-classroom/classroom-poll";

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
  BarChart3,
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
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] text-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />

          <p className="text-sm font-medium text-gray-500">
            Preparing your classroom...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-6 text-gray-900">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Wifi size={24} />
          </div>

          <h1 className="text-xl font-bold text-gray-900">
            Unable to join classroom
          </h1>

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

  if (!token || !serverUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8F9FA]">
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

const WHITEBOARD_CONTROL_TOPIC = "nbca-whiteboard-control";

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

  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const [showPoll, setShowPoll] = useState(false);

  useEffect(() => {
    const sendWhiteboardVisibility = async () => {
      try {
        if (room.state !== "connected") {
          return;
        }

        const payload = new TextEncoder().encode(
          JSON.stringify({
            type: showWhiteboard ? "open" : "close",
          }),
        );

        await room.localParticipant.publishData(payload, {
          reliable: true,
          topic: WHITEBOARD_CONTROL_TOPIC,
        });
      } catch (error) {
        console.error("Failed to sync whiteboard visibility:", error);
      }
    };

    void sendWhiteboardVisibility();
  }, [room, showWhiteboard]);

  useEffect(() => {
    const handleParticipantConnected = () => {
      const sendCurrentWhiteboardState = async () => {
        try {
          if (room.state !== "connected") {
            return;
          }

          const payload = new TextEncoder().encode(
            JSON.stringify({
              type: showWhiteboard ? "open" : "close",
            }),
          );

          await room.localParticipant.publishData(payload, {
            reliable: true,
            topic: WHITEBOARD_CONTROL_TOPIC,
          });
        } catch (error) {
          console.error("Failed to sync whiteboard state:", error);
        }
      };

      void sendCurrentWhiteboardState();
    };

    room.on("participantConnected", handleParticipantConnected);

    return () => {
      room.off("participantConnected", handleParticipantConnected);
    };
  }, [room, showWhiteboard]);

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
              <h1 className="truncate text-sm font-bold text-gray-900">
                {classTitle}
              </h1>

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

          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`flex h-10 items-center gap-2 rounded-xl border px-3 transition shadow-sm ${
              showParticipants
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            <Users size={18} />

            <span className="hidden text-xs font-bold sm:block">
              {participants.length}
            </span>
          </button>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
            title="More options"
          >
            <MoreVertical size={18} />
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

        <section className="relative flex min-w-0 flex-1 flex-col">
          {showChat && (
            <ClassroomChat
              liveClassId={liveClass?.id || ""}
              onClose={() => setShowChat(false)}
            />
          )}
          {/* VIDEO */}

          <div className="relative min-h-0 flex-1 p-3 sm:p-4">
            {screenTracks.length > 0 ? (
              <div className="relative h-full overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 bg-black shadow-sm">
                <VideoTrack
                  trackRef={screenTracks[0]}
                  className="h-full w-full object-contain"
                />

                <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-xs font-medium text-white backdrop-blur">
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

          <div className="flex h-[72px] shrink-0 items-center justify-center border-t border-gray-200 bg-white px-3 shadow-sm sm:h-[82px] z-10">
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

              <ControlButton
                active={showWhiteboard}
                label={showWhiteboard ? "Close whiteboard" : "Open whiteboard"}
                onClick={() => setShowWhiteboard((current) => !current)}
              >
                <BookOpen size={19} />
              </ControlButton>

              <ControlButton
                active={showPoll}
                label={showPoll ? "Close poll" : "Create poll"}
                onClick={() => setShowPoll((current) => !current)}
              >
                <BarChart3 size={19} />
              </ControlButton>

              <div className="mx-1 h-8 w-px bg-gray-200 sm:mx-2" />

              <button
                onClick={endClass}
                className="flex h-11 items-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-[0.98] sm:px-5 shadow-sm"
              >
                <LogOut size={17} />

                <span className="hidden sm:inline">End class</span>
              </button>
            </div>
          </div>
        </section>

        {showWhiteboard && (
          <Whiteboard role="TEACHER" onClose={() => setShowWhiteboard(false)} />
        )}

        {showPoll && liveClass?.id && (
          <ClassroomPoll liveClassId={liveClass.id} role="TEACHER" />
        )}

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        {showParticipants && (
          <aside className="hidden w-[320px] shrink-0 border-l border-gray-200 bg-white shadow-sm lg:flex lg:flex-col z-10">
            <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-gray-200 px-5">
              <div>
                <p className="text-sm font-bold text-gray-900">Participants</p>

                <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                  {participants.length} in classroom
                </p>
              </div>

              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                title="Close participants"
                onClick={() => setShowParticipants(false)}
              >
                <PanelRight size={18} />
              </button>
            </div>

            {/* RAISED HANDS PANEL */}
            {Object.keys(raisedHands).length > 0 && (
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✋</span>

                    <h3 className="text-xs font-bold text-gray-900">
                      Raised hands
                    </h3>
                  </div>

                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    {Object.keys(raisedHands).length}
                  </span>
                </div>

                <div className="space-y-2">
                  {Object.values(raisedHands).map((hand) => (
                    <div
                      key={hand.identity}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm">
                        ✋
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-gray-900">
                          {hand.name}
                        </p>

                        <p className="mt-0.5 text-[10px] font-medium text-gray-500">
                          {hand.role === "STUDENT" ? "Student" : "Teacher"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => clearRaisedHand(hand.identity)}
                        className="shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[10px] font-bold text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
                      >
                        Clear
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
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
    <div className="relative h-full overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 bg-[#111827] shadow-sm">
      {cameraTrack?.publication?.isSubscribed ? (
        <VideoTrack
          trackRef={cameraTrack as any}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-white text-3xl font-bold shadow-lg">
              {getInitials(teacherName)}
            </div>

            <p className="mt-5 text-sm font-bold text-white">{teacherName}</p>

            <p className="mt-1.5 text-xs font-medium text-gray-400">
              Camera is off
            </p>
          </div>
        </div>
      )}

      {/* Keeps a dark overlay to maintain contrast with the video feed */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/65 px-3 py-2 backdrop-blur">
        <span className="text-xs font-semibold text-white">{teacherName}</span>

        <span className="text-[11px] font-medium text-white/60">· Teacher</span>
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
    <div className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 shadow-sm transition hover:bg-gray-50 hover:border-gray-200">
      <div
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isTeacher
            ? "bg-indigo-100 text-indigo-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {getInitials(name)}

        {hasAudio && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-gray-900">{name}</p>

        <p className="mt-0.5 text-[10px] font-medium text-gray-500">
          {isTeacher ? "Teacher" : "Student"}
        </p>
      </div>

      {isTeacher ? (
        <span className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-600">
          HOST
        </span>
      ) : (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-[10px] font-bold text-red-600 opacity-0 transition hover:border-red-200 hover:bg-red-100 group-hover:opacity-100"
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
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 shadow-sm"
          : active
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
