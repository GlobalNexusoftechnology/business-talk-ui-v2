import { AdminLayoutWrapper } from '@/components/shared/AdminLayoutWrapper'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
}
