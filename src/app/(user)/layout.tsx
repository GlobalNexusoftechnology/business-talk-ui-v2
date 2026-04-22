import { UserLayoutWrapper } from '@/components/shared/UserLayoutWrapper'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <UserLayoutWrapper>{children}</UserLayoutWrapper>
}
