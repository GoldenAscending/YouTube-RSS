// ==UserScript==
// @name         YouTube RSS
// @namespace    https://greasyfork.org/scripts/32384-youtuberss
// @version      0.4.0
// @description  add an rss feed link to YouTube pages
// @author       legalthan.com
// @homepage https://greasyfork.org/scripts/32384-youtube-rss
// @match        https://www.youtube.com/*
// @icon https://www.youtube.com/favicon.ico
// @updateURL https://greasyfork.org/scripts/32384-youtube-rss/code/YouTube%20RSS.user.js
// @supportURL https://github.com/GoldenAscending/YouTube-RSS/issues
// @grant        none
// @noframes
// ==/UserScript==

/* how to work
MutationObserver pages
check url
find rss button (if no)>
generate rss link
find subscribe button
add rss icon before subscribe button

//url user
https://www.youtube.com/user/NationalGeographic/
//user rss link
https://www.youtube.com/feeds/videos.xml?user=USERNAME

//url channel 
https://www.youtube.com/channel/UCpVm7bg6pXKo1Pr6k5kxG9A
//channel rss link
https://www.youtube.com/feeds/videos.xml?channel_id=CHANNELID

//playlist
https://www.youtube.com/feeds/videos.xml?playlist_id=xxx

//some old style
https://www.youtube.com/channel/UCiDJtJKMICpb9B1qf7qjEOA

*/

let y2brss_lo; //location

let y2brss_check_url = function(){
    try
    {
        //当前url
        y2brss_lo = document.location;
        if(y2brss_lo.href.indexOf('https://www.youtube.com/user/') == 0 || 
        y2brss_lo.href.indexOf('https://www.youtube.com/channel/') == 0 ||
        y2brss_lo.href.indexOf('https://www.youtube.com/watch') == 0)
        {
            return y2brss_check_rss_button(); // check rss button
        }
    }catch(e)
    {
        console.log("error"+e);
    }
    
}

