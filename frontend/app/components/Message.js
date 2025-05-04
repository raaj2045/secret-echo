"use client";

export default function Message({ message, currentUser }) {
  // Determine if message is from current user
  const isFromUser = message.receiver === "ai";
  
  // Format timestamp with fallback
  const formatTime = (timestamp) => {
    if (!timestamp) return "just now";
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "just now";
    }
  };
  
  // Get initials for avatar
  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "??";
  };
  
  // Add optimistic message styling
  const isOptimistic = message.isOptimistic === true;
  
  return (
    <div className={`flex mb-4 ${isFromUser ? 'justify-end' : 'justify-start'}`}>
      {!isFromUser && (
        <div 
          className="h-10 w-10 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0"
          style={{ backgroundColor: "#3B82F6" }}
        >
          AI
        </div>
      )}
      
      <div className={`max-w-[70%] group`}>
        <div className={`relative px-4 py-2 rounded-lg ${
          isFromUser 
            ? `bg-indigo-600 text-white rounded-br-none ${isOptimistic ? 'opacity-70' : ''}`
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
        }`}>
          <p>{message.content}</p>
        </div>
        <div className={`text-xs mt-1 text-gray-500 ${isFromUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.createdAt)}
        </div>
      </div>
      
      {isFromUser && (
        <div 
          className="h-10 w-10 rounded-full flex items-center justify-center text-white ml-3 flex-shrink-0"
          style={{ backgroundColor: currentUser?.avatarColor || "#9333EA" }}
        >
          {getInitials(currentUser?.username)}
        </div>
      )}
    </div>
  );
}