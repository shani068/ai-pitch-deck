/** Auth pages fill the space between the site header and footer; the frame lives in AuthShell. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <main className="flex flex-1 flex-col overflow-x-clip">{children}</main>;
}
