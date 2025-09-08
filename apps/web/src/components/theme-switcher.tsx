import { MoonIcon, SunIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/providers/theme-provider";

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <div className="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center font-medium text-sm">
        <Switch
          checked={theme === "dark"}
          className="peer [&_span]:data-[state=checked]:rtl:-translate-x-full absolute inset-0 h-[inherit] w-auto data-[state=checked]:bg-input/50 data-[state=unchecked]:bg-input/50 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full"
          id="theme-switcher"
          onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
        <span className="pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center text-center peer-data-[state=checked]:text-muted-foreground/70">
          <SunIcon aria-hidden="true" size={16} />
        </span>
        <span className="pointer-events-none relative me-0.5 flex min-w-8 items-center justify-center text-center text-white peer-data-[state=unchecked]:text-muted-foreground/70">
          <MoonIcon aria-hidden="true" size={16} />
        </span>
      </div>
      <Label className="sr-only" htmlFor="theme-switcher">
        Switch theme
      </Label>
    </div>
  );
}

export default ThemeSwitcher;
