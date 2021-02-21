module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 238:
/***/ ((__unused_webpack_module, exports) => {

exports.run = function(payload) {
    // If event is fired in pull request.
    if(payload.pull_request) return;

    const action = payload.action;

    if (action === "created") {
        parse.call(this, payload);
    }
};

function parse(payload) {
    const data = payload.comment;
    const commenter = data.user.login;
    const body = data.body;
    const username = this.cfg.botName;

    if (commenter === username || !body) return;

    const prefix = RegExp(`@${username} +(\\w+)( +(--\\w+|"[^"]+"))*`, "g");
    const parsed = body.match(prefix);
    if (!parsed) return;
  
    parsed.forEach(command => {
      const codeBlocks = [`\`\`\`\r\n${command}\r\n\`\`\``, `\`${command}\``];
      if (codeBlocks.some(block => body.includes(block))) return;
      const [, keyword] = command.replace(/\s+/, " ").split(" ");
      const args = command.replace(/\s+/, " ").split(" ").slice(2).join(" ");
      const file = this.commands.get(keyword);
  
      if (file) {
        file.run.apply(this, [payload, commenter, args]);
      }
    });
}

// exports.getConfig = function () {

// };

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __nccwpck_require__(238);
/******/ })()
;