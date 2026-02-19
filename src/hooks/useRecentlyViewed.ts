import { useCallback } from "react";

const STORAGE_KEY = "uni10_recently_viewed";
const MAX_ITEMS = 12;

export type RecentlyViewedItem = {
  id: string;
  slug?: string;
};

function getStored(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStored(items: RecentlyViewedItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // ignore
  }
}

export function useRecentlyViewed() {
  const add = useCallback((item: RecentlyViewedItem) => {
    if (!item?.id) return;
    const list = getStored();
    const filtered = list.filter(
      (x) => String(x.id) !== String(item.id)
    );
    const next = [{ id: item.id, slug: item.slug }, ...filtered];
    setStored(next);
  }, []);

  const getList = useCallback((): RecentlyViewedItem[] => {
    return getStored();
  }, []);

  return { add, getList };
}
