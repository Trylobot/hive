#The Hive CLI

  Usage: `$ node hive-cli.js [options] [command]`

  Commands:

    list-ai
       List all registered Hive AI modules and their statuses

    add-local-ai [name] [local-path]
       Register a new local AI module (javascript/node.js only) (names must be globally unique)

    add-remote-ai [name] [remote-host-port]
       Register a new remote AI endpoint (host:port) (names must be globally unique)

    remove-ai [name]
       Remove a previously-registered AI of any type

    play-single-random
       Run a single match between two random AI participants selected from the available Hive AI modules

    tournament [participant-list]
       Run one full single-elimination round-robin tournament between the listed AI participants

    print-config
       Print currently resolved config options (diagnostic function)


  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -m, --use-mosquito   Use the Mosquito
    -l, --use-ladybug    Use the Ladybug
    -p, --use-pillbug    Use the Pillbug
    -d, --turn-deadline  Set the maximum turn time for any single AI turn, in milliseconds

