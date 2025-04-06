import axios from "axios";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const createUser = async (data) => {
    const response = await axios.post('/users/create', data);
    return response.data;
};

const getUsers = async () => {
    const response = await axios.get('/users/getUsers');
    return response.data;
};

const getUser = async () => {
    const response = await axios.get('/users/getUser');
    return response.data;
};

const editUser = async (data) => {
    const response = await axios.put('/users/modify', data);
    return response.data;
};

const login = async (data) => {
    const response = await axios.post('/users/Login', data);
    return response.data;
};

const logout = async () => {
    const response = await axios.post('/users/Logout');
    return response.data;
};

export { createUser, getUsers, getUser, editUser, login, logout };
