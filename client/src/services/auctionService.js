 import axios from "../utils/axiosInstance";

export const auctionService = {
  getAll: () => axios.get("/auctions"),
  getById: (id) => axios.get(`/auctions/${id}`),
  create: (data) => axios.post("/auctions/create", data),
  bid: (id, amount) => axios.post(`/auctions/${id}/bid`, { amount }),
  // Add more as needed
};
