import { useEffect, useState, useCallback } from "react";
import { fetchR2List } from "../utils/api";

export default function useR2List(prefix = "") {
  const [items, setItems] = useState([]);
  const [folders, setFolders] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = useCallback(async (reset = true) => {
    setLoading(true); setErr(null);
    try {
      const res = await fetchR2List({ prefix, cursor: reset ? null : cursor, limit: 1000, delimiter: "/" });
      if (reset) {
        setItems(res.objects || []);
        setFolders(res.folders || []);
      } else {
        setItems((xs) => [...xs, ...(res.objects || [])]);
        setFolders((fs) => [...fs, ...(res.folders || [])]);
      }
      setCursor(res.cursor || null);
    } catch (e) {
      setErr(e);
    } finally { setLoading(false); }
  }, [prefix, cursor]);

  useEffect(() => { load(true); }, [prefix, load]);

  return { items, folders, cursor, loading, error: err, loadMore: () => load(false), reload: () => load(true) };
}
