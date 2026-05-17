import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata = { title: 'Set new password – CourtFinder' }

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎾</div>
          <h1 className="text-2xl font-bold text-gray-900">CourtFinder</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Set new password</h2>
          <p className="text-sm text-gray-500 mb-6">Choose a strong password for your account.</p>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
