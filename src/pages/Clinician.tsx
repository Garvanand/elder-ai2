import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ClinicianDashboard } from '@/components/caregiver/ClinicianDashboard';
import { Loader2 } from 'lucide-react';

const Clinician = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && profile?.role !== 'clinician' && profile?.role !== 'admin') {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <ClinicianDashboard />;
};

export default Clinician;
