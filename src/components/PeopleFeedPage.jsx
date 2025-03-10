import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const PeopleFeedPage = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeople = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/people/feed`, {
          withCredentials: true,
        });
        setPeople(res.data.data);
      } catch (err) {
        console.error("Failed to fetch people feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPeople();
  }, []);

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">People Feed</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {people.map((person) => (
            <div key={person._id} className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105">
              <img src={person.photoUrl} alt="profile" className="rounded-full mb-2 w-16 h-16 object-cover" />
              <h3 className="text-xl font-bold text-blue-700">{person.firstName} {person.lastName}</h3>
              <p className="text-gray-600 mb-1">Skills: {person.skills.join(", ")}</p>
              <p className="text-gray-600 mb-1">Experience: {person.experience} years</p>
              <p className="text-gray-600 mb-1">Interests: {person.interests.join(", ")}</p>
              <p className="text-gray-600 mb-2">{person.about}</p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">Connect</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeopleFeedPage;
