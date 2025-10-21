'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import MotorizadoLoginForm from '@/components/MotorizadoLoginForm';

export default function MotorizadoLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al dashboard si ya está autenticado como motorizado
    if (isAuthenticated()) {
      const user = getUser();
      if (user?.role === 'MOTORIZADO') {
        router.push('/motorizado/dashboard');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">FLIPY</h1>
          <p className="text-gray-600">Panel de Motorizados</p>
        </div>
        <MotorizadoLoginForm />
      </div>
    </div>
  );
}

