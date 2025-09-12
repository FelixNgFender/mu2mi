interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      {children}
    </div>
  );
}
