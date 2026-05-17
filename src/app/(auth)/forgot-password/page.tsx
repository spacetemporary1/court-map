import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata = { title: 'Reset password – CourtFinder' }

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎾</div>
          <h1 className="text-2xl font-bold text-gray-900">CourtFinder</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Forgot password?</h2>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
