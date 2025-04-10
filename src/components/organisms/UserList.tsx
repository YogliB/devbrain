"use client";

import React from "react";
import { UserCard } from "@/components/molecules/UserCard";

interface User {
  id: string;
  name: string;
  role: string;
  avatarSrc?: string;
  status: "online" | "offline" | "away";
}

interface UserListProps {
  users: User[];
  onViewProfile: (userId: string) => void;
}

export function UserList({ users, onViewProfile }: UserListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard
          key={user.id}
          name={user.name}
          role={user.role}
          avatarSrc={user.avatarSrc}
          status={user.status}
          onViewProfile={() => onViewProfile(user.id)}
        />
      ))}
    </div>
  );
}
