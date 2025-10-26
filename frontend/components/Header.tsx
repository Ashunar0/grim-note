"use client";

import Link from "next/link";
import { BookOpen, Search, User, Plus, LogOut } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from '@/lib/api-client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-semibold">Grim Note</span>
        </Link>

        <nav className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/timeline">
              <BookOpen className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/books/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.name ?? 'User'} />
                  <AvatarFallback>
                    {(user?.name?.[0] ?? 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={user ? `/users/${user.id}` : '/login'} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  マイページ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/posts/new" className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  投稿作成
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(event) => { event.preventDefault(); handleLogout(); }} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
