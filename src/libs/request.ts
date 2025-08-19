import axios from "axios";

const request = axios.create({
  baseURL: "/api", // 统一前缀
  timeout: 10000,  // 超时时间
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可以在这里加 token 等
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (!res.success) {
      return Promise.reject(new Error(res.message || "请求失败"));
    }
    return res;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

export default request;