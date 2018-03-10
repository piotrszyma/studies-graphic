define(
  ['./wrapper', './interpreter'], 
  ( domWrapper, interpreter ) => {
    
    domWrapper.input.addEventListener('keydown', ( event ) => {
      if (event.which === 13 && event.target.value !== "") {
        const command = event.target.value;
        if (command.indexOf(";") !== -1) {
          const commands = command.trim().split(/\s*;\s*/).filter((c) => c !== '');
          commands.forEach((c) => interpreter.interpret(c));
        } else {
          interpreter.interpret(command);
        }
        domWrapper.input.value = "";
        domWrapper.output.scrollTop = domWrapper.output.scrollHeight;
      }
    });

    return {};
});