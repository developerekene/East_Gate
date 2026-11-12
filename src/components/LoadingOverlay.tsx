import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Loader2 } from 'lucide-react';

export const LoadingOverlay: React.FC = () => {
  const { isLoading, loadingMessage } = useSelector((state: RootState) => state.app);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B2545]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl px-6 py-5 shadow-2xl border border-blue-100 flex items-center gap-3.5">
        <Loader2 className="w-5 h-5 text-[#0B2545] animate-spin shrink-0" />
        <span className="text-sm font-bold text-[#0B2545]">
          {loadingMessage || 'Loading...'}
        </span>
      </div>
    </div>
  );
};
