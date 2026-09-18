import React from 'react';
import { useAgri } from '../context/AgriContext';
import { RegistrationModal } from './RegistrationModal';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser } = useAgri();

  if (!isAuthModalOpen) return null;

  return (
    <RegistrationModal
      isOpen={isAuthModalOpen}
      role={currentUser?.role || 'buyer'}
      onClose={() => setIsAuthModalOpen(false)}
      defaultMode="login"
    />
  );
};
