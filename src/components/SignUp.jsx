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
    str
      ? str
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [];

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
        const newFileRef = ref(
          storage,
          `profileImages/${Date.now()}_${imageFile.name}`
        );
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
    <div className="flex justify-center items-center min-h-screen bg-[#8F8AC3] text-white px-4">
      <div className="bg-white text-[#4B4896] shadow-lg rounded-lg w-full max-w-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
        <p className="text-center mb-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-[#4B4896] hover:underline">
            Login
          </Link>
        </p>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            {[
              { label: "First Name", name: "firstName", type: "text" },
              { label: "Last Name", name: "lastName", type: "text" },
              { label: "Email Address", name: "emailId", type: "email" },
              { label: "Password", name: "password", type: "password" },
              { label: "Age", name: "age", type: "number" },
            ].map(({ label, name, type }) => (
              <div key={name} className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  placeholder={`Enter your ${label.toLowerCase()}`}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:border-[#4B4896]"
                  value={formData[name]}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [name]: e.target.value }))
                  }
                  required
                />
              </div>
            ))}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <button
              className="w-full py-2 bg-[#4B4896] text-white rounded-md hover:bg-[#3A3778] transition"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            {/* Gender Selection */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:border-[#4B4896]"
                value={formData.gender}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gender: e.target.value }))
                }
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>

            {/* Profile Picture */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Upload Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-gray-800"
              />
            </div>

            {[
              {
                label: "About You",
                name: "about",
                type: "textarea",
                placeholder: "Tell us about yourself",
              },
              {
                label: "Experience (in years)",
                name: "experience",
                type: "text",
                placeholder: "Enter your experience",
              },
              {
                label: "Tech Stack (comma separated)",
                name: "techStack",
                type: "text",
                placeholder: "e.g., React, Node.js, MongoDB",
              },
              {
                label: "Skills (comma separated)",
                name: "skills",
                type: "text",
                placeholder: "e.g., Problem Solving, Communication",
              },
              {
                label: "Interests (comma separated)",
                name: "interests",
                type: "text",
                placeholder: "e.g., Music, Sports, Coding",
              },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name} className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {label}
                </label>
                {type === "textarea" ? (
                  <textarea
                    name={name}
                    placeholder={placeholder}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:border-[#4B4896]"
                    value={formData[name]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [name]: e.target.value,
                      }))
                    }
                    required
                  ></textarea>
                ) : (
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:border-[#4B4896]"
                    value={formData[name]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [name]: e.target.value,
                      }))
                    }
                    required
                  />
                )}
              </div>
            ))}

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Buttons */}
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </button>
              <button
                className="px-4 py-2 bg-[#4B4896] text-white rounded-md hover:bg-[#3A3778] transition"
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
