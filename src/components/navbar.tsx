"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { Menu, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Logoss from "@/assets/logowhite.svg"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 m-auto">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center space-x-2"
            aria-label="Enterprise AI Homepage">
            <img src={Logoss} alt="Logo" className="h-8" />
            <span className="text-2xl font-bold">Hokimiyat AI</span>
          </Link>
        </div>

      

        <div className="flex items-center gap-4">
          <ModeToggle />

          <Button
            asChild
            className="hidden md:flex items-center gap-3 px-4 py-2 bg-[#1a1d21] hover:bg-[#2a2d31] text-white rounded-xl border-0 h-auto dark:bg-primary dark:hover:bg-primary/90 dark:shadow-[0_0_10px_rgba(36,101,237,0.4)]">
            <Link to="/chat-assistant">
              <Zap className="h-4 w-4 text-white" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Request Demo</span>
                <span className="text-xs text-gray-400 dark:text-gray-300 -mt-0.5">
                  v1.0.0
                </span>
              </div>
            </Link>
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" aria-label="Open Menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
             
                <div className="mt-6 pt-4 border-t">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-sm font-medium">Theme</span>
                      <ModeToggle />
                    </div>
                    <Button
                      asChild
                      className="w-full flex items-center justify-center gap-2 px-4 py-5 bg-[#1a1d21] hover:bg-[#2a2d31] text-white rounded-lg border-0 dark:bg-primary dark:hover:bg-primary/90 dark:shadow-[0_0_10px_rgba(36,101,237,0.4)]">
                      <Link to="/chat-assistant" onClick={() => setIsOpen(false)}>
                        <Zap className="h-4 w-4 text-white" />
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium">
                            Request Demo
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-300">
                            v1.0.0
                          </span>
                        </div>
                      </Link>
                    </Button>
                  </div>
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
