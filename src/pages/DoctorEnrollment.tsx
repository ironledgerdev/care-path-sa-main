import React from 'react';
import Header from '@/components/Header';
import { DoctorEnrollmentForm } from '@/components/doctor/DoctorEnrollmentForm';

const DoctorEnrollment = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DoctorEnrollmentForm />
    </div>
  );
};

export default DoctorEnrollment;