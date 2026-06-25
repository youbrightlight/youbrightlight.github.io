const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

const osPadding = 1 * rem;

const windowtag = document.createElement("div");
windowtag.classList.add("windowtag");
windowtag.innerHTML = `
  <div class='content'></div>
`
const window_bar = document.createElement("div");
window_bar.classList.add("bar","grab");
window_bar.innerHTML = `
  <img class='x' src='/f/visual/button_x.svg' alt='close' role='button'>
`
const window_resizer = document.createElement("div");
window_resizer.classList.add("resizer");
window_resizer.innerHTML = `
  <div class='n grab'></div>
  <div class='s grab'></div>
  <div class='w grab'></div>
  <div class='e grab'></div>
  <div class='nw grab'></div>
  <div class='ne grab'></div>
  <div class='sw grab'></div>
  <div class='se grab'></div>
`


{
  function afterLoad(){
    const os = document.getElementById("os");


    const windowFirst = document.getElementsByClassName("window");
    for(const tag of windowFirst){
      if(!tag.getElementsByClassName("bar")[0]){
        tag.insertBefore(window_bar,tag.firstChild); //.cloneNode(true)
      }
      tag.appendChild(window_resizer);
    }


    // window transform 
    {
      const windowSizeMin = 15 * rem;

      //drag
      { 
        let dragTag;
        let dragStartX, dragStartY, dragStartWidth, dragStartHeight, dragStartTop, dragStartLeft;
        let osWidth, osHeight;
        let dragXPaddingW, dragYPaddingN, dragXPaddingE, dragYPaddingS;
        let dragMode = 0; // 1 - move, 2 - resize
        let dragResizeDirection;
        let dragDirectionN, dragDirectionS, dragDirectionW, dragDirectionE;
        os.addEventListener("mousedown",(event)=>{
          if(event.target.classList.contains("grab")){
            event.preventDefault();
            if(event.target.parentNode.classList.contains("resizer")){
              dragMode = 2;
              dragTag = event.target.parentNode.parentNode;
              dragResizeDirection = event.target.classList[0];
            }else if(event.target.classList.contains("bar")){
              dragMode = 1;
              dragTag = event.target.parentNode;
            }
            if(dragTag){
              dragStartX = event.clientX;
              dragStartY = event.clientY;
              dragStartTop = dragTag.offsetTop;
              dragStartLeft = dragTag.offsetLeft;
              dragStartWidth = dragTag.offsetWidth;
              dragStartHeight = dragTag.offsetHeight;
              osWidth = os.clientWidth;
              osHeight = os.clientHeight;

              switch(dragMode){
                case 1:{
                  dragXPaddingE = osWidth - dragStartWidth - osPadding;
                  dragYPaddingS = osHeight - dragStartHeight - osPadding;
                } break;
                case 2:{
                  dragDirectionN = false, dragDirectionS = false, dragDirectionW = false, dragDirectionE = false;
                  switch(dragResizeDirection){
                    case "nw": dragDirectionN = true; dragDirectionW = true; break;
                    case "ne": dragDirectionN = true; dragDirectionE = true; break;
                    case "sw": dragDirectionS = true; dragDirectionW = true; break;
                    case "se": dragDirectionS = true; dragDirectionE = true; break;
                    case "n": dragDirectionN = true; break;
                    case "s": dragDirectionS = true; break;
                    case "w": dragDirectionW = true; break;
                    case "e": dragDirectionE = true; break;
                  }
                  dragXPaddingW = 0 - dragStartLeft + osPadding;
                  dragXPaddingE = osWidth - (dragStartLeft + dragStartWidth) - osPadding;
                  dragYPaddingN = 0 - dragStartTop + osPadding;
                  dragYPaddingS = osHeight - (dragStartTop + dragStartHeight) - osPadding;
                  dragXMin = dragStartWidth - windowSizeMin;
                  dragYMin = dragStartHeight - windowSizeMin;
                } break;
              }
            }
          }
        });
        os.addEventListener("mousemove",(event)=>{
          if(dragTag){
            const dragXMove = event.clientX - dragStartX;
            const dragYMove = event.clientY - dragStartY;
            switch(dragMode){
              case 1:{
                let x = Math.max(osPadding, Math.min(dragXMove + dragStartLeft, dragXPaddingE));
                let y = Math.max(osPadding, Math.min(dragYMove + dragStartTop, dragYPaddingS));
                dragTag.style.left = x + "px";
                dragTag.style.top = y + "px";
              } break;
              case 2:{
                if(dragDirectionN){
                  let y = (dragYMove < 0) ? (Math.max(dragYMove, dragYPaddingN)) : (Math.min(dragYMove, dragYMin));
                  dragTag.style.height = dragStartHeight - y + "px";
                  dragTag.style.top = dragStartTop + y + "px";
                }else if(dragDirectionS){
                  let y = Math.min(dragYMove, dragYPaddingS);
                  dragTag.style.height = dragStartHeight + y + "px";
                }
                if(dragDirectionW){
                  let x = (dragXMove < 0) ? (Math.max(dragXMove, dragXPaddingW)) : (Math.min(dragXMove, dragXMin));
                  dragTag.style.width = dragStartWidth - x + "px";
                  dragTag.style.left = dragStartLeft + x  + "px";
                }else if(dragDirectionE){
                  let x = Math.min(dragXMove, dragXPaddingE);
                  dragTag.style.width = dragStartWidth + x + "px";
                }
              } break;
            }
          }
        });
        os.addEventListener("mouseup",()=>{ dragTag = null; });
      }
    }
  }

  if((document.readyState === "loading")) document.addEventListener("DOMContentLoaded", afterLoad);
  else afterLoad();


}