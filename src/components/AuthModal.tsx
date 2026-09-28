import React from 'react';
import { useAgri } from '../context/AgriContext';
import { RegistrationModal } from './RegistrationModal';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalRole, authModalMode, currentUser } = useAgri();

  if (!isAuthModalOpen) return null;

  return (
    <RegistrationModal
      isOpen={isAuthModalOpen}
      role={authModalRole || currentUser?.role || 'buyer'}
      onClose={() => setIsAuthModalOpen(false)}
      defaultMode={authModalMode || 'login'}
    />
  );
};
