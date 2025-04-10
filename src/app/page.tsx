"use client";

import Image from "next/image";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { UserList } from "@/components/organisms/UserList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/atoms/Badge";

// Sample user data
const users = [
  {
    id: "1",
    name: "John Doe",
    role: "Developer",
    status: "online" as const,
  },
  {
    id: "2",
    name: "Jane Smith",
    role: "Designer",
    status: "away" as const,
  },
  {
    id: "3",
    name: "Mike Johnson",
    role: "Product Manager",
    status: "offline" as const,
  },
];

export default function Home() {
  const handleViewProfile = (userId: string) => {
    console.log(`View profile for user ${userId}`);
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid gap-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to DevBrain</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This dashboard demonstrates the use of shadcn/ui components with Atomic Design principles.
            </p>
            <div className="flex gap-2">
              <Badge>shadcn/ui</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="outline">Atomic Design</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Component Showcase */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The user list below demonstrates the Atomic Design hierarchy:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Atoms: Badge, Avatar</li>
                <li>Molecules: UserCard</li>
                <li>Organisms: UserList</li>
                <li>Templates: DashboardLayout</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <UserList users={users} onViewProfile={handleViewProfile} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
