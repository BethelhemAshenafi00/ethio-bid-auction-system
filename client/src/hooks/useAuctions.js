import { useState, useEffect, useCallback } from "react";
import { auctionService } from "../services/auctionService";

export const useAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    auctionService.getAll()
      .then((res) => setAuctions(res.data.data || res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refetch = useCallback(() => {
    setLoading(true);
    auctionService.getAll()
      .then((res) => setAuctions(res.data.data || res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { auctions, loading, error, refetch };

};
