'use client'

import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/" className="mb-6 inline-block transition-colors" style={{ color: '#1976D2' }} onMouseEnter={(e) => e.currentTarget.style.color = '#1565C0'} onMouseLeave={(e) => e.currentTarget.style.color = '#1976D2'}>
          ← Back home
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border p-8" style={{ border: '1px solid #E8E8E8' }}>
          <div>
            <h1 className="text-3xl font-bold mb-6" style={{ color: '#212529' }}>Privacy Policy</h1>
            <p className="mb-6" style={{ color: '#5F6368' }}>Last updated: January 2024</p>

            <div className="space-y-6" style={{ color: '#212529' }}>
              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#212529' }}>1. Introduction</h2>
                <p style={{ color: '#5F6368' }}>
                  Welcome to Business Talk 24 ("Company", "we", "our", or "us"). We are committed to protecting your
                  privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                  you visit our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#212529' }}>2. Information We Collect</h2>
                <p style={{ color: '#5F6368' }}>We collect information in the following ways:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2" style={{ color: '#5F6368' }}>
                  <li>Information you voluntarily provide (name, email, phone number)</li>
                  <li>Information collected automatically (IP address, browser type, usage data)</li>
                  <li>Information from third-party sources (social media, partners)</li>
                  <li>Payment and billing information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#212529' }}>3. Use of Your Information</h2>
                <p style={{ color: '#5F6368' }}>We use the information we collect for:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2" style={{ color: '#5F6368' }}>
                  <li>Providing and improving our services</li>
                  <li>Processing transactions</li>
                  <li>Sending promotional communications</li>
                  <li>Responding to your inquiries</li>
                  <li>Analyzing usage patterns and trends</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#212529' }}>4. Disclosure of Your Information</h2>
                <p style={{ color: '#5F6368' }}>
                  We may disclose your information to third parties in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2" style={{ color: '#5F6368' }}>
                  <li>Service providers who assist us in operating our website</li>
                  <li>Business partners for joint ventures</li>
                  <li>When required by law</li>
                  <li>To protect the rights and safety of others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#212529' }}>5. Security of Your Information</h2>
                <p style={{ color: '#5F6368' }}>
                  We use administrative, technical, and physical security measures to protect your personal information.
                  However, no method of transmission over the internet is completely secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#212529' }}>6. Your Rights</h2>
                <p style={{ color: '#5F6368' }}>You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2" style={{ color: '#5F6368' }}>
                  <li>Right to access your data</li>
                  <li>Right to correct inaccurate data</li>
                  <li>Right to request deletion</li>
                  <li>Right to opt-out of marketing communications</li>
                  <li>Right to data portability</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#212529' }}>7. Contact Us</h2>
                <p style={{ color: '#5F6368' }}>
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p className="mt-3">
                  Email: privacy@businesstalk24.com<br />
                  Address: 123 Business Street, San Francisco, CA 94102
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
