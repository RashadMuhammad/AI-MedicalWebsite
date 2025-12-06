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

import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [avatar, setAvatar] = useState<File | Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || "");

  // Image crop states
  const [crop, setCrop] = useState<any>({ unit: "%", width: 60, aspect: 1 });
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image select → open crop modal
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageURL = URL.createObjectURL(file);
      setSelectedImage(imageURL);
      setAvatar(file);
      setShowCropModal(true);
    }
  };

  // Apply crop
  const cropImage = () => {
    const image: HTMLImageElement | null = document.getElementById("crop-image") as HTMLImageElement;

    if (!image) return;

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = (crop.width || 0) * scaleX;
    canvas.height = (crop.height || 0) * scaleY;

    const ctx = canvas.getContext("2d");

    ctx?.drawImage(
      image,
      (crop.x || 0) * scaleX,
      (crop.y || 0) * scaleY,
      (crop.width || 0) * scaleX,
      (crop.height || 0) * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const preview = URL.createObjectURL(blob);
        setAvatar(blob);
        setAvatarPreview(preview);
      }
    });
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
      console.log("user",user);
      const userId = user?.user_id ?? user?.id;
      const { res, data } = await apiFetch(`/api/users/${userId}`, {
        method: "PUT",
        body: form,
      });

      if (!res.ok) throw new Error(data?.error || "Failed to update profile");

      setUser(data.user);
      setAvatarPreview(data.user.avatar);

      toast("Your profile has been updated!");
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
      
      {/* ------------------- IMAGE CROP MODAL ------------------- */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Crop Image</h2>

            <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
              <img id="crop-image" src={selectedImage!} alt="Crop" />
            </ReactCrop>

            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => {
                  cropImage();
                  setShowCropModal(false);
                }}
              >
                Apply
              </Button>

              <Button variant="outline" onClick={() => setShowCropModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
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
            <p className="text-muted-foreground text-sm">Manage your personal information</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </header>

      {/* AVATAR */}
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

      {/* FORM */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Manage your details and contact info</CardDescription>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">

              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} disabled={!isEditing} />
              </div>

              {user?.role_name === "doctor" && (
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input name="specialization" value={formData.specialization} onChange={handleInputChange} disabled={!isEditing} />
                </div>
              )}

              {["doctor", "nurse"].includes(user?.role_name ?? "") && (
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input name="department_id" value={formData.department_id} onChange={handleInputChange} disabled={!isEditing} />
                </div>
              )}

              {user?.role_name === "patient" && (
                <>
                  <div className="space-y-2">
                    <Label>Blood Group</Label>
                    <Input name="blood_group" value={formData.blood_group} onChange={handleInputChange} disabled={!isEditing} />
                  </div>

                  <div className="space-y-2">
                    <Label>Emergency Contact</Label>
                    <Input name="emergency_contact" value={formData.emergency_contact} onChange={handleInputChange} disabled={!isEditing} />
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing} />
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

      {/* SECURITY */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Manage your password and security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Change Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
