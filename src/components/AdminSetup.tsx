
import React from 'react';
import { useAuth } from '@/context/AuthContext';

const AdminSetup = () => {
  const { user } = useAuth();

  // This component is no longer needed as admin setup is handled on backend
  // Admin users are created directly in the database
  // You can remove this component or repurpose it
  
  if (!user) {
    return null;
  }

  // Admin setup is handled by backend - no UI needed
  // To make a user admin, update directly in MongoDB database
  return null;
};

export default AdminSetup;
