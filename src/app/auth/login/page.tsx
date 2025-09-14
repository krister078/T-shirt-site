import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <LoginForm />
    </AuthLayout>
  );
}
