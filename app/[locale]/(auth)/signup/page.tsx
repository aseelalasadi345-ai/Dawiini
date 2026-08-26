import AuthCard from '@/components/auth/AuthCard';
import AuthLogo from '@/components/auth/AuthLogo';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <AuthCard>
      <AuthLogo />
      <SignupForm />
    </AuthCard>
  );
}
