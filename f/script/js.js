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
  <div class='area'>
    <div class='content'></div>
  </div>
`
windowtag.prepend(window_bar.cloneNode(true));
windowtag.appendChild(window_resizer.cloneNode(true));

const tag_workspaceIcon = document.createElement("img");
tag_workspaceIcon.classList.add("click");

{
  function afterLoad(){
    const os = document.getElementById("os");
    const workspace = document.getElementById("workspace");

    const windowList = windowtag.cloneNode(true);
    windowList.id = "list";
    windowList.style.width = (30 * rem) + "px";
    windowList.style.height = (30 * rem) + "px";
    windowList.style.top = "50%";
    windowList.style.left = os.clientWidth / 2 - (30*rem/2);

    // functions
    function tagRemove(tag){
      requestAnimationFrame(()=>{
        const css = window.getComputedStyle(tag);
        if(css.animationDuration !== "0s" || css.transitionDuration !== "0s"){
          tag.addEventListener("animationend",()=> tag.remove(), { once: true });
          tag.addEventListener("transitionend",()=> tag.remove(), { once: true });
        }else{
          setTimeout(()=>{
            if(tag) tag.remove();
          }, 3000);
        }
      });
    } 
    function workspace_iconAdd(tag){
      const icon = workspace.children ;
      const tId = tag.id ;
      if(()=>{
        for(const t of icon){
          if(t.id == tId) return true ;
        }
        return false ;
      }){
        let originalLeft = [];
        const fullcount = icon.length ;
        for(let c = 0 ; c < fullcount ; c++){
          originalLeft[c] = icon[c].offsetLeft ;
        }
        tag.style.opacity = "0";
        tag.style.transform = "translateY(" + (5 * rem) + "px)";
        workspace.appendChild(tag);
        for(let c = 0 ; c < fullcount ; c++){
          icon[c].style.transition = "none";
          icon[c].style.transform = "translateX(" + (originalLeft[c] - icon[c].offsetLeft) + "px)" ;
        }
        requestAnimationFrame(()=>{
          for(let c = 0 ; c < fullcount ; c++){
            icon[c].addEventListener("transitionend", ()=>{
              icon[c].style.transition = "";
            },{ once: true }
          );
            icon[c].style.transition = "transform 0.5s cubic-bezier(0.5,0.5,0,1.3)" ;
            icon[c].style.transform = "" ;
          }
            tag.style.transition = "transform 0.5s cubic-bezier(0,1,0.5,1), opacity 0.1s ease";
            tag.style.transitionDelay = "0.2s";
            tag.style.opacity = "";
            tag.style.transform = "";
            tag.addEventListener("transitionend",()=>{
              tag.style.transition = "";
            },{ once: true }
          );
        }); 
      } 
    }
    function workspace_iconRemove(tag){
      tag.style.transition = "transform 0.3s cubic-bezier(0.8,0.1,0.9,0.5), opacity 0.3s step-end";
      tag.style.transform = "translateY(" + (5 * rem) + "px)";
      tag.style.opacity = "0";
      
      const icon = Array.from(workspace.children).filter(child => child !== tag);
      const fullcount = icon.length;
      let originalLeft = [];
      for(let c = 0 ; c < fullcount ; c++){
        originalLeft[c] = icon[c].offsetLeft ;
      }

      requestAnimationFrame(()=>{
        tag.addEventListener("transitionend",()=> {
          tag.remove();
          for(let c = 0; c < fullcount; c++){
            icon[c].style.transition = "none";
            icon[c].style.transform = "translateX(" + (originalLeft[c] - icon[c].offsetLeft) + "px)";
          }
          requestAnimationFrame(()=>{
            for(let c = 0 ; c < fullcount ; c++){
              icon[c].addEventListener("transitionend", ()=>{
                icon[c].style.transition = "";
              },{ once: true }
              );
              icon[c].style.transition = "transform 0.5s cubic-bezier(0.5,0.1,0.2,0.2)" ;
              icon[c].style.transform = "" ;
            }
          }); 
        },{ once: true });
      });
    }
    function window_open(id){
      const exist = document.getElementById(id);
      if(!exist){
        let tagNew;
        switch(id){
          case "browser":{
            tagNew = windowtag.cloneNode(true);
            tagNew.id = "browser";
            tagNew.getElementsByClassName("content")[0].id = "content_main";
            os.appendChild(tagNew);
          } break;
          case "list":{
            tagNew = windowList.cloneNode(true);
            os.appendChild(tagNew);
          }
        }
        zindexOrder(tagNew);
      }else zindexOrder(exist);
    }
    function window_close(tag){
      tag.style.transition = "opacity 0.5s ease";
      tag.style.opacity = "0";
      if(!tag.id == "list"){
        for(const t of workspace.children){
          if(t.dataset.windowId == tag.id) workspace_iconRemove(t);
        }
      }
      tagRemove(tag);
    }
    function browser_open(url){
      let browser = document.getElementById("browser");
      if(!browser){
        window_open("browser");
        browser = document.getElementById("browser");
      }

      history.pushState({page: window.location.href} , "" , url);
      let inner, title;
      fetch(url).
      then(response => response.text()).
      then(html => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        let content = dom.getElementById("content_main");
        title = dom.title;
        if(content) inner = content.innerHTML; 
        else{
          content = dom.getElementById("os").getElementsByClassName("content")[0];
          if(content) inner = content.innerHTML;
          else{
            title = "404";
            fetch("/404.html").then(response => response.text()).then(html =>{
              const ppp = new DOMParser();
              const ddd = parser.parseFromString(html, "text/html");
              const nnn = ddd.getElementById("content_main");
              inner = (nnn) ? nnn.innerHTML : "<p>404</p>";
            });
          }
        }
        document.title = title;
        browser.getElementsByClassName("content")[0].innerHTML = inner;
      });
    }


    // start, check windows
    {
      const windowFirst = os.getElementsByClassName("window");
      let urlHere = window.location.href;
      history.replaceState({ page: urlHere },"", urlHere);
      let mainExist = false;
      for(const tag of windowFirst){
        if(!tag.getElementsByClassName("bar")[0]){
          tag.insertBefore(window_bar.cloneNode(true),tag.firstChild); //.cloneNode(true)
        }
        tag.appendChild(window_resizer.cloneNode(true));
        if(tag.id == "browser") mainExist = true ;
      }
      if(!mainExist) windowFirst[0].id = "browser";
    }
    const windowMain = document.getElementById("browser");
    
    if(windowMain){
      if(!document.getElementById("icon_workspace_main")){
        const main = tag_workspaceIcon.cloneNode(true);
        main.src = "/f/visual/icon_folder.svg";
        main.dataset.windowId = "browser";
        main.classList.add("click");
        workspace_iconAdd(main);
      }
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

      let dragStartX, dragStartY, dragStartWidth, dragStartHeight, dragStartTop, dragStartLeft;
      let dragXPaddingW, dragYPaddingN, dragXPaddingE, dragYPaddingS;
      let dragResizeDirection;
      let dragDirectionN, dragDirectionS, dragDirectionW, dragDirectionE;

      function reset(){
        targetTag = null;
        mode = [];
      }
      function zindexOrder(target){
        if(target){
          const rest = os.getElementsByClassName("window");
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
          zindexOrder(parentWindow,);

          if(classList.contains("click")){
            mode[0] = 1;
            if(classList.contains("x")){
              mode[1] = 4;
              targetTag = event.target.closest(".window");
            }else{
              mode[1] = 1;
              targetTag = clickStartTag;
              if(targetTag.tagName === "A"){
                targetTag.addEventListener("click",(e)=>{ e.preventDefault(); });
              }
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
                    const wid = targetTag.dataset.windowId;
                    if(wid){
                      switch(wid){
                        default: window_open(wid);
                      }
                    }else{
                      if(targetTag.tagName === "A"){
                        browser_open(targetTag.href);
                      }
                    }
                }break;
                case 4:{
                  window_close(targetTag);
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
    
    // go back
    window.addEventListener("popstate", (event)=>{
      if(event.state) browser_open(event.state.page);
      else location.reload();
    });
  }

  if((document.readyState === "loading")) document.addEventListener("DOMContentLoaded", afterLoad);
  else afterLoad();


}