import type { ReactNode } from "react";

interface SettingsPopoverProps {
  children: ReactNode;
}

export default function SettingsPopover({ children }: SettingsPopoverProps) {
  return <div>{children}</div>;
}
