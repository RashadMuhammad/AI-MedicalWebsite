"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Camera, User, Sun, Moon } from "lucide-react";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiFetch } from "@/lib/api";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    user?.avatar || ""
  );

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const [formData, setFormData] = useState({
    email: user?.email || "",
    password: "",
    name: user?.name || "",
    phone: user?.phone ? String(user.phone) : "",
    avatar: user?.avatar || "",
    specialization: user?.specialization || "",
    department_id: user?.department_id ? String(user.department_id) : "",
    dateOfBirth: user?.dateOfBirth || "",
    blood_group: user?.blood_group || "",
    address: user?.address || "",
    emergency_contact: user?.emergency_contact
      ? String(user.emergency_contact)
      : "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    form.append("email", formData.email);
    form.append("password", formData.password || "");
    form.append("name", formData.name);
    form.append("phone", String(formData.phone || ""));
    form.append("specialization", formData.specialization || "");
    form.append("department_id", String(formData.department_id || ""));
    form.append("dateOfBirth", formData.dateOfBirth || "");
    form.append("blood_group", String(formData.blood_group || ""));
    form.append("address", formData.address || "");
    form.append("emergency_contact", String(formData.emergency_contact || ""));
    if (avatar) form.append("avatar", avatar);

    try {
      const { res, data } = await apiFetch(`/api/users/${user?.id}`, {
        method: "PUT",
        body: form,
      });

      if (!res.ok) throw new Error(data?.error || "Failed to update profile");

      setUser(data.user);
      setAvatarPreview(data.user.avatar);

      toast("Your profile information has been saved successfully.");

      setIsEditing(false);
    } catch (err) {
      toast((err as Error).message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      email: user?.email || "",
      password: "",
      name: user?.name || "",
      phone: user?.phone ? String(user.phone) : "",
      avatar: user?.avatar || "",
      specialization: user?.specialization || "",
      department_id: user?.department_id ? String(user.department_id) : "",
      dateOfBirth: user?.dateOfBirth || "",
      blood_group: user?.blood_group || "",
      address: user?.address || "",
      emergency_contact: user?.emergency_contact
        ? String(user.emergency_contact)
        : "",
    });
    setAvatarPreview(user?.avatar || "");
    setAvatar(null);
  };

  return (
    <div className="space-y-10 px-10 md:px-40 pb-50 mt-20">
      <header className="sticky top-0 z-50 h-16 border-b bg-card flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-md p-2 hover:bg-accent transition"
          >
            <span className="text-xl">←</span>
          </button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground text-sm">
              Manage your personal information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </header>

      <div className="flex items-center space-x-4">
        <div className="relative w-20 h-20 group">
          <Avatar className="w-20 h-20">
            {avatarPreview ? (
              <AvatarImage src={avatarPreview} />
            ) : (
              <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
            )}
          </Avatar>

          {isEditing && (
            <>
              <label
                htmlFor="avatarUpload"
                className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition cursor-pointer rounded-full"
              >
                <Camera className="w-6 h-6 text-white" />
              </label>
              <input
                id="avatarUpload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </>
          )}
        </div>

        <div>
          <p className="font-semibold text-lg">{formData.name}</p>
          <p className="text-sm text-muted-foreground capitalize">
            {user?.role_name}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Manage your details and contact info
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              {/* DOB */}
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Doctor — Specialization */}
              {user?.role_name === "doctor" && (
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              )}

              {/* Doctor/Nurse — Department */}
              {["doctor", "nurse"].includes(user?.role_name ?? "") && (
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              )}

              {/* Patient fields */}
              {user?.role_name === "patient" && (
                <>
                  <div className="space-y-2">
                    <Label>Blood Group</Label>
                    <Input
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Contact</Label>
                    <Input
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Change Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
