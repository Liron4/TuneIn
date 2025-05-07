"use client";
import { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    nickname: "",
    genres: "",
    password: "",
    retypePassword: "",
    profilePic: null,
  });
  const [msg, setMsg] = useState("");
  // Set default preview to the default profile pic path
  const defaultProfilePicPath = "/ProjectImages/blank-profile-picture.png";
  const [profilePicPreview, setProfilePicPreview] = useState(defaultProfilePicPath);

  // Helper to check if genres are comma separated
  const isGenresValid = (genres) => {
    if (!genres) return false;
    const arr = genres.split(",").map(g => g.trim()).filter(Boolean);
    return arr.length > 0 && (arr.length === 1 || genres.includes(","));
  };

  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic" && files && files[0]) {
      setForm((prev) => ({
        ...prev,
        profilePic: files[0],
      }));
      setProfilePicPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    // 1. Password validation
    if (form.password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.retypePassword) {
      setMsg("Passwords do not match.");
      return;
    }

    // 2. Genres validation
    if (!isGenresValid(form.genres)) {
      setMsg("Genres must be comma separated (e.g., Rock, Pop, Jazz).");
      return;
    }

    // 3. Email validation
    // 4. nickname validation
    // both checked by backend

    // 5. Profile pic validation
    let profilePicFile = form.profilePic;
    if (!profilePicFile) {
      // Fetch the default image from public folder
      try {
        const response = await fetch(defaultProfilePicPath);
        const blob = await response.blob();
        profilePicFile = new File([blob], "blank-profile-picture.png", { type: blob.type });
        setMsg("No profile picture uploaded. Using default image.");
      } catch {
        setMsg("Failed to load default profile picture.");
        return;
      }
    } else if (!["image/jpeg", "image/png"].includes(profilePicFile.type)) {
      setMsg("Profile picture must be a .jpg or .png file.");
      return;
    }

    // Compress image
    let compressedPic = profilePicFile;
    try {
      compressedPic = await imageCompression(profilePicFile, {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 640,
        useWebWorker: true,
      });
    } catch {
      setMsg("Image compression failed");
      return;
    }

    // Prepare form data
    const data = new FormData();
    data.append("email", form.email);
    data.append("nickname", form.nickname);
    data.append("genres", form.genres);
    data.append("password", form.password);
    data.append("retypePassword", form.retypePassword);
    data.append("profilePic", compressedPic, compressedPic.name);

    try {
      await axios.post("http://localhost:5000/api/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg("Registration successful!");
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input className="w-full border p-2 rounded" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input className="w-full border p-2 rounded" type="text" name="nickname" placeholder="Nickname" value={form.nickname} onChange={handleChange} required />
      <input className="w-full border p-2 rounded" type="text" name="genres" placeholder='Genres (comma separated, example: "Rock, Pop")' value={form.genres} onChange={handleChange} required />
      <input className="w-full border p-2 rounded" type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <input className="w-full border p-2 rounded" type="password" name="retypePassword" placeholder="Retype Password" value={form.retypePassword} onChange={handleChange} required />
      <input className="w-full border p-2 rounded" type="file" name="profilePic" accept="image/png, image/jpeg" onChange={handleChange} />
      <img
        src={profilePicPreview}
        alt="Profile Preview"
        className="w-24 h-24 object-cover rounded-full mx-auto"
      />
      <button className="w-full bg-blue-500 text-white py-2 rounded" type="submit">
        Register
      </button>
      {msg && <div className="text-red-500 text-center">{msg}</div>}
    </form>
  );
}