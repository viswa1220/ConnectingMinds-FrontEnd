import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firbase";
import dayjs from "dayjs";
export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });
        setProfile(res.data);
        setEditData(res.data);
      } catch {
        setError("Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function handleEditToggle() {
    setIsEditing((prev) => {
      if (prev && profile) setEditData(profile);
      return !prev;
    });
    // Clear any previously selected file
    setProfileImageFile(null);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  }

  function handleArrayFieldChange(field, index, value) {
    setEditData((prev) => {
      const arr = [...(prev[field] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  }

  function handleAddField(field) {
    setEditData((prev) => {
      const arr = [...(prev[field] || [])];
      arr.push("");
      return { ...prev, [field]: arr };
    });
  }

  function handleRemoveField(field, index) {
    setEditData((prev) => {
      const arr = [...(prev[field] || [])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  }

  // New: Handle file selection for profile picture update
  function handleFileChange(e) {
    setProfileImageFile(e.target.files[0]);
  }

  // New: Upload profile picture if a new file is selected.
  const uploadProfilePicture = async () => {
    if (!profileImageFile) return editData.photoUrl; // Use existing URL if no new file
    const fileName = `profileImages/${profileImageFile.name}`;
    const fileRef = ref(storage, fileName);
    try {
      const existingUrl = await getDownloadURL(fileRef);
      const useExisting = window.confirm(
        "Image already exists. Do you want to use the existing image?"
      );
      if (useExisting) {
        return existingUrl;
      } else {
        const newFileRef = ref(
          storage,
          `profileImages/${Date.now()}_${profileImageFile.name}`
        );
        await uploadBytes(newFileRef, profileImageFile);
        return await getDownloadURL(newFileRef);
      }
    } catch (err) {
      // If file does not exist, upload it.
      await uploadBytes(fileRef, profileImageFile);
      return await getDownloadURL(fileRef);
    }
  };

  async function handleSave() {
    try {
      let photoUrl = editData.photoUrl;
      if (profileImageFile) {
        photoUrl = await uploadProfilePicture();
      }
      const {
        firstName,
        lastName,
        age,
        gender,
        experience,
        about,
        skills,
        interests,
      } = editData;
      const payload = {
        firstName,
        lastName,
        age,
        gender,
        experience,
        photoUrl,
        about,
        skills,
        interests,
      };
      await axios.patch(`${BASE_URL}/profile/edit`, payload, {
        withCredentials: true,
      });
      setProfile({ ...profile, ...payload });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch {
      alert("Failed to update profile.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral text-white">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral text-white">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral text-white">
        <p>No profile data found.</p>
      </div>
    );
  }

  const displayData = isEditing ? editData : profile;
  const joinedDate = profile?.createdAt
    ? dayjs(profile.createdAt).format("DD MMM YYYY")
    : "N/A";
  return (
    <div className=" bg-[#8F8AC3] text-white py-10 px-6 flex justify-center">
      <div className="w-full max-w-4xl bg-white text-[#4B4896] rounded-xl shadow-lg p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <button
            onClick={handleEditToggle}
            className="px-4 py-2 bg-[#4B4896] text-white rounded-md hover:bg-[#3A3778] transition shadow"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Profile Image & Basic Info */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={displayData.photoUrl || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-40 h-40 object-cover rounded-full border-4 border-[#4B4896]"
            />
            {isEditing && (
              <div className="mt-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Update Profile Photo:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered w-full"
                />
              </div>
            )}
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "First Name", key: "firstName" },
              { label: "Last Name", key: "lastName" },
              { label: "Gender", key: "gender" },
              { label: "Age", key: "age", type: "number" },
              { label: "Experience", key: "experience", type: "number" },
              { label: "Email", key: "emailId", readOnly: true },
              { label: "Joined Date", key: "joinedDate", readOnly: true },
            ].map(({ label, key, type, readOnly }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">
                  {label}:
                </label>
                {isEditing && !readOnly ? (
                  <input
                    type={type || "text"}
                    name={key}
                    value={editData[key] || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                  />
                ) : (
                  <p className="text-gray-700">
                    {key === "joinedDate"
                      ? joinedDate
                      : displayData[key] || "N/A"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">About:</label>
          {isEditing ? (
            <textarea
              name="about"
              value={editData.about || ""}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
              rows="3"
            />
          ) : (
            <p className="text-gray-700">
              {displayData.about || "No description available."}
            </p>
          )}
        </div>

        {/* Skills & Interests */}
        {[
          { label: "Skills", key: "skills" },
          { label: "Interests", key: "interests" },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-sm text-gray-600 mb-1">{label}:</label>
            {isEditing ? (
              <>
                {(editData[key] || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        handleArrayFieldChange(key, i, e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                    />
                    <button
                      onClick={() => handleRemoveField(key, i)}
                      className="bg-red-500 text-white px-2 py-1 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddField(key)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md"
                >
                  Add {label}
                </button>
              </>
            ) : displayData[key]?.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {displayData[key].map((item, idx) => (
                  <li
                    key={idx}
                    className="bg-blue-300 text-blue-900 px-3 py-1 text-xs rounded-full"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">No {label.toLowerCase()} added.</p>
            )}
          </div>
        ))}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-4">
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#4B4896] text-white rounded-md hover:bg-[#3A3778] transition"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
