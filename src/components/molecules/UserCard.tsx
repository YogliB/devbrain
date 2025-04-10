"use client";

import React from "react";
import { Avatar } from "@/components/atoms/Avatar";
import { Badge } from "@/components/atoms/Badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserCardProps {
  name: string;
  role: string;
  avatarSrc?: string;
  status?: "online" | "offline" | "away";
  onViewProfile?: () => void;
}

export function UserCard({
  name,
  role,
  avatarSrc,
  status = "offline",
  onViewProfile
}: UserCardProps) {
  const statusVariant = {
    online: "default",
    offline: "secondary",
    away: "outline"
  } as const;

  return (
    <Card className="w-[300px]">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar src={avatarSrc} fallback={name} />
        <div className="flex flex-col">
          <CardTitle className="text-lg">{name}</CardTitle>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <span className="text-sm">Status:</span>
          <Badge variant={statusVariant[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onViewProfile}
          variant="outline"
          className="w-full"
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
