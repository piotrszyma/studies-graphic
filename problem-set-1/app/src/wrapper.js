define(() => {
  const [status, input, pane, output] = ['status', 'input', 'pane', 'output']
    .map(e => document.getElementById(e));

  return {
    status,
    input,
    pane,
    output
  }
});