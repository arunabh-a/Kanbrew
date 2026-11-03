import Link from "next/link";
import { ArrowRight, CheckCircle2, LayoutGrid, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import yohaku from "../../public/yohaku.png";
import github from "../../public/github.svg";

const features = [
    {
        icon: LayoutGrid,
        title: "Kanban & List Views",
        description: "Switch between views to work the way you prefer",
        iconBg: "bg-slate/15",
        iconColor: "text-slate",
    },
    {
        icon: Zap,
        title: "Real-time Updates",
        description: "Changes sync instantly across all your devices",
        iconBg: "bg-ochre/15",
        iconColor: "text-ochre",
    },
    {
        icon: CheckCircle2,
        title: "Priority Tracking",
        description: "Focus on what matters with priority levels",
        iconBg: "bg-moss/15",
        iconColor: "text-moss",
    },
];

export default function Page() {
    return (
        <div className="min-h-screen flex-1 bg-background text-foreground overflow-hidden">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-ochre/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-slate/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-0 w-[350px] h-[350px] bg-moss/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between h-16 px-4 md:px-6 border-b border-border/60 bg-background/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center p-1.5 rounded-xl bg-ink">
                        <Image
                            src={yohaku}
                            alt="Yohaku Icon"
                            width={28}
                            height={28}
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-ink">Yohaku</span>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/sign-up">Get started</Link>
                    </Button>
                </div>
            </header>

            {/* Hero */}
            <main className="relative z-10 w-full px-4 md:px-6">
                <div className="flex flex-col items-center text-center pt-20 md:pt-32 pb-20">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ochre/15 border border-ochre/30 text-sm font-medium text-ink mb-6 animate-fade-up">
                        <span className="w-2 h-2 rounded-full bg-ochre animate-pulse" />
                        Now with Kanban boards
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ink mb-6 animate-fade-up max-w-4xl">
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
                            asChild
                            className="shadow-glow px-8"
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
                            className="p-6 rounded-2xl bg-card border border-border hover:border-ochre/50 hover:shadow-md transition-all duration-200 animate-fade-up"
                            style={{ animationDelay: `${300 + index * 100}ms` }}
                        >
                            <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4`}>
                                <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                            </div>
                            <h3 className="font-semibold text-ink mb-2">
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
