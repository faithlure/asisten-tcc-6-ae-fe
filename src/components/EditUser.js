import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../utils";
import { jwtDecode } from "jwt-decode";

const EditUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const [token, setToken] = useState('');
  const [expire, setExpire] = useState('');
  
  useEffect(() => {
    refreshToken();
    getUserById();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/token`, { withCredentials: true });
      const decoded = jwtDecode(response.data.accessToken);
      setToken(response.data.accessToken);
      setExpire(decoded.exp);
      
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

const axiosJWT = axios.create();

axiosJWT.interceptors.request.use(async (config) => {
    const currentDate = new Date();
    if (expire * 1000 < currentDate.getTime()) {
        const response = await axios.get(`${BASE_URL}/token`);
        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        setToken(response.data.accessToken);
        const decoded = jwtDecode(response.data.accessToken);
        setName(decoded.name);
        setExpire(decoded.exp);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

  const updateUser = async (e) => {
    e.preventDefault();
    try {
     
      await axiosJWT.put(`${BASE_URL}/edit-user/${id}`, 
      {
        name,
        email,
        gender,
      },{
        headers: {
          Authorization: `Bearer ${token}`}
        });
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  const getUserById = async () => {
    const response = await axiosJWT.get(`${BASE_URL}/users/${id}`,{
      headers: {
        Authorization: `Bearer ${token}`}
      });
    setName(response.data.name);
    setEmail(response.data.email);
    setGender(response.data.gender);
  };

  return (
    <div className="columns mt-5 is-centered">
      <div className="column is-half">
        <form onSubmit={updateUser}>
          <div className="field">
            <label className="label">Name</label>
            <div className="control">
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
              />
            </div>
          </div>
          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input
                type="text"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
          </div>
          <div className="field">
            <label className="label">Gender</label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>
          <div className="field">
          <button
            type="submit"
            className="button is-success"

          >
            Update
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
