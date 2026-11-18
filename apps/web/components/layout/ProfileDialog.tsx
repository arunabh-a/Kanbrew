import { User as UserType } from "@/service/app.interface";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Mail, User, Calendar } from "lucide-react";

interface ProfileDialogProps {
    user: UserType;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({
    user,
    open,
    onOpenChange,
}: ProfileDialogProps) {
    const initials = (user.name ?? "")
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                    <DialogDescription>
                        View and manage your account details
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-4">
                    <Avatar className="h-20 w-20">
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label
                            htmlFor="name"
                            className="flex items-center gap-2"
                        >
                            <User className="h-4 w-4 text-muted-foreground" />
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            value={user.name || ' - '}
                            readOnly
                            className="bg-muted/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="email"
                            className="flex items-center gap-2"
                        >
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            Email
                        </Label>
                        <Input
                            id="email"
                            value={user.email}
                            readOnly
                            className="bg-muted/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Member Since
                        </Label>
                        <Input
                            value={user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                                : "—"}
                            readOnly
                            className="bg-muted/50"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
