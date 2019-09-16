  //get the canvas that Processing-js will use
  var canvas = document.getElementById("mycanvas"); 
  //pass the function sketchProc (defined in myCode.js) to Processing's constructor.
  import {sketchProc} from "./jumpingjan.js";
  var processingInstance = new Processing(canvas, sketchProc); 