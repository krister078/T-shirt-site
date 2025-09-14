import { AuthLayout } from '@/components/layout/AuthLayout';
import { SignUpForm } from '@/components/forms/SignUpForm';

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join T4U to start selling and buying custom t-shirts"
    >
      <SignUpForm />
    </AuthLayout>
  );
}
