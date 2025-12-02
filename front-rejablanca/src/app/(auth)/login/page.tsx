"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login as loginService } from '@/services/auth.service';
import { useSession } from '@/context/SessionContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isSessionLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isSessionLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Use 'password' to match the backend DTO for login
      const { access_token } = await loginService({ email, password });
      localStorage.setItem('authToken', access_token);
      // Force reload to update SessionProvider state across the app
      window.location.href = '/dashboard';
    } catch (err: any) {
      const apiError = err.response?.data?.message || 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
      setError(Array.isArray(apiError) ? apiError.join(', ') : apiError);
    } finally {
      setIsLoading(false);
    }
  };

  // While session is loading, or if user is found, don't show the login form
  if (isSessionLoading || user) {
    return <div className="flex items-center justify-center min-h-screen">Cargando sesión...</div>;
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gray-100 lg:block">
          <Image
            src="/local.jpg"
            alt="Image"
            width="1920"
            height="1080"
            className="h-full w-full object-cover"
          />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Bienvenido a Reja Blanca</h1>
            <p className="text-balance text-muted-foreground">
              Ingresa tus datos para iniciar sesión
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && (
                 <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error de Autenticación</AlertTitle>
                    <AlertDescription>
                     {error}
                    </AlertDescription>
                  </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
