export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 py-8">
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold text-primary-900 mb-4" style={{ fontSize: '3.5rem' }}>Welcome to Businesstalk24</h1>
          <p className="text-lg text-secondary-600 mb-12">
            Ask questions, share thoughts, and contribute to business discussions.
          </p>

          <div className="space-y-8 align-items-center">

            <div className="flex items-start">
              <div className="ml-4">
                <h3 className="text-3xl font-bold text-primary-900 mb-2">Ask. Share. Contribute...</h3>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 lg:py-0">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
