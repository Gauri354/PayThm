import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Wallet, ScanQrCode, Landmark } from "lucide-react";
import Link from "next/link";

const actions = [
  { label: "Send Money", icon: Send, href: "/send-money" },
  { label: "Add Money", icon: Wallet, href: "/add-money" },
  { label: "Scan QR", icon: ScanQrCode, href: "/scan-qr" },
  { label: "To Bank", icon: Landmark, href: "/send-money" },
];

export function QuickActions() {
  return (
    <Card className="premium-card md:col-span-2">
      <CardHeader>
        <CardTitle className="gradient-text">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-6 flex flex-col items-center justify-center gap-3 border-primary/10 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group whitespace-normal text-center"
            asChild
          >
            <Link href={action.href} className="w-full h-full">
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 dark:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                <action.icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
              </div>
              <span className="font-medium text-sm text-foreground dark:text-foreground leading-tight">{action.label}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
