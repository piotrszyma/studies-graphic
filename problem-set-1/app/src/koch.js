define(() => {
  let KOCH_CACHE = {}

  const kochRecursive = (length, currentLevel, targetLevel) => {
    if (targetLevel === 1) {
      return length;
    } else if (targetLevel === currentLevel) {
      return length / 3;
    } else {
      if (KOCH_CACHE[currentLevel]) return KOCH_CACHE[currentLevel];
      const returned = kochRecursive(length / 3, currentLevel + 1, targetLevel);
      KOCH_CACHE[currentLevel] = returned;    
      const result = Array.isArray(returned) ? returned : [returned]
      return [
        ...result,
        "-60", 
        ...result,
        "120", 
        ...result,
        "-60", 
        ...result
      ]
    }
  }
  
  
  const generate = ({length, level}) => {
    const returned = kochRecursive(length, 1, level);
    const result = Array.isArray(returned) ? returned : [returned]
    KOCH_CACHE = {}
    return [
      ...result,
      "120", 
      ...result, 
      "120", 
      ...result, 
      "120"
    ]
  }
  return {
    generate
  }  
});
