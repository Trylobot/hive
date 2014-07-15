/*
GREETINGS request
  this request type is used to establish the identity of a remote AI module
  and also to inform the module about the semantic version string of the system.
*/

// example request structure sent from the game core to an AI module
{
  request_type: "GREETINGS",
  system_version: "0.0.1"
}
// example response structure sent back to the server for the above request
{
  response_type: "GREETINGS",
  name: "Rando[m]",
  version: "0.0.1",
  author: "T.W.R. Cole",
  project_url: "https://github.com/user/project",
  language: "Javascript"
}
