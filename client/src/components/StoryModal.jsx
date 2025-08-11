import { useAuth } from "@clerk/clerk-react";
import { ArrowLeft, Sparkle, TextIcon, Upload } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const StoryModal = ({ setShowModal, fetchStories }) => {
  const bgColors = [
    "#4f46e5",
    "#7c3aed",
    "#db2777",
    "#e11d48",
    "#ca8a04",
    "#0d9488",
    "#000000",
    "#FF0000",
    "#008000",
    "#0000FF",
    "#FF00FF",
    "#808080",
    "#FFA500",
    "#23272A",
    "#3C3F41",
  ];
  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { getToken } = useAuth();
  const MAX_VIDEO_DURATION = 60; // seconds
  const MAX_VIDEO_SIZE_MB = 50; // MB

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.type.startsWith("video")) {
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          toast.error(`Video filesize can not exceed ${MAX_VIDEO_SIZE_MB} MB.`);
          setMedia(null);
          setPreviewUrl(null);
          return;
        }
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 60) {
            toast.error("Video Duration can not exceed 1 minute");
            setMedia(null);
            setPreviewUrl(null);
          } else {
            setMedia(file);
            setPreviewUrl(URL.createObjectURL(file));
            setText("");
            setMode("media");
          }
        };
        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith("image")) {
        setMedia(file);
        setPreviewUrl(URL.createObjectURL(file));
        setText("");
        setMode("media");
      }
    }
  };

  const handleCreateStory = async () => {
  const media_type = mode === "media" 
    ? media.type.startsWith("image") ? "image" : "video" 
    : "text";

  if (media_type === "text" && !text) {
    toast.error("Please enter some text");
    return;
  }

  let formData = new FormData();
  formData.append("content", text);
  formData.append("media_type", media_type);
  formData.append("media", media);
  formData.append("background_color", background);

  const token = await getToken();
  try {
    const response = await api.post("/api/story/create", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Check if response.data exists and has success property
    if (response.data && response.data.success) {
      setShowModal(false);
      toast.success("Story created successfully");
      fetchStories();
    } else {
      toast.error(response.data?.message || "Failed to create story");
    }
  } catch (error) {
    console.error("Error creating story:", error);
    toast.error(error.message || "An error occurred while creating the story");
  }
};
  return (
    <div className="fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex justify-center p-4 overflow-y-auto items-start pt-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowModal((prev) => !prev)}
            className="text-white p-2 cursor-pointer"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10"></span>
        </div>

        {/* Make height responsive */}
        <div
          className="rounded-lg h-72 sm:h-96 flex items-center justify-center relative"
          style={{ backgroundColor: background }}
        >
          {mode === "text" && (
            <textarea
              className="bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none"
              placeholder="What's on your mind?"
              onChange={(e) => setText(e.currentTarget.value)}
              value={text}
            />
          )}
          {mode === "media" &&
            previewUrl &&
            (media?.type.startsWith("image") ? (
              <img
                src={previewUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={previewUrl}
                className="w-full h-full object-cover"
                controls
              />
            ))}
        </div>

        {/* Color buttons */}
        <div className="flex mt-4 gap-2 flex-wrap">
          {bgColors.map((color) => (
            <button
              key={color}
              className="w-6 h-6 rounded-full ring cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setBackground(color)}
            />
          ))}
        </div>

        {/* Mode buttons */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "text" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <TextIcon size={18} /> Text
          </button>

          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "media" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <input
              type="file"
              accept="image/*, video/*"
              className="hidden"
              onChange={(e) => {
                handleMediaUpload(e);
                
              }}
            />
            <Upload size={18} /> Photo/Video
          </label>
        </div>

        {/* Submit button */}
        <button
          onClick={() =>
            toast.promise(handleCreateStory(), {
              loading: "Saving...",
              
            })
          }
          className="flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer"
        >
          <Sparkle size={18} /> Create Story
        </button>
      </div>
    </div>
  );
};

export default StoryModal;
