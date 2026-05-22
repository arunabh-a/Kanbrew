import { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import kanbrew from "../../public/kanbrew.png";

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
        <div className="w-full min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary">
                <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-background/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-background/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-primary-foreground">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-black/80 flex items-center justify-center">
                                <Image
                                    src={kanbrew}
                                    alt="Kanbrew Icon"
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <span className="text-2xl font-bold">Kanbrew</span>
                        </div>
                        <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
                            Organize your work,
                            <br />
                            <span className="text-background/80">
                                amplify your impact.
                            </span>
                        </h2>
                        <p className="text-lg text-background/70 max-w-md">
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
                                <CheckCircle2 className="w-5 h-5 text-background/70" />
                                <span className="text-background/80">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md animate-in">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="flex items-center justify-center">
                                <Image
                                    src={kanbrew}
                                    alt="Kanbrew Icon"
                                    width={40}
                                    height={40}
                                />
                            </div>
                        <span className="text-2xl font-bold">Kanbrew</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">{title}</h1>
                        <p className="text-muted-foreground">{subtitle}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
