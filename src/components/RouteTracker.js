// components/RouteTracker.js
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'recent_activity';
const MAX_ENTRIES = 10;

const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const timestamp = new Date().toISOString();

    const stored = localStorage.getItem(STORAGE_KEY);
    let activities = stored ? JSON.parse(stored) : [];

    // Avoid duplicates in a row
    if (activities.length === 0 || activities[0].path !== path) {
      activities.unshift({ path, timestamp });
    }

    // Trim excess
    if (activities.length > MAX_ENTRIES) {
      activities = activities.slice(0, MAX_ENTRIES);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [location]);

  return null;
};

export default RouteTracker;