let y2brss_check_rss_button = function(){
    try{
        let rss_sytle = "old";
        //订阅按钮
        let bfb =                            document.querySelectorAll("#subscribe-button > ytd-subscribe-button-renderer > paper-button"); //new
        if(bfb.length!=0) {rss_sytle = 'new'}//rss button style
        if(bfb.length==0) bfb = document.querySelectorAll("button[class^='yt-uix-button yt-uix-button-size-default yt-uix-button-subscribe-branded']");//old
        if(bfb.length==0) bfb = document.querySelectorAll("button[class^='yt-uix-button yt-uix-button-size-default yt-uix-button-subscribed-branded']");//old
        if(bfb.length==0) bfb = document.querySelectorAll("button[class^='yt-uix-button yt-uix-button-size-default yt-uix-button-has-icon no-icon-markup yt-uix-subscription-button']");//old
        
        console.log(bfb);
        if(!bfb)return;
        for (let bfb_s of bfb){
                if( bfb_s.previousElementSibling){
                    if( bfb_s.previousElementSibling.id == "youtube_rss_button_added") {
                        //console.log("continue");
                        continue;
                    }
                    
                }
                let rsslink = y2brss_linkrss(); //rss连接
                let nx = document.createElement("a");
                bfb_s.parentNode.insertBefore(nx, bfb_s );
                nx.style.float="left";
            if(rss_sytle == "old"){
                nx.style.marginRight="1px";
                nx.style.marginTop="0px";
                nx.innerHTML = "<img width='24' height='24' src='data:image/gif;base64,R0lGODlhGAAYAIcAMf+/YP+XAP+aAv+aA/+ZAf+ZAP/AYf+XA/+WAP+VAP+UAP+YAP+bBP+ZAv+XBP+hFP+oJ/+rL/+tNP+tMv+qK/+lH/+eC/+SAP+cB//v1//////+/f/9+f/26P/qzP/Ynv+/X/+kG/+TAP+aAf+cCP/05P///v/+/P/79v/fr/+xOv+YAv/rzf/47P/36//79f/9+//89//ao/+dEP+dCf+dDP+gEf+jGv+rLf+1Rv/EbP/Ynf/u1f/+/v/8+P/++//w1/+jH/+rK//Phv/9+v/rzP+aCP+WAf+RAP+fEv/cpv/Je/+bA//Zn//t0f/szv/kvP/Yn//GcP+sL/+cBv+XAv/WmP/z4v+dDv/x2//qy/+4TP+aBf+aC//w2f+5VP/UlP+bBf/DbP/Wmv+aBP/Kff+iHf/68v+wOv+sLv+lIP+mIf+5Uf/bpP/47/+iG//kv//47v+gE/+QAP+PAP+UAv+xPf/57//BZ//OiP+pKv++XP/Fbv+uM//8+f/bpv+9W/+yP/+rMf/15f/NhP+eE//rzv+wO/+4Tv+1SP/mwv+dC/+oJv+6U/+pKP/Tkf/cqf+hFf+iF/+7Vv+nI//Ri//ZoP/58f+iFv/47f/juf+vOP/dq/+eDP/z4/+3S//px//AYv/nw//15/+eDf+fDv/26f+vNf+hFv+0RP+/Xv/Eaf/Fbf+YBf+YAf/AYwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAGAAYAAcI/gABBBAgYIBBggQKKFzIsACBAAYOFAiAIIGCBAkQLCDAgEGDhgsXOPj4AEIECRMoVLAQ4MIFBAZBFmiwAEMGDRs06OTQwcMHECFEKBgwAuQCEiVwajBxIudSDShSqBCxQkDDmixauHihsyuMGCZ0ypiBwGpDGjVs3MCRQ8cOHic09PDxQwOQIGWNBqCYQISIBkKGuNBwgoiGIkY2MkwQYMGCviIQEDiCJIkSnIaXXGDCsImTJyygRJEy5YgCKlWQWNEAQ8MVLIoLCMiitKsJLVtEcFnQxYsGw19EDFAo4GbOEz5ibAgLBkGYC2I0+NAw5gIZ4rRfgNW5AYbhMiIW/pg5o5NFgIUC0KRRsyYNmzYclLp58xiOzjhyAhQtYHEOHSR1IGHHHb9pgIcCIuShQV16JGCVAAgksQcffSSAAR14aOCHBn8ooAAgBQYylAAJCDKIUoQkUEAhg2lgSAEKHMKaBoiIcN0CWmjAARFxJaIAAoroVMIiCTDSlAaNiMBAAo700INOhj0iFCQ63RFJApKQp8EkSiZACQw9hBVfJUJZotMlmCQgRyY6sWHjCAhowlpcGmyCgAKcEBZHJAh04smTn9g4QABvgKLTC6EowAACoug0CikIlGKKTocowIVECDhwSg6oiGBWKo00koMANamyCiuRBNBKKAEM0ACCEa0uJIJLIix0ARJIuLLAKwEBADs='>";
            }else{
                nx.style.marginRight="-2px";
                nx.style.marginTop="3px";
                nx.innerHTML = "<img width='36' height='36' src='data:image/gif;base64,R0lGODlhGAAYAIcAMf+/YP+XAP+aAv+aA/+ZAf+ZAP/AYf+XA/+WAP+VAP+UAP+YAP+bBP+ZAv+XBP+hFP+oJ/+rL/+tNP+tMv+qK/+lH/+eC/+SAP+cB//v1//////+/f/9+f/26P/qzP/Ynv+/X/+kG/+TAP+aAf+cCP/05P///v/+/P/79v/fr/+xOv+YAv/rzf/47P/36//79f/9+//89//ao/+dEP+dCf+dDP+gEf+jGv+rLf+1Rv/EbP/Ynf/u1f/+/v/8+P/++//w1/+jH/+rK//Phv/9+v/rzP+aCP+WAf+RAP+fEv/cpv/Je/+bA//Zn//t0f/szv/kvP/Yn//GcP+sL/+cBv+XAv/WmP/z4v+dDv/x2//qy/+4TP+aBf+aC//w2f+5VP/UlP+bBf/DbP/Wmv+aBP/Kff+iHf/68v+wOv+sLv+lIP+mIf+5Uf/bpP/47/+iG//kv//47v+gE/+QAP+PAP+UAv+xPf/57//BZ//OiP+pKv++XP/Fbv+uM//8+f/bpv+9W/+yP/+rMf/15f/NhP+eE//rzv+wO/+4Tv+1SP/mwv+dC/+oJv+6U/+pKP/Tkf/cqf+hFf+iF/+7Vv+nI//Ri//ZoP/58f+iFv/47f/juf+vOP/dq/+eDP/z4/+3S//px//AYv/nw//15/+eDf+fDv/26f+vNf+hFv+0RP+/Xv/Eaf/Fbf+YBf+YAf/AYwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAGAAYAAcI/gABBBAgYIBBggQKKFzIsACBAAYOFAiAIIGCBAkQLCDAgEGDhgsXOPj4AEIECRMoVLAQ4MIFBAZBFmiwAEMGDRs06OTQwcMHECFEKBgwAuQCEiVwajBxIudSDShSqBCxQkDDmixauHihsyuMGCZ0ypiBwGpDGjVs3MCRQ8cOHic09PDxQwOQIGWNBqCYQISIBkKGuNBwgoiGIkY2MkwQYMGCviIQEDiCJIkSnIaXXGDCsImTJyygRJEy5YgCKlWQWNEAQ8MVLIoLCMiitKsJLVtEcFnQxYsGw19EDFAo4GbOEz5ibAgLBkGYC2I0+NAw5gIZ4rRfgNW5AYbhMiIW/pg5o5NFgIUC0KRRsyYNmzYclLp58xiOzjhyAhQtYHEOHSR1IGHHHb9pgIcCIuShQV16JGCVAAgksQcffSSAAR14aOCHBn8ooAAgBQYylAAJCDKIUoQkUEAhg2lgSAEKHMKaBoiIcN0CWmjAARFxJaIAAoroVMIiCTDSlAaNiMBAAo700INOhj0iFCQ63RFJApKQp8EkSiZACQw9hBVfJUJZotMlmCQgRyY6sWHjCAhowlpcGmyCgAKcEBZHJAh04smTn9g4QABvgKLTC6EowAACoug0CikIlGKKTocowIVECDhwSg6oiGBWKo00koMANamyCiuRBNBKKAEM0ACCEa0uJIJLIix0ARJIuLLAKwEBADs='>";
            }
            nx.setAttribute("id","youtube_rss_button_added");
                nx.setAttribute("href",rsslink);
                console.log("RSS按钮添加完成");
        }

    }catch(e){
        console.log("出错了"+e);
    }
}



