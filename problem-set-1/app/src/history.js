define(() => {
  let history = [],
    currentIndex = -1;
  const older = () => {
    if (history.length === 0) return '';
    currentIndex = currentIndex === history.length - 1 ? history.length - 1 : currentIndex + 1;
    return history[currentIndex];
  }

  const younger = () => {
    currentIndex = currentIndex === -1 ? -1 : currentIndex - 1;
    return currentIndex === -1 ? '' : history[currentIndex];
  }

  const add = (command) => {
    history = [command, ...history];
  }

  const newest = () => {
    currentIndex = 0;
  }

  return {
    older,
    younger,
    add,
    newest
  }
});