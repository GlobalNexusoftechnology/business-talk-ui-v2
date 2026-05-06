export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e8ecf0 100%)' }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-14 py-12 relative overflow-hidden">
        {/* subtle decorative circle */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #212529 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #212529 0%, transparent 70%)' }} />

        <div className="relative max-w-lg">
          {/* Logo / brand name */}
          <p className="text-sm font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: '#5F6368' }}>
            Businesstalk24
          </p>

          {/* Hero tagline — 3 large words */}
          <div className="space-y-1 mb-8">
            {['Ask.', 'Share.', 'Contribute.'].map((word) => (
              <h1
                key={word}
                className="font-extrabold leading-none tracking-tight"
                style={{ fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', color: '#212529' }}
              >
                {word}
              </h1>
            ))}
          </div>

          <p className="text-lg leading-relaxed" style={{ color: '#5F6368', maxWidth: '28rem' }}>
            Ask business questions, share your experiences, and contribute to meaningful professional discussions.
          </p>

          {/* divider accent */}
          <div className="mt-10 flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: '#D1D5DB' }} />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#9E9E9E' }}>
              Professional Network
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: '#D1D5DB' }} />
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
