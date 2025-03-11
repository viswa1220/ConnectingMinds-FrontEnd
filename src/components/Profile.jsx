import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firbase";

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
        const newFileRef = ref(storage, `profileImages/${Date.now()}_${profileImageFile.name}`);
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
  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString()
    : "N/A";

  return (
    <div className="min-h-screen bg-neutral text-white py-8 px-4 flex justify-center">
      <div className="w-full max-w-4xl bg-base-100 text-white rounded-lg shadow-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-primary">My Profile</h1>
          <button onClick={handleEditToggle} className="btn btn-sm btn-primary">
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={displayData.photoUrl || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-40 h-40 object-cover rounded-full border-4 border-primary"
            />
            {isEditing && (
              <div className="mt-2">
                <label className="block text-sm mb-1 text-accent">
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
            <div>
              <label className="block text-sm mb-1 text-accent">First Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={editData.firstName || ""}
                  onChange={handleInputChange}
                  className="input input-bordered bg-base-200 text-white w-full"
                />
              ) : (
                <p>{displayData.firstName || "N/A"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1 text-accent">Last Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={editData.lastName || ""}
                  onChange={handleInputChange}
                  className="input input-bordered bg-base-200 text-white w-full"
                />
              ) : (
                <p>{displayData.lastName || "N/A"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1 text-accent">Gender:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="gender"
                  value={editData.gender || ""}
                  onChange={handleInputChange}
                  className="input input-bordered bg-base-200 text-white w-full"
                />
              ) : (
                <p>{displayData.gender || "N/A"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1 text-accent">Age:</label>
              {isEditing ? (
                <input
                  type="number"
                  name="age"
                  value={editData.age || ""}
                  onChange={handleInputChange}
                  className="input input-bordered bg-base-200 text-white w-full"
                />
              ) : (
                <p>{displayData.age || "N/A"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1 text-accent">Experience:</label>
              {isEditing ? (
                <input
                  type="number"
                  name="experience"
                  value={editData.experience ?? ""}
                  onChange={handleInputChange}
                  className="input input-bordered bg-base-200 text-white w-full"
                />
              ) : (
                <p>{displayData.experience ?? 0}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1 text-accent">Email:</label>
              <p>{displayData.emailId || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm mb-1 text-accent">Joined Date:</label>
              <p>{joinedDate}</p>
            </div>
          </div>
        </div>
        <hr className="my-4 border-gray-600" />
        <div>
          <label className="label text-accent">About:</label>
          {isEditing ? (
            <textarea
              name="about"
              value={editData.about || ""}
              onChange={handleInputChange}
              className="textarea textarea-bordered bg-base-200 text-white"
              rows="3"
            />
          ) : (
            <p>{displayData.about || "No description available."}</p>
          )}
        </div>
        <hr className="my-4 border-gray-600" />
        <div>
          <label className="label text-accent">Skills:</label>
          {isEditing ? (
            <>
              {(editData.skills || []).map((skill, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) =>
                      handleArrayFieldChange("skills", i, e.target.value)
                    }
                    className="input input-bordered bg-base-200 text-white flex-1"
                  />
                  <button
                    onClick={() => handleRemoveField("skills", i)}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddField("skills")}
                className="btn btn-sm btn-accent"
              >
                Add Skill
              </button>
            </>
          ) : displayData.skills && displayData.skills.length > 0 ? (
            <ul className="list-disc list-inside">
              {displayData.skills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          ) : (
            <p>No skills added.</p>
          )}
        </div>
        <hr className="my-4 border-gray-600" />
        <div>
          <label className="label text-accent">Interests:</label>
          {isEditing ? (
            <>
              {(editData.interests || []).map((interest, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={interest}
                    onChange={(e) =>
                      handleArrayFieldChange("interests", i, e.target.value)
                    }
                    className="input input-bordered bg-base-200 text-white flex-1"
                  />
                  <button
                    onClick={() => handleRemoveField("interests", i)}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddField("interests")}
                className="btn btn-sm btn-accent"
              >
                Add Interest
              </button>
            </>
          ) : displayData.interests && displayData.interests.length > 0 ? (
            <ul className="list-disc list-inside">
              {displayData.interests.map((interest, idx) => (
                <li key={idx}>{interest}</li>
              ))}
            </ul>
          ) : (
            <p>No interests added.</p>
          )}
        </div>
        {isEditing && (
          <div className="mt-4 flex gap-4 justify-end">
            <button onClick={handleEditToggle} className="btn btn-ghost">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
