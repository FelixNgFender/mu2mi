type TrackLayoutProps = {
  children: React.ReactNode;
};

export default function TrackLayout({ children }: TrackLayoutProps) {
  return (
    <section className="container relative flex h-full flex-col gap-4 py-4">
      {children}
    </section>
  );
}
