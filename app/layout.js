import "./globals.css";

export const metadata = {
  title: "Pinball Repair",
  description: "A Next.js starter app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
  {children}
</body>
    </html>
  );
}
