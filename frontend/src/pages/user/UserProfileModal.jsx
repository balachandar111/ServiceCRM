import React, { useEffect, useState } from "react";



// Reusable popup to view a user's profile.
// Pass either a full `user` object you already have, or a `userId`
// to fetch the latest profile from the server.
const UserProfileModal = ({ user, userId, close }) => {
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(user);
      return;
    }

    if (userId) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          const { data } = await API.get(`/users/${userId}`);
          setProfile(data.data || null);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userId]);

  return (
    <div className="modal-overlay" onClick={close}>
      <div
        className="profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>User Profile</h2>
          <button className="close-btn" onClick={close}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="profile-loading">Loading...</div>
        ) : !profile ? (
          <div className="profile-loading">Profile not found</div>
        ) : (
          <div className="profile-body">
            <div className="profile-avatar">
              {(profile.name || "?").charAt(0).toUpperCase()}
            </div>

            <h3 className="profile-name">{profile.name || "—"}</h3>

            <span
              className={
                profile.loginStatus === "Active"
                  ? "active-badge"
                  : "inactive-badge"
              }
            >
              {profile.loginStatus || "—"}
            </span>

            <div className="profile-grid">
              <div>
                <label>Username</label>
                <p>{profile.username || "—"}</p>
              </div>

              <div>
                <label>Role</label>
                <p>{profile.role || "—"}</p>
              </div>

              {profile.organization && (
                <div>
                  <label>Organization</label>
                  <p>
                    {profile.organization?.organizationName ||
                      profile.organization}
                  </p>
                </div>
              )}

              {profile.createdBy && (
                <div>
                  <label>Created By</label>
                  <p>
                    {profile.createdBy?.name ||
                      profile.createdBy?.username ||
                      "—"}
                  </p>
                </div>
              )}

              <div>
                <label>Joined On</label>
                <p>
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;