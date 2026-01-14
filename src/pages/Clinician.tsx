import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { useNavigate } from 'react-router-dom';
import { CommandCenter } from '@/components/clinician/CommandCenter';
import { Loader2 } from 'lucide-react';

const Clinician = () => {
  const { user, profile, loading } = useAuth();
  const { isGuestMode, demoPortal, demoProfile } = useDemo();
  const navigate = useNavigate();

  useEffect(() => {
    if (isGuestMode && demoPortal === 'clinician') {
      return;
    }
    
    if (!loading && !user && !isGuestMode) {
      navigate('/auth');
    } else if (!loading && profile?.role !== 'clinician' && profile?.role !== 'admin' && !isGuestMode) {
      navigate('/');
    }
  }, [user, profile, loading, navigate, isGuestMode, demoPortal]);

  if (loading && !isGuestMode) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <CommandCenter />;
};

export default Clinician;
