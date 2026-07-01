import axios from "axios";

const api = axios.create({
  baseURL: "https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1",
  withCredentials: true,
});

export default api;
