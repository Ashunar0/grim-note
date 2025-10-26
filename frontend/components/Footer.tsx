import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t py-6">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="flex flex-col items-center justify-center space-y-4 text-center text-sm text-muted-foreground">
          <div className="flex space-x-4">
            <Link href="/terms" className="hover:underline">
              利用規約
            </Link>
            <Link href="/privacy" className="hover:underline">
              プライバシーポリシー
            </Link>
            <Link href="/contact" className="hover:underline">
              お問い合わせ
            </Link>
          </div>
          <p>&copy; 2025 Grim Note. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
