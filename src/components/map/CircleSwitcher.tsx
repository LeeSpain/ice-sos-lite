import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface Circle {
  id: string;
  name: string;
  member_count?: number;
}

interface CircleSwitcherProps {
  circles: Circle[];
  activeId: string | null;
  onChange: (id: string) => void;
}

export function CircleSwitcher({ circles, activeId, onChange }: CircleSwitcherProps) {
  if (circles.length === 0) {
    return (
      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border">
        <div className="text-sm text-muted-foreground">No family circles found</div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {circles.map((circle) => {
        const isActive = activeId === circle.id;
        
        return (
          <Button
            key={circle.id}
            onClick={() => onChange(circle.id)}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex items-center gap-2 whitespace-nowrap transition-all duration-200",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-background/80 backdrop-blur-sm hover:bg-accent"
            )}
          >
            <Users className="w-4 h-4" />
            <span className="font-medium">{circle.name}</span>
            {circle.member_count !== undefined && (
              <Badge 
                variant={isActive ? "secondary" : "outline"} 
                className="ml-1 text-xs"
              >
                {circle.member_count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}