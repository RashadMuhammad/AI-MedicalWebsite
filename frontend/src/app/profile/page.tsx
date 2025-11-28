"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";  // <- YOUR apiFetch function

interface User {
  name: string;
  email: string;
  role_name: string;
  phone?: string;
  avatarUrl?: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
          console.error("No session found");
          return;
        }

        const { res, data } = await apiFetch(`/api/session/${sessionId}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          console.error("Session fetch failed");
          return;
        }

        console.log("User session data:", data);

        const userData: User = {
          name: data.name,
          email: data.email,
          role_name: data.role_name,
          phone: data.phone ?? "",
        };

        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone ?? "",
        });

      } catch (err) {
        console.error("Error loading session:", err);
      }
    };

    loadUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!user) return;

    const updated = { ...user, ...formData };
    setUser(updated);
    setIsEditing(false);

    console.log("Saved user data (local only):", updated);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} />
            ) : (
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            )}
          </Avatar>

          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {user.role_name}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
