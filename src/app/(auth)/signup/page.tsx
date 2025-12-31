'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/lib/auth';
import { UserCreateDto, GenderType, UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<UserCreateDto>({
    password: '',
    gender: 'preferNotToSay',
    role: 'user',
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSelectChange(name: keyof UserCreateDto, value: string) {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      // Validate required fields locally
      if (!formData.email) {
        setError('Email is required');
        setFieldErrors({ email: ['Email is required'] });
        setIsLoading(false);
        return;
      }
      if (!formData.password || formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        setFieldErrors({ password: ['Password must be at least 8 characters'] });
        setIsLoading(false);
        return;
      }

      const result = await registerAction(formData);

      if (!result.success) {
        setError(result.error);
        if (result.errors) {
          setFieldErrors(result.errors);
        }
        return;
      }

      // Registration successful - redirect to login
      router.push('/login?registered=true');
      router.refresh();
    } catch (err) {
      // Fallback error handling
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>
              Sign up to get started with ZambiaHomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500">{fieldErrors.email[0]}</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="johndoe"
                  pattern="^[a-zA-Z0-9_]+$"
                  title="Username can only contain letters, numbers, and underscores"
                  value={formData.username || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {fieldErrors.username && (
                  <p className="text-sm text-red-500">{fieldErrors.username[0]}</p>
                )}
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+260123456789"
                  pattern="^[\+]?[0-9\s\-\(\)]+$"
                  value={formData.phoneNumber || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {fieldErrors.phoneNumber && (
                  <p className="text-sm text-red-500">{fieldErrors.phoneNumber[0]}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender || 'preferNotToSay'}
                  onValueChange={(value) =>
                    handleSelectChange('gender', value as GenderType)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="preferNotToSay">Prefer Not to Say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role || 'user'}
                  onValueChange={(value) =>
                    handleSelectChange('role', value as UserRole)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="landlord">Landlord</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  minLength={8}
                />
                <p className="text-xs text-gray-500">
                  Minimum 8 characters, must include special characters
                </p>
                {fieldErrors.password && (
                  <p className="text-sm text-red-500">{fieldErrors.password[0]}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

