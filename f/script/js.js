const windowtag = document.createElement("div");
windowtag.classList.add("windowtag");
windowtag.innerHTML = `
  <div class='content'></div>
`
const window_bar = document.createElement("div");
window_bar.classList.add("bar");
window_bar.innerHTML = `
  <img class='x' src='/f/visual/button_x.svg' alt='close' role='button'>
`
const window_resizer = document.createElement("div");
window_resizer.classList.add("resizer");
window_resizer.innerHTML = `
  <div class='top'></div>
  <div class='bottom'></div>
  <div class='left'></div>
  <div class='right'></div>
`


{
  function afterLoad(){


    const windowFirst = document.getElementsByClassName("window");
    console.log(windowFirst);
    for(const tag of windowFirst){
      if(!tag.getElementsByClassName("bar")[0]){
        tag.insertBefore(window_bar,tag.firstChild); //.cloneNode(true)
      }
      tag.appendChild(window_resizer);
    }



    {
      const dragContainer = document.body;
      let dragTag;
      let dragStartX, dragStartY;
      let xMax, yMax;
      dragContainer.addEventListener("mousedown",(event)=>{
        if(event.target.classList.contains("bar")){
          dragTag = event.target.parentNode;
        }
        if(dragTag){
          dragStartX = event.clientX - dragTag.offsetLeft;
          dragStartY = event.clientY - dragTag.offsetTop;
          xMax = dragContainer.clientWidth - dragTag.offsetWidth;
          yMax = dragContainer.clientHeight - dragTag.offsetHeight;
        }
      });
      dragContainer.addEventListener("mousemove",(event)=>{
        if(dragTag){
          let x = Math.max(0, Math.min(event.clientX - dragStartX,xMax));
          let y = Math.max(0, Math.min(event.clientY - dragStartY,yMax));
          dragTag.style.left = x + "px";
          dragTag.style.top = y + "px";
        }
      });
      dragContainer.addEventListener("mouseup",()=>{ dragTag = null; });
    }
  }

  if((document.readyState === "loading")) document.addEventListener("DOMContentLoaded", afterLoad);
  else afterLoad();


}