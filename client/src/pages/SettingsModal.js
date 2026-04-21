import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) fetchProfile();
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/users/profile');
      setUser({ name: res.data.name, email: res.data.email });
    } catch (err) {
      console.error('Profile fetch failed');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/users/profile', user);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Update failed');
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return alert('Password must be at least 6 characters');
    setLoading(true);
    try {
      await axios.put('/users/change-password', { oldPassword, newPassword });
      alert('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.msg || 'Password change failed');
    }
    setLoading(false);
  };

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '20px auto', background: 'white', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', position: 'relative' }}>
      <>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Edit Profile */}
        <form onSubmit={handleProfileUpdate} className="settings-form">
          <h3>Edit Profile</h3>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordChange} className="settings-form">
          <h3>Change Password</h3>
          <div className="form-group">
            <label>Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Changing...' : 'Update Password'}
          </button>
        </form>

        {/* Logout */}
        <div className="logout-section">
          <button onClick={handleLogout} className="btn-danger full-width">
            Logout
          </button>
        </div>
      </>
    </div>
  );
};

export default SettingsModal;
