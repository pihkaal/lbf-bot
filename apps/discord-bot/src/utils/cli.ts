type Mode = { type: "bot" } | { type: "user"; channelId: string };

export const parseArgs = (args: string[]): Mode => {
  let mode: Mode = { type: "bot" };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "-u":
      case "--as-user": {
        const channelId = args[(i += 1)];

        if (!channelId) {
          console.error(`ERROR: ${arg} requires a channel ID`);
          process.exit(1);
        }

        mode = { type: "user", channelId };

        break;
      }

      default: {
        console.error(`ERROR: Unrecognized argument: '${arg}'`);
        process.exit(1);
      }
    }
  }

  return mode;
};
