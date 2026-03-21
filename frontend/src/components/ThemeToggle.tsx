import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/store/themeStore'

export function ThemeToggle() {
    const { isDark, toggle } = useThemeStore()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="rounded-full text-muted-foreground hover:text-foreground transition-all active:scale-95"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {isDark ? (
                <Sun className="w-5 h-5 animate-in zoom-in spin-in-90 duration-300" />
            ) : (
                <Moon className="w-5 h-5 animate-in zoom-in spin-in-90 duration-300" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
