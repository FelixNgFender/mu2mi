type LyricsLayoutProps = {
  children: React.ReactNode;
};

export default function LyricsLayout({ children }: LyricsLayoutProps) {
  return (
    <section className="container relative flex h-full max-w-(--breakpoint-lg) flex-col gap-4 py-4">
      {children}
    </section>
  );
}
