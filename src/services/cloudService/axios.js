import axios from "axios";

const axiosInstance = axios.create({
    baseURL: powertools.getWebLink(),
    // withCredentials: true
});

export default axiosInstance;