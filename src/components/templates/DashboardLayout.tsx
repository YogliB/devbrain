"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Input
                type="search"
                placeholder="Search..."
                className="pr-8"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 absolute right-3 top-3 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Button variant="outline" size="sm">
              Settings
            </Button>
            <Button size="sm">New Item</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-8 px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted">
        <div className="container mx-auto py-4 px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} DevBrain. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
