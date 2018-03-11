define(
  ['./wrapper', './interpreter'],
  (domWrapper, interpreter) => {
    domWrapper.input.addEventListener('keydown', (event) => {
      if (event.which === 13 && event.target.value !== "") {
        const command = event.target.value;
        if (command.indexOf(";") !== -1) {
          const commands = command.trim().split(/\s*;\s*/).filter((c) => c !== '');
          try {
            commands.forEach((c) => interpreter.interpret({ command: c }));
          } catch (error) {
            domWrapper.print("Invalid command");
            console.error(error);
          }
        } else {
          try {
            interpreter.interpret({ command: command });
          } catch (error) {
            domWrapper.print("Invalid command");
            console.error(error);
          }
        }
        domWrapper.input.value = "";
        domWrapper.output.scrollTop = domWrapper.output.scrollHeight;
      }
    });

    document.addEventListener('keydown', (event) => {
      switch(event.which) {
        case 37:
          interpreter.interpret({command: 'rotate 15', silent: true});
          break;
        case 38:
          interpreter.interpret({command: 'move 150', silent: true});
          break;
        case 39:
          interpreter.interpret({command: 'rotate -15', silent: true});
          break;
        case 40:
          interpreter.interpret({command: 'rotate 180', silent: true});
        default:
          break;
      }
    });
  });