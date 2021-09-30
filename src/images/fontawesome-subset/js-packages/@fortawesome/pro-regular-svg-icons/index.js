(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global['pro-regular-svg-icons'] = {})));
}(this, (function (exports) { 'use strict';

  var prefix = "far";
  var faArrowAltDown = {
    prefix: 'far',
    iconName: 'arrow-alt-down',
    icon: [448, 512, [], "f354", "M400 208h-73.8V80c0-26.5-21.5-48-48-48H169.8c-26.5 0-48 21.5-48 48v128H48.1c-42.6 0-64.2 51.7-33.9 81.9l175.9 176c18.7 18.7 49.1 18.7 67.9 0l176-176c30-30.1 8.7-81.9-34-81.9zM224 432L48 256h121.8V80h108.3v176H400L224 432z"]
  };
  var faArrowAltUp = {
    prefix: 'far',
    iconName: 'arrow-alt-up',
    icon: [448, 512, [], "f357", "M48.048 304h73.798v128c0 26.51 21.49 48 48 48h108.308c26.51 0 48-21.49 48-48V304h73.789c42.638 0 64.151-51.731 33.941-81.941l-175.943-176c-18.745-18.745-49.137-18.746-67.882 0l-175.952 176C-16.042 252.208 5.325 304 48.048 304zM224 80l176 176H278.154v176H169.846V256H48L224 80z"]
  };
  var faCircle = {
    prefix: 'far',
    iconName: 'circle',
    icon: [512, 512, [], "f111", "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z"]
  };
  var faInfoSquare = {
    prefix: 'far',
    iconName: 'info-square',
    icon: [448, 512, [], "f30f", "M448 80v352c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V80c0-26.51 21.49-48 48-48h352c26.51 0 48 21.49 48 48zm-48 346V86a6 6 0 0 0-6-6H54a6 6 0 0 0-6 6v340a6 6 0 0 0 6 6h340a6 6 0 0 0 6-6zM224 118c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"]
  };
  var faLongArrowDown = {
    prefix: 'far',
    iconName: 'long-arrow-down',
    icon: [320, 512, [], "f175", "M300.3 327.5l-19.6-19.6c-4.8-4.8-12.5-4.7-17.1.2L186 388.8V44c0-6.6-5.4-12-12-12h-28c-6.6 0-12 5.4-12 12v344.8l-77.5-80.7c-4.7-4.8-12.4-4.9-17.1-.2l-19.6 19.6c-4.7 4.7-4.7 12.3 0 17l131.8 131.8c4.7 4.7 12.3 4.7 17 0l131.8-131.8c4.6-4.7 4.6-12.3-.1-17z"]
  };
  var faLongArrowRight = {
    prefix: 'far',
    iconName: 'long-arrow-right',
    icon: [448, 512, [], "f178", "M295.515 115.716l-19.626 19.626c-4.753 4.753-4.675 12.484.173 17.14L356.78 230H12c-6.627 0-12 5.373-12 12v28c0 6.627 5.373 12 12 12h344.78l-80.717 77.518c-4.849 4.656-4.927 12.387-.173 17.14l19.626 19.626c4.686 4.686 12.284 4.686 16.971 0l131.799-131.799c4.686-4.686 4.686-12.284 0-16.971L312.485 115.716c-4.686-4.686-12.284-4.686-16.97 0z"]
  };
  var faLongArrowUp = {
    prefix: 'far',
    iconName: 'long-arrow-up',
    icon: [320, 512, [], "f176", "M19.716 184.485l19.626 19.626c4.753 4.753 12.484 4.675 17.14-.173L134 123.22V468c0 6.627 5.373 12 12 12h28c6.627 0 12-5.373 12-12V123.22l77.518 80.717c4.656 4.849 12.387 4.927 17.14.173l19.626-19.626c4.686-4.686 4.686-12.284 0-16.971L168.485 35.716c-4.686-4.686-12.284-4.686-16.971 0L19.716 167.515c-4.686 4.686-4.686 12.284 0 16.97z"]
  };
  var faTrashAlt = {
    prefix: 'far',
    iconName: 'trash-alt',
    icon: [448, 512, [], "f2ed", "M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z"]
  };
  var _iconsCache = {
    faArrowAltDown: faArrowAltDown,
    faArrowAltUp: faArrowAltUp,
    faCircle: faCircle,
    faInfoSquare: faInfoSquare,
    faLongArrowDown: faLongArrowDown,
    faLongArrowRight: faLongArrowRight,
    faLongArrowUp: faLongArrowUp,
    faTrashAlt: faTrashAlt
  };

  exports.far = _iconsCache;
  exports.prefix = prefix;
  exports.faArrowAltDown = faArrowAltDown;
  exports.faArrowAltUp = faArrowAltUp;
  exports.faCircle = faCircle;
  exports.faInfoSquare = faInfoSquare;
  exports.faLongArrowDown = faLongArrowDown;
  exports.faLongArrowRight = faLongArrowRight;
  exports.faLongArrowUp = faLongArrowUp;
  exports.faTrashAlt = faTrashAlt;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
