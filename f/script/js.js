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


    const windowFirst = document.getElementsByClassName("window");
    for(const tag of windowFirst){
      if(!tag.getElementsByClassName("bar")[0]){
        tag.insertBefore(window_bar,tag.firstChild); //.cloneNode(true)
      }
      tag.appendChild(window_resizer);
    }



    {
      const dragContainer = document.body;
      let dragTag;
      let dragStartX, dragStartY, dragStartWidth, dragStartHeight, dragStartTop, dragStartLeft;
      let xMax, yMax;
      let dragMode = 0; // 1 - move, 2 - resize
      let dragResizeDirection;
      dragContainer.addEventListener("mousedown",(event)=>{
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
            switch(dragMode){
              case 1:{
                xMax = dragContainer.clientWidth - dragTag.offsetWidth;
                yMax = dragContainer.clientHeight - dragTag.offsetHeight;
              } break;
              case 2:{
                dragStartWidth = dragTag.offsetWidth;
                dragStartHeight = dragTag.offsetHeight;
              } break;
            }
          }
        }
      });
      dragContainer.addEventListener("mousemove",(event)=>{
        if(dragTag){
          const dragXMove = event.clientX - dragStartX;
          const dragYMove = event.clientY - dragStartY;
          switch(dragMode){
            case 1:{
              let x = Math.max(0, Math.min(dragXMove + dragStartLeft,xMax));
              let y = Math.max(0, Math.min(dragYMove + dragStartTop,yMax));
              dragTag.style.left = x + "px";
              dragTag.style.top = y + "px";
            } break;
            case 2:{
              let n = false, s = false, w = false, e = false;
              switch(dragResizeDirection){
                case "nw": n = true; w = true; break;
                case "ne": n = true; e = true; break;
                case "sw": s = true; w = true; break;
                case "se": s = true; e = true; break;
                case "n": n = true; break;
                case "s": s = true; break;
                case "w": w = true; break;
                case "e": e = true; break;
              }
              if(n){
                dragTag.style.height = dragStartHeight - dragYMove + "px";
                dragTag.style.top = dragStartTop + dragYMove + "px";
              }else if(s){
                dragTag.style.height = dragStartHeight + dragYMove + "px";
              }
              if(w){
                dragTag.style.width = dragStartWidth - dragXMove + "px";
                dragTag.style.left = dragStartLeft + dragXMove  + "px";
              }else if(e){
                dragTag.style.width = dragStartWidth + dragXMove + "px";
              }
            } break;
          }
        }
      });
      dragContainer.addEventListener("mouseup",()=>{ dragTag = null; });
    }
  }

  if((document.readyState === "loading")) document.addEventListener("DOMContentLoaded", afterLoad);
  else afterLoad();


}