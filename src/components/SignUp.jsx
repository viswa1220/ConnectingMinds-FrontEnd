import React, { useEffect, useState } from "react";
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

  // If user is logged in, ask to logout before showing signup form.
  useEffect(() => {
    if (user) {
      const confirmLogout = window.confirm(
        "You are already logged in. Do you want to log out to create a new account?"
      );
      if (confirmLogout) {
        axios
          .post(`${BASE_URL}/logout`, {}, { withCredentials: true })
          .then(() => {
            dispatch(removeUser());
          })
          .catch((err) => {
            alert("Failed to logout. Please try again.");
            navigate("/");
          });
      } else {
        navigate("/");
      }
    }
  }, [user, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleNext = () => {
    // Validate that all mandatory fields in step 1 are filled.
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

  const handleSubmit = async () => {
    // Validate that all mandatory fields in step 2 are filled (image is optional)
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100 text-white">
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
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="emailId"
              placeholder="Email"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.emailId}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.age}
              onChange={handleChange}
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
            <select
              name="gender"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-4"
            />
            <textarea
              name="about"
              placeholder="About You"
              className="textarea textarea-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.about}
              onChange={handleChange}
              required
            ></textarea>
            <input
              type="text"
              name="experience"
              placeholder="Experience (in years)"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.experience}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="techStack"
              placeholder="Tech Stack (comma separated)"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.techStack}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="skills"
              placeholder="Skills (comma separated)"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.skills}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="interests"
              placeholder="Interests (comma separated)"
              className="input input-bordered w-full mb-4 bg-base-100 text-white"
              value={formData.interests}
              onChange={handleChange}
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
