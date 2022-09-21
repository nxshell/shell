import axios from "./axios";

function getContributers() {
    return axios.get("contributers");
}

export default {
    getContributers
}