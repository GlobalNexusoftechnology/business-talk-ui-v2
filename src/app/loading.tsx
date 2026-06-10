'use client'

export default function Loading() {
  return (
    <>
      <div className="loader-container">
        <div className="content">
          <div className="logo-wrapper w-100" >
            <img
              src="/assets/logos/BUSINESSTALK24_LOGO_svg.svg"
              alt="BusinessTalk24"
              className="logo"
            />

            {/* Glow Effect */}
            <div className="glow"></div>
          </div>

          <h2 className="title">BusinessTalk24</h2>

          <div className="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <p className="loading-text">Loading your experience...</p>
        </div>
      </div>

      <style jsx>{`
        .loader-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #f8fafc 50%,
            #eef2ff 100%
          );
          overflow: hidden;
        }

        .content {
          text-align: center;
          position: relative;
        }

        .logo-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          animation: float 3s ease-in-out infinite;
        }

        .logo {
          width: 250px;
          height: 120px;
          position: relative;
          z-index: 2;
          animation: pulse 2s ease-in-out infinite;
        }

        .glow {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.15);
          filter: blur(20px);
          animation: glowPulse 2s ease-in-out infinite;
        }

        .title {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          letter-spacing: 0.5px;
          animation: fadeInUp 1s ease;
        }

        .loading-text {
          margin-top: 12px;
          font-size: 14px;
          color: #6b7280;
          animation: fadeIn 1.5s ease;
        }

        .dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #2563eb;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .dots span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .dots span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes glowPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .logo {
            width: 90px;
            height: 90px;
          }

          .glow {
            width: 110px;
            height: 110px;
          }

          .title {
            font-size: 22px;
          }

          .loading-text {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  )
}