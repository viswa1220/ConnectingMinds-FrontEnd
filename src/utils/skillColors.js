// utils/skillColors.js

const colors = [
    "from-red-400 to-red-500",
    "from-blue-400 to-blue-500",
    "from-green-400 to-green-500",
    "from-yellow-400 to-yellow-500",
    "from-purple-400 to-purple-500",
    "from-pink-400 to-pink-500",
    "from-indigo-400 to-indigo-500",
    "from-teal-400 to-teal-500",
    "from-gray-400 to-gray-500",
    "from-orange-400 to-orange-500",
  ];
  
  /**
   * Generates a consistent color gradient for a given skill name.
   * @param {string} skillName - The skill name.
   * @returns {string} - Tailwind CSS gradient class.
   */
  export const getSkillColor = (skillName) => {
    let hash = 0;
    
    // Convert skill name to a numeric hash
    for (let i = 0; i < skillName.length; i++) {
      hash = skillName.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    // Ensure index stays within available colors
    const index = Math.abs(hash) % colors.length;
  
    return `bg-gradient-to-r ${colors[index]} text-white`;
  };
  