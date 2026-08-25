import AuthCard from '@/components/auth/AuthCard';
import AuthLogo from '@/components/auth/AuthLogo';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthLogo />
      <LoginForm />
    </AuthCard>
  );
}