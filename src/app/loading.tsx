'use client'

export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
      <div style={{ textAlign: 'center' }}>
        <img
          src="/assets/logos/BUSINESSTALK24_LOGO_svg.svg"
          alt="BusinessTalk24"
          style={{ width: 120, height: 120, animation: 'bt-spin 1200ms linear infinite' }}
        />
        <div style={{ height: 12 }} />
        <div style={{ color: '#666', fontSize: 14 }}>Loading...</div>
      </div>
      <style>{`@keyframes bt-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
