import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firbase";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../utils/userSlice";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  // Form states
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
    age: "",
    gender: "male",
    about: "",
    experience: "",
    techStack: "",
    skills: "",
    interests: "",
    photoUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      setAlreadyLoggedIn(true);
    } else {
      setAlreadyLoggedIn(false);
    }
  }, [user]);

  // Handler for file input change
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Handler to move from step 1 to step 2 (validate required fields)
  const handleNext = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.emailId ||
      !formData.password ||
      !formData.age
    ) {
      setError("Please fill in all required fields for Step 1.");
      return;
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  // Handler to go back to the previous step
  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const convertCommaSeparatedToArray = (str) =>
    str ? str.split(",").map((s) => s.trim()).filter((s) => s) : [];

  // This function checks if the selected image already exists in Firebase.
  // If it does, it asks whether to use the existing image.
  // If the user opts not to use it, a new unique name is generated and the file is uploaded.
  const ensureFileUrl = async () => {
    if (!imageFile) return "";
    const fileName = `profileImages/${imageFile.name}`;
    const fileRef = ref(storage, fileName);
    try {
      const existingUrl = await getDownloadURL(fileRef);
      const useExisting = window.confirm(
        "Image already exists. Do you want to use the existing image?"
      );
      if (useExisting) {
        return existingUrl;
      } else {
        const newFileRef = ref(storage, `profileImages/${Date.now()}_${imageFile.name}`);
        await uploadBytes(newFileRef, imageFile);
        return await getDownloadURL(newFileRef);
      }
    } catch (err) {
      // If file doesn't exist, upload it.
      await uploadBytes(fileRef, imageFile);
      return await getDownloadURL(fileRef);
    }
  };

  // Handler to submit the signup form
  const handleSubmit = async () => {
    if (
      !formData.about ||
      !formData.experience ||
      !formData.techStack ||
      !formData.skills ||
      !formData.interests
    ) {
      setError("Please fill in all required fields for Step 2.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const photoUrl = await ensureFileUrl();
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailId: formData.emailId,
        password: formData.password,
        age: formData.age,
        gender: formData.gender,
        photoUrl: photoUrl,
        about: formData.about,
        experience: formData.experience,
        skills: convertCommaSeparatedToArray(formData.skills),
        techStack: convertCommaSeparatedToArray(formData.techStack),
        interests: convertCommaSeparatedToArray(formData.interests),
      };
      await axios.post(`${BASE_URL}/signup`, payload);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If a user is already logged in, show a message instead of the signup form.
  if (alreadyLoggedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-100 text-white">
        <div className="bg-neutral shadow-lg rounded-md w-full max-w-md p-6">
          <h2 className="text-xl font-bold mb-4 text-center">
            You are already logged in.
          </h2>
          <div className="flex justify-center">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/feed")}
            >
              Go to Feed
            </button>
          </div>
          <p className="text-center mt-4">
            Or, if you want to create a new account, please logout first.
          </p>
        </div>
      </div>
    );
  }

  // Render signup form if no user is logged in.
  return (
    <div className="flex justify-center items-center mt-8 bg-base-100 text-white">
      <div className="bg-neutral shadow-lg rounded-md w-full max-w-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Sign Up</h2>
        <p className="text-center mb-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>

        {step === 1 && (
          <div>
            <label className="block mb-1 text-sm font-medium">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter your first name"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              required
            />

            <label className="block mb-1 text-sm font-medium">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter your last name"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              required
            />

            <label className="block mb-1 text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              name="emailId"
              placeholder="Enter your email"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.emailId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, emailId: e.target.value }))
              }
              required
            />

            <label className="block mb-1 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />

            <label className="block mb-1 text-sm font-medium">
              Age
            </label>
            <input
              type="number"
              name="age"
              placeholder="Enter your age"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.age}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, age: e.target.value }))
              }
              required
            />

            {error && <p className="text-error text-center mb-4">{error}</p>}
            <button
              className="btn btn-primary w-full"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block mb-1 text-sm font-medium">
              Gender
            </label>
            <select
              name="gender"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.gender}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, gender: e.target.value }))
              }
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>

            <label className="block mb-1 text-sm font-medium">
              Upload Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-4"
            />

            <label className="block mb-1 text-sm font-medium">
              About You
            </label>
            <textarea
              name="about"
              placeholder="Tell us about yourself"
              className="textarea textarea-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.about}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, about: e.target.value }))
              }
              required
            ></textarea>

            <label className="block mb-1 text-sm font-medium">
              Experience (in years)
            </label>
            <input
              type="text"
              name="experience"
              placeholder="Enter your experience"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.experience}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, experience: e.target.value }))
              }
              required
            />

            <label className="block mb-1 text-sm font-medium">
              Tech Stack (comma separated)
            </label>
            <input
              type="text"
              name="techStack"
              placeholder="e.g., React, Node.js, MongoDB"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.techStack}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, techStack: e.target.value }))
              }
              required
            />

            <label className="block mb-1 text-sm font-medium">
              Skills (comma separated)
            </label>
            <input
              type="text"
              name="skills"
              placeholder="e.g., Problem Solving, Communication"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.skills}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, skills: e.target.value }))
              }
              required
            />

            <label className="block mb-1 text-sm font-medium">
              Interests (comma separated)
            </label>
            <input
              type="text"
              name="interests"
              placeholder="e.g., Music, Sports, Coding"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.interests}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, interests: e.target.value }))
              }
              required
            />

            {error && <p className="text-error text-center mb-4">{error}</p>}
            <div className="flex justify-between">
              <button
                className="btn btn-secondary"
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
