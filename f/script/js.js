const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

const osPadding = 1 * rem;

const window_bar = document.createElement("div");
window_bar.classList.add("bar","grab");
window_bar.innerHTML = `
  <img class='x click' src='/f/visual/button_x.svg' alt='close' role='button'>
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
const windowtag = document.createElement("div");
windowtag.classList.add("window");
windowtag.innerHTML = `
  <div class='content'></div>
`
windowtag.prepend(window_bar.cloneNode(true));
windowtag.appendChild(window_resizer.cloneNode(true));

const windowList = windowtag.cloneNode(true);


{
  function afterLoad(){
    const os = document.getElementById("os");


    const windowFirst = document.getElementsByClassName("window");
    for(const tag of windowFirst){
      if(!tag.getElementsByClassName("bar")[0]){
        tag.insertBefore(window_bar.cloneNode(true),tag.firstChild); //.cloneNode(true)
      }
      tag.appendChild(window_resizer.cloneNode(true));
    }

    // open window
    {
    }


    // window transform 
    {
      const windowSizeMin = 15 * rem;

      let targetTag;
      let osWidth, osHeight;

      let mode = [];
      // [0] 1 = click, 2 = drag
      // [1] click( 1 = open, 4 = close )
      // [1] drag( 1 = move, 2 = resize )

      let clickStartTag;
      let openTarget;
      let instance = new Set();

      let dragStartX, dragStartY, dragStartWidth, dragStartHeight, dragStartTop, dragStartLeft;
      let dragXPaddingW, dragYPaddingN, dragXPaddingE, dragYPaddingS;
      let dragResizeDirection;
      let dragDirectionN, dragDirectionS, dragDirectionW, dragDirectionE;

      function reset(){
        targetTag = null;
        mode = [];
      }
      function tagRemove(tag){
        const css = window.getComputedStyle(tag);
        if(css.animationDuration !== "0s" && css.transitionDuration !== "0s"){
          tag.addEventListener("animationed",()=> tag.remove(), { once: true });
          tag.addEventListener("transitioned",()=> tag.remove(), { once: true });
        }else{
          setTimeout(()=>{
            if(tag) tag.remove();
          }, 3000);
        }
      } 
      function zindexOrder(target,rest){
        if(target){
          for(const tag of rest){
            tag.style.zIndex = (tag==target) ? 3 : 2;
          }
        }
      }

      os.addEventListener("mousedown",(event)=>{
        clickStartTag = event.target;
        const classList = clickStartTag.classList;

        if(event.button === 0){
          let parentWindow = clickStartTag.closest(".window");
          const instanceWindow = os.getElementsByClassName("window");
          zindexOrder(parentWindow, instanceWindow);

          if(classList.contains("click")){
            mode[0] = 1;
            if(classList.contains("x")){
              mode[1] = 4;
              targetTag = event.target.parentNode.parentNode;
            }else if(classList.contains("open")){
              mode[1] = 1;
              openTarget = event.target.dataset.open;
            }
          }else if(classList.contains("grab")){
            mode[0] = 2;
            if(event.target.parentNode.classList.contains("resizer")){
              mode[1] = 2;
              targetTag = event.target.parentNode.parentNode;
              dragResizeDirection = event.target.classList[0];
            }else if(event.target.classList.contains("bar")){
              mode[1] = 1;
              targetTag = event.target.parentNode;
            }
          }
          if(mode[0]>0){
            event.preventDefault();
            switch(mode[0]){
              case 1:{
                clickStartTag.classList.add("pressed");
              }break;
              case 2:{
                dragStartX = event.clientX;
                dragStartY = event.clientY;
                dragStartTop = targetTag.offsetTop;
                dragStartLeft = targetTag.offsetLeft;
                dragStartWidth = targetTag.offsetWidth;
                dragStartHeight = targetTag.offsetHeight;
                osWidth = os.clientWidth;
                osHeight = os.clientHeight;

                switch(mode[1]){
                  case 1:{
                    dragXPaddingE = osWidth - dragStartWidth - osPadding;
                    dragYPaddingS = osHeight - dragStartHeight - osPadding;
                  }break;
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
                    const css = window.getComputedStyle(targetTag);
                    dragXMin = dragStartWidth - (css.minWidth?parseFloat(css.minWidth):windowSizeMin);
                    dragYMin = dragStartHeight - (css.minHeight?parseFloat(css.minHeight):windowSizeMin);
                  }break;
                }
              }break;
            }
          }
        }
      });
      os.addEventListener("mousemove",(event)=>{
        if(targetTag){
          const dragXMove = event.clientX - dragStartX;
          const dragYMove = event.clientY - dragStartY;
          switch(mode[1]){
            case 1:{
              let x = Math.max(osPadding, Math.min(dragXMove + dragStartLeft, dragXPaddingE));
              let y = Math.max(osPadding, Math.min(dragYMove + dragStartTop, dragYPaddingS));
              targetTag.style.left = x + "px";
              targetTag.style.top = y + "px";
            }break;
            case 2:{
              if(dragDirectionN){
                let y = (dragYMove < 0) ? (Math.max(dragYMove, dragYPaddingN)) : (Math.min(dragYMove, dragYMin));
                targetTag.style.height = dragStartHeight - y + "px";
                targetTag.style.top = dragStartTop + y + "px";
              }else if(dragDirectionS){
                let y = Math.min(dragYMove, dragYPaddingS);
                targetTag.style.height = dragStartHeight + y + "px";
              }
              if(dragDirectionW){
                let x = (dragXMove < 0) ? (Math.max(dragXMove, dragXPaddingW)) : (Math.min(dragXMove, dragXMin));
                targetTag.style.width = dragStartWidth - x + "px";
                targetTag.style.left = dragStartLeft + x  + "px";
              }else if(dragDirectionE){
                let x = Math.min(dragXMove, dragXPaddingE);
                targetTag.style.width = dragStartWidth + x + "px";
              }
            }break;
          }
        }
      });
      os.addEventListener("mouseup",(event)=>{
        switch(mode[0]){
          case 1:{
            clickStartTag.classList.remove("pressed");
            if(event.target == clickStartTag){
              switch(mode[1]){
                case 1:{
                  if(!instance.has("list")){
                    os.appendChild(windowList);
                  }
                }break;
                case 4:{
                  targetTag.classList.add("close");
                  tagRemove(targetTag);
                }
              }
            }
          }break;
        }
        reset();
      });
      os.addEventListener("mouseleave",()=>{
        switch(mode[0]){
          case 1:{
            reset();
          }break;
        }
      });
    }
  }

  if((document.readyState === "loading")) document.addEventListener("DOMContentLoaded", afterLoad);
  else afterLoad();


}