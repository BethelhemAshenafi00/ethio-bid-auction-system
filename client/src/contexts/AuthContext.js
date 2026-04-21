import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export { AuthProvider };

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load sessions from localStorage
    const savedSessions = localStorage.getItem('authSessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }

    // Set current from localStorage
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      setCurrentUser({ token, role, name: localStorage.getItem('userName') || 'User' });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Save sessions to localStorage
    localStorage.setItem('authSessions', JSON.stringify(sessions));
  }, [sessions]);

  const login = (token, user) => {
    // Check if different session
    const existingUser = currentUser;
    if (existingUser && existingUser.role !== user.role) {
      if (window.confirm(`Already logged in as ${existingUser.role}. Login as ${user.role} (current session will be overwritten)?`)) {
        // Proceed
      } else {
        return false;
      }
    }

    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userName', user.name || user.email);

    // Add/update session
    const newSession = { id: Date.now(), token, ...user };
    setSessions(prev => {
      const updated = prev.filter(s => s.role !== user.role);
      return [newSession, ...updated].slice(0, 5); // Keep top 5
    });

    setCurrentUser(newSession);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setCurrentUser(null);
  };

  const switchSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      localStorage.setItem('token', session.token);
      localStorage.setItem('userRole', session.role);
      localStorage.setItem('userName', session.name);
      setCurrentUser(session);
    }
  };

  const deleteSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentUser?.id === sessionId) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, sessions, login, logout, switchSession, deleteSession, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