let y2brss_linkrss = function(){
    let rss_link_generater = y2brss_lo;
    if(y2brss_lo.href.indexOf('https://www.youtube.com/watch') == 0)
    {
        if(document.querySelector("#owner-name > a")){
            rss_link_generater = document.querySelector("#owner-name > a").href;
        }
        if(document.querySelector("#watch7-user-header > div > a") ){
            rss_link_generater = document.querySelector("#watch7-user-header > div > a").href;
        }
        if(document.querySelector("#top-row > ytd-video-owner-renderer > a") ){
            rss_link_generater = document.querySelector("#top-row > ytd-video-owner-renderer > a").href;
        }
    }
    
    let pattern = /(channel|user)\/(.*?)(?:\/|$)/gi;
    ///(channel|user)\/(.*)\/./gi;
    let x = pattern.exec(rss_link_generater );
   if(x[1] == "user") return ("https://www.youtube.com/feeds/videos.xml?user="+x[2]);
    if(x[1] == "channel") return ("https://www.youtube.com/feeds/videos.xml?channel_id="+x[2]);
}

let y2brss_MutationObserver = window.MutationObserver ||
    window.WebKitMutationObserver ||
    window.MozMutationObserver;
    
let y2brss_observer = new y2brss_MutationObserver(function(mutations)
{
    y2brss_check_url();
});
y2brss_observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});