Hive AI Development Tool
====

API documentation forthcoming. Support is planned for AI written in any language; communication will be asynchronous and be driven by the server; AI modules will serve as plugins and be responsible for replying to requests from the server, after an initial handshake. Communication will be performed via ZeroMQ. Data payloads will be in a serialized JSON format, and will all adhere to verifiable JSON-Schemas.

The board state will be a map of locations, where the keys correspond to hex-grid coordinates (see below):
![Hexagonal Addressing System (Layer = 0)](https://raw.githubusercontent.com/Trylobot/hive/master/doc/grid.png)
