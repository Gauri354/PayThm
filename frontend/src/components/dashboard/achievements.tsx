import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { achievements } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Achievements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-5 text-amber-500" />
          <span>Achievements</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex items-center justify-around gap-4">
            {achievements.map((ach) => (
              <Tooltip key={ach.id}>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "flex flex-col items-center gap-2 transition-all",
                    ach.achieved ? "opacity-100" : "opacity-40 grayscale"
                  )}>
                    <div className={cn(
                      "rounded-full p-3",
                      ach.achieved ? "bg-amber-100 dark:bg-amber-900/50" : "bg-muted"
                    )}>
                      <ach.icon className={cn(
                        "size-6",
                        ach.achieved ? "text-amber-500" : "text-muted-foreground"
                      )} />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{ach.title}</p>
                  <p className="text-sm text-muted-foreground">{ach.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
