import axios from "axios";
import { BASE_URL } from "../utils/constants";

// ✅ Function to Fetch Collaborators for a Specific Project
export const fetchCollaborators = async (projectId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/project/${projectId}/users`, {
      withCredentials: true,  // Send cookies for authentication
    });
    return response.data.data;  // Return only the collaborators data
  } catch (error) {
    console.error("Error fetching collaborators:", error.message);
    throw error;  // Throw error to handle it in the calling component
  }
};
