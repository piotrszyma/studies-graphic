define(() => {
  let history = [], currentIndex = -1;
  const older = () => {
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
  return {
    older,
    younger,
    add
  }
});
