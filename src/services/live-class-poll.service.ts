import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

/* ============================================================
   AUTH HEADERS
============================================================ */

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

/* ============================================================
   TYPES
============================================================ */

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type LiveClassPoll = {
  id: string;
  liveClassId: string;
  question: string;
  options: PollOption[];

  /*
   * Teacher receives this.
   * Students receive it only after
   * the poll is closed.
   */
  correctOptionId?: string;

  isActive: boolean;

  createdAt: number;

  closedAt?: number;

  /*
   * Used by students to remember
   * whether they already voted.
   */
  hasVoted?: boolean;
};

/* ============================================================
   GET CURRENT POLL
============================================================ */

export const getLiveClassPoll = async (
  liveClassId: string,
): Promise<LiveClassPoll | null> => {
  const response = await api.get(
    `/live-class/poll/${liveClassId}`,
    getHeaders(),
  );

  return response.data.data ?? null;
};

/* ============================================================
   CREATE POLL
============================================================ */

export const createLiveClassPoll = async (
  liveClassId: string,
  data: {
    question: string;
    options: string[];

    /*
     * Index of the correct option.
     *
     * Example:
     *
     * options = [
     *   "Lotus",     // 0
     *   "Marigold",  // 1
     *   "Rose",      // 2
     * ]
     *
     * correctOptionIndex = 0
     */
    correctOptionIndex: number;
  },
): Promise<LiveClassPoll> => {
  const response = await api.post(
    `/live-class/poll/${liveClassId}`,
    data,
    getHeaders(),
  );

  return response.data.data;
};

/* ============================================================
   VOTE
============================================================ */

export const voteLiveClassPoll = async (
  liveClassId: string,
  optionId: string,
): Promise<LiveClassPoll> => {
  const response = await api.post(
    `/live-class/poll/${liveClassId}/vote`,
    {
      optionId,
    },
    getHeaders(),
  );

  return response.data.data;
};

/* ============================================================
   CLOSE POLL
============================================================ */

export const closeLiveClassPoll = async (
  liveClassId: string,
): Promise<LiveClassPoll> => {
  const response = await api.post(
    `/live-class/poll/${liveClassId}/close`,
    {},
    getHeaders(),
  );

  return response.data.data;
};