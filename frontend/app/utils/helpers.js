"use client";

// Compare MongoDB ObjectIds or their string representations
export const isSameUser = (id1, id2) => {
  if (!id1 || !id2) return false;
  
  // Convert to strings if they aren't already
  const strId1 = typeof id1 === 'object' ? id1.toString() : id1;
  const strId2 = typeof id2 === 'object' ? id2.toString() : id2;
  
  return strId1 === strId2;
}; 