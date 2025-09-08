import { useCallback, useEffect, useRef } from "react";

// Constants for scroll behavior
const SCROLL_THRESHOLD = 100;
const SCROLL_TIMEOUT = 150;

/**
 * Custom hook for auto-scroll behavior in chat components
 * @param messagesCount - Total number of messages to track changes
 * @returns Object with chatContainerRef and handleScroll function
 */
export function useAutoScroll(messagesCount: number) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousMessagesCountRef = useRef(0);

  // Function to check if user is near bottom of chat
  const isNearBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) {
      return true;
    }
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
  }, []);

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (container && !isUserScrollingRef.current) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, []);

  // Handle user scroll events
  const handleScroll = useCallback(() => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, SCROLL_TIMEOUT);
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messagesCount > previousMessagesCountRef.current && isNearBottom()) {
      scrollToBottom();
    }
    previousMessagesCountRef.current = messagesCount;
  }, [messagesCount, isNearBottom, scrollToBottom]);

  // Auto-scroll on initial load
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return { chatContainerRef, handleScroll };
}
