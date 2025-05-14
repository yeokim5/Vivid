import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/Profile.css";

const Profile: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1>Your Profile</h1>
          {user.profilePicture && (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="profile-image"
            />
          )}
        </div>

        <div className="profile-details">
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>

          <div className="profile-actions">
            <button className="logout-btn" onClick={() => logout()}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
