import { ProfileLayout } from '@/components/layout/ProfileLayout';
import { UserInfoSection } from '@/components/profile/UserInfoSection';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { AddressSection } from '@/components/profile/AddressSection';
import { PaymentMethodSection } from '@/components/profile/PaymentMethodSection';
import { YourShirtsSection } from '@/components/profile/YourShirtsSection';
import { DangerZone } from '@/components/profile/DangerZone';

export default function ProfilePage() {
  return (
    <ProfileLayout>
      <UserInfoSection />
      <PasswordChangeForm />
      <AddressSection />
      <PaymentMethodSection />
      <YourShirtsSection />
      <DangerZone />
    </ProfileLayout>
  );
}
