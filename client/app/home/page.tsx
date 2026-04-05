import Link from "next/link";
import { ArrowRight, CheckCircle2, LayoutGrid, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const features = [
    {
        icon: LayoutGrid,
        title: "Kanban & List Views",
        description: "Switch between views to work the way you prefer",
    },
    {
        icon: Zap,
        title: "Real-time Updates",
        description: "Changes sync instantly across all your devices",
    },
    {
        icon: CheckCircle2,
        title: "Priority Tracking",
        description: "Focus on what matters with priority levels",
    },
];

export default function Page() {
    return (
        <div className="min-h-screen flex-1 bg-background overflow-hidden">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between h-16 px-4 md:px-6 ">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                        <svg
                            className="w-5 h-5 text-primary-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                            <rect x="9" y="3" width="6" height="4" rx="1" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold">Taskbrew</span>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/sign-up">Get started</Link>
                    </Button>
                    <div className="flex items-center gap-2 p-2 border backdrop-blur-sm hover:bg-muted transition-colors rounded-xl">
                        <Link
                            href="https://github.com/arunabh-a/Task-Brew"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image
                                src="/github.svg"
                                alt="GitHub"
                                width={24}
                                height={24}
                            />
                        </Link>
                        <h1>Repo</h1>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <main className="relative z-10 w-full px-4 md:px-6">
                <div className="flex flex-col items-center text-center pt-20 md:pt-32 pb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground mb-6 animate-fade-up">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Now with Kanban boards
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up max-w-4xl">
                        Organize your work,
                        <br />
                        <span className="text-gradient">
                            amplify your impact.
                        </span>
                    </h1>

                    <p
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-fade-up"
                        style={{ animationDelay: "100ms" }}
                    >
                        A beautiful task management experience that helps you
                        stay focused, organized, and accomplish more every day.
                    </p>

                    <div
                        className="flex flex-col sm:flex-row items-center gap-4 animate-fade-up"
                        style={{ animationDelay: "200ms" }}
                    >
                        <Button
                            size="lg"
                            variant="link"
                            asChild
                            className="shadow-glow"
                        >
                            <Link href="/sign-up">
                                Start for free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/login">Sign in to your account</Link>
                        </Button>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto pb-20">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="p-6 rounded-2xl bg-card border border-border hover:border-muted-foreground/30 transition-colors animate-fade-up"
                            style={{ animationDelay: `${300 + index * 100}ms` }}
                        >
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4">
                                <feature.icon className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
