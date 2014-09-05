#Hive AI in Node.js

This is the easiest way to get started quickly. 

1. Look at [this reference implementation](../ai/her/hive-ai-her.js) and [accompanying package.json](../ai/her/package.json) to get a feel for the basic structure.
2. Create a new folder in the `ai` directory at the root of the project
3. In your new folder (I'll call it new-ai) create a **new-ai.js** and a **package.json**
4. In the **package.json**, the following fields should be considered required: *name*, *active*, *version*, *long_name*, *module*, *description*
5. In the **new-ai.js**, you must *export* a `function` called `process_message`, taking one argument: the `message` object.
6. Your AI will be expected to return a response message, just like the ones in [this API specification document](../api/hive_api_v0.1.0_doc.js).
7. Before trying to run your AI, make sure the *active* property in the *package.json* is set to true.
8. Now it should be all ready to go. You can either run it through the [hive-cli](hive-cli.md) to pit it against other AI and see how it fares, or play against it yourself in the [node-webkit-ui](hive-node-webkit.md). In either mode, it is recommended you use **Local** mode as communications have less overhead, but feel free to test with **Remote** (TCP) as well, if you're curious. 

