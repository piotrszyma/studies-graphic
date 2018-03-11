define(['../config', './proxy'], (config, proxy) => {
  const interpret = ({ command, silent = false }) => {
    const [commandName, ...args] = command.split(" ");
    const parsedArgs = args
      .map((a) => {
        const number = Number(a);
        if (isNaN(number)) throw "Wrong arguments";
        return number;
      });
    proxy.interpret({
      commandName,
      args: parsedArgs,
      silent: silent
    });
  };

  return {
    interpret
  };
});