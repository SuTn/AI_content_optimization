import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '墨排 - 微信Markdown编辑器',
  description: '本地运行的浏览器端Markdown编辑器，一键生成微信兼容HTML',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
