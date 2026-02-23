import "./globals.css";

export const metadata = {
  title: "Global Chat",
  description: "Public chat room — no login needed",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
