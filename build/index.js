module.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([function(e,t){e.exports=require("react")},function(e,t,n){"use strict";n.r(t);var r=n(0);function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{},r=Object.keys(n);"function"==typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(n).filter(function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),r.forEach(function(t){i(e,t,n[t])})}return e}function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function u(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=[],r=!0,o=!1,i=void 0;try{for(var u,c=e[Symbol.iterator]();!(r=(u=c.next()).done)&&(n.push(u.value),!t||n.length!==t);r=!0);}catch(e){o=!0,i=e}finally{try{r||null==c.return||c.return()}finally{if(o)throw i}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}var c=function(){return Math.max(window.document.documentElement.clientWidth,window.innerWidth||0)},l=function(){return Math.max(window.document.documentElement.clientHeight,window.innerHeight||0)},a={listeners:new Set,state:{vpWidth:c(),vpHeight:l()},onResize:function(e,t){this.state={vpWidth:e,vpHeight:t};var n=!0,r=!1,o=void 0;try{for(var i,u=this.listeners[Symbol.iterator]();!(n=(i=u.next()).done);n=!0){(0,i.value)({vpWidth:e,vpHeight:t})}}catch(e){r=!0,o=e}finally{try{n||null==u.return||u.return()}finally{if(r)throw o}}}};window.addEventListener("resize",function(){a.onResize(c(),l())}),t.default=function(e){var t=u(Object(r.useState)(function(){return o({},a.state)}),2),n=t[0],i=n.vpWidth,c=n.vpHeight,l=t[1],f=Object(r.useMemo)(function(){a.listeners.delete(f);var t=void 0;return e?function(n){t&&clearTimeout(t),t=setTimeout(function(){return l(o({},n))},e)}:function(e){return l(o({},e))}},[e,l]);return Object(r.useEffect)(function(){var e=a.listeners;return e.add(f),function(){return e.delete(f)}},[]),[i,c]}}]);