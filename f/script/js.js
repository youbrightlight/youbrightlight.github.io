{
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

  const osPadding = 1 * rem;

  const device_pointer = 
    (window.matchMedia("(any-pointer: coarse) and (not (any-pointer: fine))").matches)
    ? false : true 
 ;

  function domGet(html){
    const parser = new DOMParser();
    return dom = parser.parseFromString(html, "text/html");
  }

  // tag

  const window_tag = document.createElement("div");
  window_tag.classList.add("window");
  window_tag.innerHTML = `
    <div class='area'>
      <div class='content'></div>
    </div>
  `

  const window_tag_bar = document.createElement("div");
  window_tag_bar.classList.add("bar","grab");
  window_tag_bar.innerHTML = `
    <h1></h1>
    <img class='click close' src='/f/visual/button_x.svg' alt='close' role='button'>
  `

  window_tag.prepend(window_tag_bar);


  {
    function afterLoad(){
      const os = document.getElementById("os");
      if(os){
        const workspace = document.getElementById("workspace");

        function workspace_iconAdd(id){
          const icon = workspace.children;
          if(()=>{
            for(const t of icon){
              if(t.id == id) return true;
            }
            return false;
          }){
            const iconTable = {
              "browser" : "/f/visual/icon_explorer.svg" ,
              "list" : "/f/visual/icon_folder.svg" ,
              "media" : "/f/visual/icon_media.svg"
            }

            const tag = document.createElement("img");
            tag.classList.add("click");
            tag.dataset.windowId = id;
            tag.src = iconTable[id];

            let originalLeft = [];
            const fullcount = icon.length;
            for(let c = 0 ; c < fullcount ; c++){
              originalLeft[c] = icon[c].offsetLeft;
            }
            tag.style.opacity = "0";
            tag.style.transform = "translateY(" + (5 * rem) + "px)";
            workspace.appendChild(tag);
            for(let c = 0 ; c < fullcount ; c++){
              icon[c].style.transition = "none";
              icon[c].style.transform = "translateX(" + (originalLeft[c] - icon[c].offsetLeft) + "px)";
            }
            requestAnimationFrame(()=>{
              for(let c = 0 ; c < fullcount ; c++){
                icon[c].addEventListener("transitionend", ()=>{
                  icon[c].style.transition = "";
                },{ once: true });
                icon[c].style.transition = "transform 0.5s cubic-bezier(0.5,0.5,0,1.3)";
              }
              tag.addEventListener("transitionend",()=>{
                tag.style.transition = "";
              },{ once: true });
              tag.style.transition = "transform 0.5s cubic-bezier(0,1,0.5,1), opacity 0.1s ease";
              tag.style.transitionDelay = "0.2s";
              requestAnimationFrame(()=>{
                for(const i of icon) i.style.transform = "";
                tag.style.opacity = "";
                tag.style.transform = "";
              });
            }) ; 
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
            originalLeft[c] = icon[c].offsetLeft;
          }

          requestAnimationFrame(()=>{
            tag.addEventListener("transitionend",()=> {
              tag.remove();
              for(let c = 0 ; c < fullcount; c++){
                icon[c].style.transition = "none";
                icon[c].style.transform = "translateX(" + (originalLeft[c] - icon[c].offsetLeft) + "px)";
              }
              requestAnimationFrame(()=>{
                for(let c = 0 ; c < fullcount ; c++){
                  icon[c].addEventListener("transitionend", ()=>{
                    icon[c].style.transition = "";
                    icon[c].style.transform = "";
                  },{ once: true });

                  icon[c].style.transition = "transform 0.3s cubic-bezier(0.5,0.1,0.2,0)";

                  requestAnimationFrame(()=>{
                    for(let c = 0 ; c < fullcount ; c++){
                      icon[c].style.transform = "none";
                    }
                  }) ; 
                }
              });
            },{ once: true });
          });
        }

        if(device_pointer){
          os.dataset.pointer = "true";

          let pointer1Check = false;

          // tags

          const window_tag_maximize = document.createElement("img");
          window_tag_maximize.classList.add("click","maximize");
          window_tag_maximize.src = "/f/visual/icon_maximize.svg";
          window_tag_maximize.alt = "maximize";
          window_tag_maximize.role = "button";
          const window_tag_resizer = document.createElement("div");
          window_tag_resizer.classList.add("resizer");
          window_tag_resizer.innerHTML = `
            <div class='n grab'></div>
            <div class='s grab'></div>
            <div class='w grab'></div>
            <div class='e grab'></div>
            <div class='nw grab'></div>
            <div class='ne grab'></div>
            <div class='sw grab'></div>
            <div class='se grab'></div>
          `

          // functions

          function url_state(url){
            const domainReg = "https?\:\/\/" + window.location.host.replace(/\./g,"\\.").replace(/:/g,"\\:");
            switch(true){
              case (new RegExp(domainReg + "(?:$|\\/.*)")).test(url): return "root" ; break;
              case (new RegExp(domainReg + "\\/list\\.html[^\\/]*")).test(url): return "list" ; break;
              default: return url;
            }
          }
          function url_move(url){
            history.pushState({page: url_state(window.location.href)} , "" , url);
          }
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
          function window_open( id , parameter ){
            let tag = document.getElementById(id);
            if(!tag){
              switch(id){
                case "browser":{
                  tag = window_tag.cloneNode(true);
                  tag.getElementsByClassName("bar")[0].appendChild(window_tag_maximize.cloneNode(true));
                  tag.appendChild(window_tag_resizer.cloneNode(true));
                  tag.id = "browser";
                  tag.getElementsByClassName("content")[0].id = "content_main";
                  tag.style.width = (os.width * 0.8) + "px";
                  tag.style.height = "auto";
                  tag.style.top = (os.height * 0.2) + "px";
                  tag.style.left = (os.width * 0.2) + "px";
                  os.appendChild(tag);
                  workspace_iconAdd("browser");
                } break;
                case "list":{
                  tag = window_tag.cloneNode(true);
                  tag.appendChild(window_tag_resizer.cloneNode(true));
                  tag.id = "list";
                  tag.style.width = (30 * rem) + "px";
                  tag.style.height = (30 * rem) + "px";
                  tag.style.top = "50%";
                  tag.style.left = os.clientWidth / 2 - (30*rem/2);
                  os.appendChild(tag);
                } break;
                case "media":{
                  if(parameter){
                    tag = window_tag.cloneNode(true);
                    tag.appendChild(window_tag_resizer.cloneNode(true));
                    tag.getElementsByClassName("bar")[0].appendChild(window_tag_maximize.cloneNode(true));
                    tag.id = "media";
                    tag.style.width = (os.width * 0.8) + "px";
                    tag.style.height = "auto";
                    tag.style.top = (os.height * 0.2) + "px";
                    tag.style.left = (os.width * 0.2) + "px";
                    os.appendChild(tag);
                    workspace_iconAdd("media");
                  };
                } break;
              }

              tag.style.opacity = "0";
              tag.style.transition = "none";
              requestAnimationFrame(()=>{
                tag.addEventListener( "transitionend" , ()=>{
                  tag.style.transition = "";
                  tag.style.opactiy = "";
                });

                tag.style.transition = "opacity 0.5s ease";

                requestAnimationFrame(()=>{
                  tag.style.opacity = "1";
                });
              });
              zindexOrder(tag);
            }else zindexOrder(tag);
            switch(id){
              case "browser":{
                  if(parameter){
                  url_move(parameter);
                  let inner, title;
                  fetch(parameter).
                  then(response => response.text()).
                  then(html => {
                    const dom = domGet(html);
                    let content = dom.getElementById("content_main");
                    let titleContent = dom.getElementsByTagName("TITLE")[0].textContent;
                    title = titleContent ? titleContent : null;
                    if(content){
                      inner = content.innerHTML;
                    }else{
                      content = dom.getElementById("os").getElementsByClassName("content")[0];
                      if(content) inner = content.innerHTML;
                      else{
                        title = "404";
                        fetch("/404.html").then(response => response.text()).then(html =>{
                          const nnn = domGet(html).getElementById("content_main");
                          inner = (nnn) ? nnn.innerHTML : "<p>404</p>";
                        });
                      }
                    }
                    document.title = title;
                    tag.getElementsByTagName("H1")[0].textContent = title;
                    tag.getElementsByClassName("content")[0].innerHTML = inner;
                  });
                }
              } break;
              case "list": {
                let listUrl;
                if(!parameter) listUrl = "/list";
                else listUrl = parameter.trim();
                fetch(listUrl).then(response => response.text()).then(html =>{
                  tag.getElementsByClassName("content")[0].innerHTML = domGet(html).getElementsByClassName("content")[0].innerHTML;
                });
              } break;
              case "media":{
                if(parameter){
                  if(parameter.trim()[0] === "<"){
                    tag.getElementsByClassName("content")[0].innerHTML = parameter;
                  }else{
                    fetch(parameter).then(response=>response.text()).then(html=>{
                      const dom = domGet(html);
                      contentTag = dom.getElementsByClassName("content")[0];
                      tag.getElementsByClassName("content")[0].innerHTML = contentTag.innerHTML;
                      const ratio = contentTag.dataset.ratio;
                      if(ratio) tag.getElementsByClassName("content")[0].style.aspectRatio = ratio;
                    });
                  }
                }
              }
            }
          }
          function window_close(tag){
            tag.style.transition = "opacity 0.5s ease";
            tag.style.opacity = "0";
            if(tag.id != "list"){
              for(const t of workspace.children){
                if(t.dataset.windowId == tag.id) workspace_iconRemove(t);
              }
            }
            if(tag.id === "browser") url_move("/") ; 
            tagRemove(tag);
          }
          function window_maximize(tag){
            const cl = tag.classList;
            if(!cl.contains("maximized")){
              cl.add("maximized");
              tag.style.width = "100%";
              tag.style.height = "100%";
              tag.style.top = 0;
              tag.style.left = 0;
              tag.getElementsByClassName("bar")[0].classList.remove("grab");
            }else{
              cl.remove("maximized");
              tag.style.width = "";
              tag. style.height = "";
              tag.style.top = "";
              tag.style.left = "";
              tag.getElementsByClassName("bar")[0].classList.add("grab");
            }
          }

          // start, check windows

          let listInner;
          {
            let urlHere = window.location.href;
            history.replaceState({ page: url_state(urlHere) },"", urlHere);

            fetch("/list").then( response => response.text() ).then( html => {
              const parser = new DOMParser;
              const dom = parser.parseFromString(html, "text/html");
              let contentTag = dom.getElementsByClassName("content")[0];
              if(contentTag) listInner = contentTag.innerHTML;
              else listInner = "<p>Error</p>";
            });

          }

          const windowFirst = os.getElementsByClassName("window");
          if(windowFirst.length > 0){
            let mainExist = false;
            for(const tag of windowFirst){
              let barTag = tag.getElementsByClassName("bar")[0];
              if(barTag.length === 0){
                barTag = window_tag_bar.cloneNode(true);
                tag.prepend(barTag);
              }
              let titleTag = tag.getElementsByTagName("H1");
              if(titleTag.length === 0){
                titleTag = document.createElement("h1");
                titleTag.textContent = document.title;
                barTag.prepend(titleTag);
              }else if(titleTag.firstChild === null){
                titleTag.textContent = document.title;
              }
              barTag.appendChild(window_tag_maximize);
              tag.appendChild(window_tag_resizer.cloneNode(true));
              if(tag.id == "browser") mainExist = true;
            }
            if(!mainExist) windowFirst[0].id = "browser";

            if(document.getElementById("browser")){
              if(!document.getElementById("icon_workspace_main")){
                workspace_iconAdd("browser");
              }
            }
          }

          // window transform 
          {
            const windowSizeMin = 30 * rem;

            let targetTag;
            let osWidth, osHeight;

            let mode = [];
            // [0] 1 = click, 2 = drag
            // [1] click( 1 = open, 4 = close, 5 = maximize )
            // [1] drag( 1 = move, 2 = resize )

            let clickStartTag;

            let dragStartX, dragStartY, dragStartWidth, dragStartHeight, dragStartTop, dragStartLeft;
            let dragXPaddingW, dragYPaddingN, dragXPaddingE, dragYPaddingS;
            let dragXMin, dragYMin;
            let dragResizeDirection;
            let dragDirectionN, dragDirectionS, dragDirectionW, dragDirectionE;
            let aspectRatio = [];
            let aspectRatioSum;
            let aspectRatioXFixed, aspectRatioYFixed;
            let dragXPaddingSum, dragYPaddingSum, dragXMinSum, dragYMinSum;
            let dragBiMax;
            let dragXMinY, dragYMinX;

            const freeze = (event)=>{ event.preventDefault(); }
            function reset(){
              if(targetTag){
                if(clickStartTag.tagName === "A") clickStartTag.removeEventListener("click",freeze,true);
                targetTag = null;
                mode = [];
                aspectRatio = [];
                os.classList.remove("using");
              }
            }
            function zindexOrder(target){
              let order = [];
              if(target){
                const rest = Array.from(os.getElementsByClassName("window")).filter(tag=>{ return tag !== target });
                rest.sort((t1,t2)=>{
                  const t1Z = window.getComputedStyle(t1).zIndex;
                  const t2Z = window.getComputedStyle(t2).zIndex;
                  return (
                    (t1Z==='auto' || t1Z==='')?
                      0 : parseInt(t1Z,10)
                  ) - (
                    (t2Z==='auto' || t2Z==='')?
                      0 : parseInt(t2Z,10)
                  );
                });
                rest.push(target);
                for(let i = 0 ; i < rest.length ; i++){
                  rest[i].style.zIndex = i + 10;
                }
              }
            }

            os.addEventListener("pointerdown",(event)=>{
              clickStartTag = event.target;
              const classList = clickStartTag.classList;

              const parentWindow = clickStartTag.closest(".window");
              zindexOrder(parentWindow);

              if(event.button === 0){
                os.classList.add("using");
                if(clickStartTag.tagName === "A"){
                  clickStartTag.addEventListener( "click" , freeze);
                  mode[0] = 1;
                  mode[1] = 1;
                  targetTag = clickStartTag;
                }
                if(classList.contains("click")){
                  mode[0] = 1;
                  if(classList.contains("close")){
                    mode[1] = 4;
                    targetTag = parentWindow;
                  }else if(classList.contains("maximize")){
                    mode[1] = 5;
                    targetTag = parentWindow;
                  }else{
                    mode[1] = 1;
                    targetTag = clickStartTag;
                  }
                }else if(classList.contains("grab")){
                  mode[0] = 2;
                  if(clickStartTag.closest(".resizer")){
                    mode[1] = 2;
                    targetTag = clickStartTag.closest(".window");
                    dragResizeDirection = clickStartTag.classList[0];
                  }else if(classList.contains("bar")){
                    mode[1] = 1;
                    targetTag = clickStartTag.parentNode;
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
                          const css = window.getComputedStyle(targetTag);
                          const targetTagMinWidth = parseInt(css.minWidth);
                          const targetTagMinHeight = parseInt(css.minHeight);
                          switch(dragResizeDirection){
                            case "nw":{
                              dragDirectionN = true; dragDirectionW = true;

                              dragYPaddingN = 0 - dragStartTop + osPadding;
                              dragXPaddingW = 0 - dragStartLeft + osPadding;
                              dragYMin = dragStartHeight - ((targetTagMinWidth>0)?targetTagMinHeight:windowSizeMin);
                              dragXMin = dragStartWidth - ((targetTagMinWidth>0)?targetTagMinWidth:windowSizeMin);
                            }break;
                            case "ne":{
                              dragDirectionN = true ; dragDirectionE = true;

                              dragYPaddingN = 0 - dragStartTop + osPadding;
                              dragXPaddingE = osWidth - (dragStartLeft + dragStartWidth) - osPadding;
                              dragYMin = dragStartHeight - ((targetTagMinWidth>0)?targetTagMinHeight:windowSizeMin);
                              dragXMin = 0 - (dragStartWidth - ((targetTagMinWidth>0)?targetTagMinWidth:windowSizeMin));
                            }break;
                            case "sw":{
                              dragDirectionS = true ; dragDirectionW = true;

                              dragYPaddingS = osHeight - (dragStartTop + dragStartHeight) - osPadding;
                              dragXPaddingW = 0 - dragStartLeft + osPadding;
                              dragYMin = 0 - (dragStartHeight - ((targetTagMinWidth>0)?targetTagMinHeight:windowSizeMin));
                              dragXMin = dragStartWidth - ((targetTagMinWidth>0)?targetTagMinWidth:windowSizeMin);
                            }break;
                            case "se":{
                              dragDirectionS = true; dragDirectionE = true;

                              dragYPaddingS = osHeight - (dragStartTop + dragStartHeight) - osPadding;
                              dragXPaddingE = osWidth - (dragStartLeft + dragStartWidth) - osPadding;
                              dragYMin = 0 - (dragStartHeight - ((targetTagMinWidth>0)?targetTagMinHeight:windowSizeMin));
                              dragXMin = 0 - (dragStartWidth - ((targetTagMinWidth>0)?targetTagMinWidth:windowSizeMin));
                            }break;
                            case "n":{
                              dragDirectionN = true;

                              dragYPaddingN = 0 - dragStartTop + osPadding;
                              dragYMin = dragStartHeight - ((targetTagMinWidth>0)?targetTagMinHeight:windowSizeMin);

                            }break;
                            case "s":{
                              dragDirectionS = true;

                              dragYPaddingS = osHeight - (dragStartTop + dragStartHeight) - osPadding;
                              dragYMin = 0 - (dragStartHeight - ((targetTagMinWidth>0)?targetTagMinHeight:windowSizeMin));
                            }break;
                            case "w":{
                              dragDirectionW = true ;

                              dragXPaddingW = 0 - dragStartLeft + osPadding;
                              dragXMin = dragStartWidth - ((targetTagMinWidth>0)?targetTagMinWidth:windowSizeMin);
                            }break;
                            case "e":{
                              dragDirectionE = true ;

                              dragXPaddingE = osWidth - (dragStartLeft + dragStartWidth) - osPadding;
                              dragXMin = 0 - (dragStartWidth - ((targetTagMinWidth>0)?targetTagMinWidth:windowSizeMin));
                            }break;
                          }

                          const contentTag = targetTag.getElementsByClassName("content")[0];
                          const aspectRatio_computed = getComputedStyle(contentTag).aspectRatio;
                          if(aspectRatio_computed !== "auto"){
                            aspectRatioXFixed = dragStartWidth - contentTag.offsetWidth;
                            aspectRatioYFixed = dragStartHeight - contentTag.offsetHeight;
                            [aspectRatio[0],aspectRatio[1]] = aspectRatio_computed.split("/").map(Number);
                            aspectRatioSum = aspectRatio[0] + aspectRatio[1];
                            targetTag.style.height = (dragStartWidth - aspectRatioXFixed) * aspectRatio[1] / aspectRatio[0] + aspectRatioYFixed;
                            dragXMinY = (dragStartHeight - ( (targetTagMinHeight>0)?targetTagMinHeight:windowSizeMin )) * aspectRatio[0] / aspectRatio[1];
                            dragYMinX = (dragStartWidth - ( (targetTagMinWidth>0)?targetTagMinWidth:windowSizeMin )) * aspectRatio[1] / aspectRatio[0];

                            if(dragDirectionN){
                              dragYPaddingSum = dragYPaddingN * aspectRatioSum / aspectRatio[1];
                              dragYMinSum = dragYMin * aspectRatioSum / aspectRatio[1];
                              dragBiMax = 0-(Math.min(
                                dragStartLeft - osPadding,
                                osWidth - (dragStartLeft + dragStartWidth) - osPadding
                              ) * aspectRatio[1] * 2 / aspectRatio[0]);
                            }else if(dragDirectionS){
                              dragYPaddingSum = dragYPaddingS * aspectRatioSum / aspectRatio[1];
                              dragYMinSum = dragYMin * aspectRatioSum / aspectRatio[1];
                              dragBiMax = Math.min(
                                dragStartLeft - osPadding,
                                osWidth - (dragStartLeft + dragStartWidth) - osPadding
                              ) * aspectRatio[1] * 2 / aspectRatio[0];
                            }
                            if(dragDirectionW){
                              dragXPaddingSum = dragXPaddingW * aspectRatioSum / aspectRatio[0];
                              dragXMinSum = dragXMin * aspectRatioSum / aspectRatio[0];
                              dragBiMax = 0-(Math.min(
                                dragStartTop - osPadding,
                                osHeight - dragStartTop - dragStartHeight - osPadding
                              ) * aspectRatio[0] * 2 / aspectRatio[1]) ;
                            }else if(dragDirectionE){
                              dragXPaddingSum = dragXPaddingE * aspectRatioSum / aspectRatio[0];
                              dragXMinSum = dragXMin * aspectRatioSum / aspectRatio[0];
                              dragBiMax = Math.min(
                                dragStartTop - osPadding,
                                osHeight - dragStartTop - dragStartHeight - osPadding
                              ) * aspectRatio[0] * 2 / aspectRatio[1];
                            }
                          }
                        }break;
                      }
                    }break;
                  }
                }
              }
            });
            os.addEventListener("pointermove",(event)=>{
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
                    if(!aspectRatio[1]){
                      if(dragDirectionN){
                        let y = (dragYMove < 0) ? (Math.max(dragYMove, dragYPaddingN)) : (Math.min(dragYMove, dragYMin));
                        targetTag.style.height = dragStartHeight - y + "px";
                        targetTag.style.top = dragStartTop + y + "px";
                      }else if(dragDirectionS){
                        let y = (dragYMove > 0) ? Math.min(dragYMove, dragYPaddingS) : Math.max(dragYMove, dragYMin);
                        targetTag.style.height = dragStartHeight + y + "px";
                      }
                      if(dragDirectionW){
                        let x = (dragXMove < 0) ? (Math.max(dragXMove, dragXPaddingW)) : (Math.min(dragXMove, dragXMin));
                        targetTag.style.width = dragStartWidth - x + "px";
                        targetTag.style.left = dragStartLeft + x  + "px";
                      }else if(dragDirectionE){
                        let x = (dragXMove > 0) ? Math.min(dragXMove, dragXPaddingE) : Math.max(dragXMove, dragXMin);
                        targetTag.style.width = dragStartWidth + x + "px";
                      }
                    }else{
                      if(dragDirectionN && dragDirectionW){
                        let xySum = dragXMove + dragYMove;
                        let x , y;
                        xySum = (xySum < 0)?
                          Math.max( xySum , dragYPaddingSum , dragXPaddingSum ):
                          Math.min( xySum , dragXMinSum , dragYMinSum )
                        ;
                        x = xySum * aspectRatio[0] / aspectRatioSum;
                        y = xySum * aspectRatio[1] / aspectRatioSum;

                        targetTag.style.height = dragStartHeight - y + "px";
                        targetTag.style.top = dragStartTop + y + "px";
                        targetTag.style.width = dragStartWidth - x + "px";
                        targetTag.style.left = dragStartLeft + x  + "px";
                      }else if(dragDirectionN && dragDirectionE){
                        let xySum = 0 - dragXMove + dragYMove;
                        let x , y;
                        xySum = (xySum < 0)?
                          Math.max( xySum , dragYPaddingSum , 0-dragXPaddingSum ):
                          Math.min( xySum , 0-dragXMinSum , dragYMinSum )
                        ;
                        x = xySum * aspectRatio[0] / aspectRatioSum;
                        y = xySum * aspectRatio[1] / aspectRatioSum;

                        targetTag.style.height = dragStartHeight - y + "px";
                        targetTag.style.top = dragStartTop + y + "px";
                        targetTag.style.width = dragStartWidth - x + "px";
                      }else if(dragDirectionS && dragDirectionW){
                        let xySum = dragXMove - dragYMove;
                        let x , y;
                        xySum = (xySum < 0)?
                          Math.max( xySum , 0-dragYPaddingSum , dragXPaddingSum ):
                          Math.min( xySum , dragXMinSum , 0-dragYMinSum )
                        ;
                        x = xySum * aspectRatio[0] / aspectRatioSum;
                        y = xySum * aspectRatio[1] / aspectRatioSum;

                        targetTag.style.height = dragStartHeight - y + "px";
                        targetTag.style.width = dragStartWidth - x + "px";
                        targetTag.style.left = dragStartLeft + x  + "px";
                      }else if(dragDirectionS && dragDirectionE){
                        let xySum = 0 - dragXMove - dragYMove;
                        let x , y;
                        xySum = (xySum < 0)?
                          Math.max( xySum , 0-dragYPaddingSum , 0-dragXPaddingSum ):
                          Math.min( xySum , 0-dragXMinSum , 0-dragYMinSum )
                        ;
                        x = xySum * aspectRatio[0] / aspectRatioSum;
                        y = xySum * aspectRatio[1] / aspectRatioSum;

                        targetTag.style.height = dragStartHeight - y + "px";
                        targetTag.style.width = dragStartWidth - x + "px";
                      }else if(dragDirectionN){
                        let y = (dragYMove < 0) ? (Math.max(dragYMove, dragYPaddingN, dragBiMax)) : (Math.min(dragYMove, dragYMin, dragYMinX));
                        let x = y * aspectRatio[0] / aspectRatio[1];
                        targetTag.style.height = dragStartHeight - y + "px";
                        targetTag.style.top = dragStartTop + y + "px";
                        targetTag.style.width = dragStartWidth - x  + "px";
                        targetTag.style.left = dragStartLeft + (x/2) + "px";
                      }else if(dragDirectionS){
                        let y = (dragYMove > 0) ? Math.min(dragYMove, dragYPaddingS, dragBiMax) : Math.max(dragYMove, dragYMin, 0-dragYMinX);
                        let x = y * aspectRatio[0] / aspectRatio[1];
                        targetTag.style.height = dragStartHeight + y + "px";
                        targetTag.style.width = dragStartWidth + x + "px";
                        targetTag.style.left = dragStartLeft - (x/2) + "px";
                      }else if(dragDirectionW){
                        let x = (dragXMove < 0) ? (Math.max(dragXMove, dragXPaddingW, dragBiMax)) : (Math.min(dragXMove, dragXMin, dragXMinY));
                        let y = x * aspectRatio[1] / aspectRatio[0];
                        targetTag.style.width = dragStartWidth - x + "px";
                        targetTag.style.left = dragStartLeft + x  + "px";
                        targetTag.style.height = dragStartHeight - y  + "px";
                        targetTag.style.top = dragStartTop + (y/2) + "px";
                      }else if(dragDirectionE){
                        let x = (dragXMove > 0) ? Math.min(dragXMove, dragXPaddingE, dragBiMax) : Math.max(dragXMove, dragXMin, 0-dragXMinY);
                        let y = x * aspectRatio[1] / aspectRatio[0];
                        targetTag.style.width = dragStartWidth + x + "px";
                        targetTag.style.height = dragStartHeight + y + "px";
                        targetTag.style.top = dragStartTop - (y/2) + "px";
                      }
                    }
                  }break;
                }
              }
            });
            os.addEventListener("pointerup",(event)=>{
              switch(mode[0]){
                case 1:{
                  clickStartTag.classList.remove("pressed");
                  if(event.target == clickStartTag){
                    switch(mode[1]){
                      case 1:{
                        let wid , wparameter = null;
                        const tagDatasetWindowId = targetTag.dataset.windowId;
                        if(tagDatasetWindowId) wid = tagDatasetWindowId;
                        else if(targetTag.tagName === "A") wid = "browser";
                        if(targetTag.href) wparameter = targetTag.href;
                        window_open(wid,wparameter);
                      }break;
                      case 4:{
                        window_close(targetTag);
                      } break;
                      case 5:{
                        window_maximize(targetTag);
                      } break;
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
                case 2:{
                  pointer1Check = true;
                }break;
              }
            });
          }
          os.addEventListener("mouseenter",(event)=>{
            if(pointer1Check){
              if(!(event.buttons & 1)) reset();
            }
            pointer1Check = false;
          });
        
          // go back
          window.addEventListener("popstate", (event)=>{
            const s = event.state.page;
            if(s){
              if(s == "root"){
                for(const t of os.getElementsByClassName("window")) window_close(t);
              }else if(s == "list"){
                window_open("list");
              }else window_open("browser",s);
            }
            else location.reload();
          });

        }else{ // touch
          os.dataset.pointer = "false";

          // start

          const windowFirst = os.getElementsByClassName("window");
          if(windowFirst.length > 0){
            let mainExist = false;
            for(const tag of windowFirst){
              let barTag = tag.getElementsByClassName("bar")[0];
              if(barTag.length === 0){
                barTag = window_tag_bar.cloneNode(true);
                tag.prepend(barTag);
              }
              let titleTag = tag.getElementsByTagName("H1");
              if(titleTag.length === 0){
                titleTag = document.createElement("h1");
                titleTag.textContent = document.title;
                barTag.prepend(titleTag);
              }else if(titleTag.firstChild === null){
                titleTag.textContent = document.title;
              }
              if(tag.id == "browser") mainExist = true;
            }
            if(!mainExist) windowFirst[0].id = "browser";

            if(document.getElementById("browser")){
              if(!document.getElementById("icon_workspace_main")){
                workspace_iconAdd("browser");
              }
            }
          }

          let touchStart;
          let mode = [];
          // [0] 1 = touch
          // touch [1] 4 = close
          // 1 3 = up

          os.addEventListener( "touchstart" , (event)=>{
            if(event.target.classList.contains("click")){
              mode[0] = 1;
              touchStartTag = event.target;
              if(touchStartTag.classList.contains("close")) mode[1] = 4;
              else if(touchStartTag.classList.contains("open")) mode[1] = 3;
            }
          });
          os.addEventListener( "touchend" , (event)=>{
            switch(mode[0]){
              case 1:{
                if(event.target == touchStartTag){
                  switch(mode[1]){
                    case 3:{
                      const to = touchStartTag.dataset.windowId;
                      if(to){
                        switch(to){
                          case "list": window.location.href = "/list" ; break;
                        }
                      }
                    } break;
                    case 4:{
                      window.location.href = "/";
                    } break;
                  }
                }
              } break;
            }
          });

        }
      }
    }

    if((document.readyState === "loading")) document.addEventListener("DOMContentLoaded", afterLoad);
    else afterLoad();


  }
}