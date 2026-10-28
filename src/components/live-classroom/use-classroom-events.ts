"use client";

import { useCallback, useState } from "react";
import { useDataChannel, useLocalParticipant } from "@livekit/components-react";

type ClassroomRole = "TEACHER" | "STUDENT";

type RaiseHandEvent = {
  type: "raise-hand" | "lower-hand" | "clear-hand";
  identity: string;
  name: string;
  role: ClassroomRole;
  timestamp: number;
  targetIdentity?: string;
};

type RaisedHand = {
  identity: string;
  name: string;
  role: ClassroomRole;
  raised: boolean;
  timestamp: number;
};

const RAISE_HAND_TOPIC = "nbca:raise-hand";

export const useClassroomEvents = (role: ClassroomRole) => {
  const { localParticipant } = useLocalParticipant();

  const [raisedHands, setRaisedHands] = useState<Record<string, RaisedHand>>(
    {},
  );

  const handleMessage = useCallback((message: any) => {
    try {
      const decoder = new TextDecoder();

      const data = JSON.parse(
        decoder.decode(message.payload),
      ) as RaiseHandEvent;

      if (
        data.type !== "raise-hand" &&
        data.type !== "lower-hand" &&
        data.type !== "clear-hand"
      ) {
        return;
      }

      setRaisedHands((current) => {
        const next = { ...current };

        if (data.type === "raise-hand") {
          next[data.identity] = {
            identity: data.identity,
            name: data.name,
            role: data.role,
            raised: true,
            timestamp: data.timestamp,
          };

          return next;
        }

        const identityToRemove = data.targetIdentity || data.identity;

        delete next[identityToRemove];

        return next;
      });
    } catch (error) {
      console.error("Failed to process classroom event:", error);
    }
  }, []);

  const { send } = useDataChannel(RAISE_HAND_TOPIC, handleMessage);

  const localIdentity = localParticipant.identity;

  const isRaised = Boolean(raisedHands[localIdentity]);

  const publishEvent = async (event: RaiseHandEvent) => {
    const encoder = new TextEncoder();

    await send(encoder.encode(JSON.stringify(event)), {
      topic: RAISE_HAND_TOPIC,
    });
  };

  const toggleRaiseHand = async () => {
    const timestamp = Date.now();

    if (isRaised) {
      const event: RaiseHandEvent = {
        type: "lower-hand",
        identity: localIdentity,
        name: localParticipant.name || localIdentity,
        role,
        timestamp,
      };

      await publishEvent(event);

      setRaisedHands((current) => {
        const next = { ...current };

        delete next[localIdentity];

        return next;
      });

      return;
    }

    const event: RaiseHandEvent = {
      type: "raise-hand",
      identity: localIdentity,
      name: localParticipant.name || localIdentity,
      role,
      timestamp,
    };

    await publishEvent(event);

    setRaisedHands((current) => ({
      ...current,
      [localIdentity]: {
        identity: localIdentity,
        name: localParticipant.name || localIdentity,
        role,
        raised: true,
        timestamp,
      },
    }));
  };

  const clearRaisedHand = async (identity: string) => {
    if (role !== "TEACHER") {
      return;
    }

    const target = raisedHands[identity];

    if (!target) {
      return;
    }

    const event: RaiseHandEvent = {
      type: "clear-hand",
      identity: localIdentity,
      name: localParticipant.name || localIdentity,
      role,
      targetIdentity: identity,
      timestamp: Date.now(),
    };

    await publishEvent(event);

    setRaisedHands((current) => {
      const next = { ...current };

      delete next[identity];

      return next;
    });
  };

  return {
    raisedHands,
    isRaised,
    toggleRaiseHand,
    clearRaisedHand,
  };
};
