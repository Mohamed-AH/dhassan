import Container from '@/components/ui/Container';
import LoginForm from '@/components/ui/LoginForm';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Container variant="reading">
        <div className="max-w-md mx-auto">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="heading-secondary mb-2">
              Islamic Lecture Notes
            </h1>
            <p className="text-text-secondary">Admin Panel</p>
            <hr className="divider" />
          </div>

          {/* Login Form */}
          <div className="card-elevated">
            <h2 className="heading-tertiary mb-6">Sign In</h2>
            <LoginForm />
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-text-muted">
            <p>For authorized administrators only</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
