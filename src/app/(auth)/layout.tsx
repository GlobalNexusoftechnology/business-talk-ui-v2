export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 py-8">
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold text-primary-900 mb-4">Welcome to BusinessTalk24</h1>
          <p className="text-lg text-secondary-600 mb-12">
            Ask questions, share thoughts, and contribute to business discussions.
          </p>

          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-primary-900 mb-2">Ask.</h3>
                <p className="text-secondary-600">Pose questions to the community and gain valuable insights from experienced professionals.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-primary-900 mb-2">Share.</h3>
                <p className="text-secondary-600">Exchange your knowledge, experiences, and perspectives with fellow business leaders and entrepreneurs.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-primary-900 mb-2">Contribute.</h3>
                <p className="text-secondary-600">Build a stronger business community by actively participating in meaningful discussions and debates.</p>
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
