import { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import yohaku from "../../public/yohaku.png";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

const features = [
    "Kanban & List views",
    "Priority tracking",
    "Real-time updates",
    "Team collaboration",
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="w-full min-h-screen flex bg-background text-foreground">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-ink">
                <div className="absolute inset-0 bg-linear-to-br from-slate/30 via-transparent to-moss/20" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-ochre/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-ivory">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-ivory/10 border border-ivory/15 flex items-center justify-center">
                                <Image
                                    src={yohaku}
                                    alt="Yohaku Icon"
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">Yohaku</span>
                        </div>
                        <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
                            Organize your work,
                            <br />
                            <span className="text-ochre">
                                amplify your impact.
                            </span>
                        </h2>
                        <p className="text-lg text-ivory/75 max-w-md">
                            A beautiful task management experience that helps
                            you stay focused and accomplish more.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {features.map((feature) => (
                            <div
                                key={feature}
                                className="flex items-center gap-3"
                            >
                                <CheckCircle2 className="w-5 h-5 text-moss" />
                                <span className="text-ivory/85">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-sm animate-in">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="flex items-center justify-center p-1.5 rounded-xl bg-ink">
                            <Image
                                src={yohaku}
                                alt="Yohaku Icon"
                                width={32}
                                height={32}
                            />
                        </div>
                        <span className="text-2xl font-bold text-ink">Yohaku</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-ink mb-2">{title}</h1>
                        <p className="text-muted-foreground">{subtitle}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
