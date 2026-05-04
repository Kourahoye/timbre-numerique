// src/notifications/useNotifications.ts
import { gql } from "@apollo/client";
import { useAuth } from "../auth";
import { useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client/react";

type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type NotificationsData = {
  notifications: Notification[];
};

const NOTIFICATIONS_QUERY = gql`
  query Notifications {
    notifications {
      id
      content
      read
      createdAt
    }
  }
`;

export const useNotifications = () => {
  const { me } = useAuth();

  const { data, loading, startPolling, stopPolling } = useQuery<NotificationsData>(
    NOTIFICATIONS_QUERY,
    {
      fetchPolicy: "cache-and-network",  // ✅ cache + diff
      pollInterval: 0,
      skip: !me,                         // ✅ skip si non connecté
    }
  );
    // ✅ ralentit si inactif depuis 5min
  

  useEffect(() => {
  let idleTimer: ReturnType<typeof setTimeout>;
  let isIdle = false;

  const ACTIVE_INTERVAL = 30_000;
  const IDLE_INTERVAL = 120_000;

  const goIdle = () => {
    if (document.hidden) return; // ❗ ne relance pas si onglet caché
    isIdle = true;
    startPolling(IDLE_INTERVAL);
  };

  const goActive = () => {
    if (document.hidden) return; // ❗ ignore si onglet caché
    isIdle = false;
    startPolling(ACTIVE_INTERVAL);

    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, 5 * 60 * 1000);
  };

  const handleVisibility = () => {
    if (document.hidden) {
      stopPolling();
    } else {
      // reprend selon état idle ou actif
      startPolling(isIdle ? IDLE_INTERVAL : ACTIVE_INTERVAL);

      clearTimeout(idleTimer);
      idleTimer = setTimeout(goIdle, 5 * 60 * 1000);
    }
  };

  // listeners
  document.addEventListener("mousemove", goActive);
  document.addEventListener("keydown", goActive);
  document.addEventListener("visibilitychange", handleVisibility);

  // init
  idleTimer = setTimeout(goIdle, 5 * 60 * 1000);

  return () => {
    document.removeEventListener("mousemove", goActive);
    document.removeEventListener("keydown", goActive);
    document.removeEventListener("visibilitychange", handleVisibility);
    clearTimeout(idleTimer);
  };
}, [startPolling, stopPolling]);

  const notifications = data?.notifications ?? [];

  // ✅ mémoïsé
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return { notifications, unreadCount, loading };
};