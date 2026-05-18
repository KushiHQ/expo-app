import ProfileScreen from '@/components/screens/profile';
import AuthGuard from '@/components/guards/auth-guard';

export default function GuestProfile() {
  return (
    <AuthGuard>
      <ProfileScreen />
    </AuthGuard>
  );
}
